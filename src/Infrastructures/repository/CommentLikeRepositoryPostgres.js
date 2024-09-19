const ExistingLike = require('../../Domains/comment_likes/entities/ExistingLike');
const Like = require('../../Domains/comment_likes/entities/Like');
const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(userId, commentId) {
    const id = `comment-like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async getLikeCount(commentId) {
    const query = {
      text: `SELECT COUNT(*)
      FROM comment_likes
      WHERE comment_id = $1`,
      values: [commentId],
    };
    const result = await this._pool.query(query);

    return new Like(result.rows[0]);
  }

  async verifyLikeExists(userId, commentId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null
    }

    return new ExistingLike(result.rows[0]);
  }

  async deleteLike(id) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;
