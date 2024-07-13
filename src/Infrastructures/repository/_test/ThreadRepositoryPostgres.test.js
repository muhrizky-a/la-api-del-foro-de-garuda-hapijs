const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return recently aded thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'Un Hilo',
        body: 'Un Contenido',
      });
      const fakeUserId = 'user-123';

      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default

      // Action
      await threadRepositoryPostgres.addThread(fakeUserId, addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return recently added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'Un Hilo',
        body: 'Un Contenido',
      });
      const fakeUserId = 'user-123';

      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default

      // Action
      const newThread = await threadRepositoryPostgres.addThread(fakeUserId, addThread);

      // Assert
      expect(newThread).toStrictEqual(new NewThread({
        id: 'thread-123',
        title: 'Un Hilo',
        owner: 'user-123',
      }));
    });
  });

});
