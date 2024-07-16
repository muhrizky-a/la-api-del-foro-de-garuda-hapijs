const NewThread = require('../../Domains/threads/entities/NewThread');
const Thread = require('../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(ownerId, addThread) {
    const { title, body } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, ownerId],
    };

    const result = await this._pool.query(query);

    return new NewThread({ ...result.rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT threads.*, users.username FROM threads
      INNER JOIN users
      ON threads.owner = users.id
      WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return new Thread({ ...result.rows[0] });
  }

  async verifyThreadExists(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE threads.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
