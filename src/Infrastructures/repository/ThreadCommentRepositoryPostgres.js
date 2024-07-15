const ThreadComment = require('../../Domains/thread_comments/entities/ThreadComment');
const NewThreadComment = require('../../Domains/thread_comments/entities/NewThreadComment');
const ThreadCommentRepository = require('../../Domains/thread_comments/ThreadCommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');


class ThreadCommentRepositoryPostgres extends ThreadCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(ownerId, threadId, addComment) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, ownerId],
    };

    const result = await this._pool.query(query);

    return new NewThreadComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT thread_comments.id,
      thread_comments.id,
      thread_comments.content,
      thread_comments.date,
      thread_comments.is_delete,
      users.username
      FROM thread_comments
      INNER JOIN users
      ON thread_comments.owner = users.id
      WHERE thread_comments.thread_id = $1
      ORDER BY thread_comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    return result.rows.map(comment => new ThreadComment({ ...comment }));
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
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
      text: 'UPDATE thread_comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
}

module.exports = ThreadCommentRepositoryPostgres;
