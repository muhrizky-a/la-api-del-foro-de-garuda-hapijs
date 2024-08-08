const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
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

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const nonexistentThreadId = 'thread-xxxxx';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(nonexistentThreadId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123'
      /// memasukan user baru dengan data default (id: user-123)
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default (ownerId: user-123)
      await ThreadsTableTestHelper.addThread({});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadId);

      // // Assert
      expect(thread).toStrictEqual(new Thread({
        id: 'thread-123',
        title: 'Un Hilo',
        body: 'Un Contenido',
        username: 'dicoding',
        date: thread.date,
      }));
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-xxxxx'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      /// memasukan user baru dengan data default (id: user-123)
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default (ownerId: user-123)
      await ThreadsTableTestHelper.addThread({});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
});
