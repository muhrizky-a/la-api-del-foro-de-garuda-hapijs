const Comment = require('../../Domains/comments/entities/Comment');
const NewComment = require('../../Domains/comments/entities/NewComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(ownerId, threadId, addComment) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, ownerId],
    };

    const result = await this._pool.query(query);

    return new NewComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id,
      comments.id,
      comments.content,
      comments.date,
      comments.is_delete,
      users.username
      FROM comments
      INNER JOIN users
      ON comments.owner = users.id
      WHERE comments.thread_id = $1
      ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    return result.rows.map((comment) => new Comment({ ...comment }));
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses comment ini');
    }
  }

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
