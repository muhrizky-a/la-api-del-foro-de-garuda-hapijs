const Reply = require('../../Domains/replies/entities/Reply');
const ExistingReply = require('../../Domains/replies/entities/ExistingReply');
const NewReply = require('../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(ownerId, commentId, addReply) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, commentId, ownerId],
    };

    const result = await this._pool.query(query);

    return new NewReply(result.rows[0]);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id,
      replies.id,
      replies.content,
      replies.date,
      replies.is_delete,
      users.username
      FROM replies
      INNER JOIN users
      ON replies.owner = users.id
      WHERE replies.comment_id = $1
      ORDER BY replies.date ASC`,
      values: [commentId],
    };
    const result = await this._pool.query(query);

    return result.rows.map((comment) => new Reply({ ...comment }));
  }

  async verifyReplyExists(id) {
    const query = {
      text: 'SELECT id, owner FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return new ExistingReply(result.rows[0]);
  }

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
