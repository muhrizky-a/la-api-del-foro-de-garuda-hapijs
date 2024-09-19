/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addLike({
    id = 'comment-like-123',
    commentId = 'comment-123',
    userId = 'user-123',
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await pool.query(query);
  },

  async findLikeByUserIdAndCommentId(userId, commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteLike(id) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1 RETURNING id',
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
