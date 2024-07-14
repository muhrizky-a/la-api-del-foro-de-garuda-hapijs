const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThreadComment = require('../../../Domains/thread_comments/entities/AddThreadComment');
const NewThreadComment = require('../../../Domains/thread_comments/entities/NewThreadComment');
const pool = require('../../database/postgres/pool');
const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres');

describe('ThreadCommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add thread comment and return recently aded thread correctly', async () => {
      // Arrange
      const addThreadComment = new AddThreadComment({
        content: 'Un Comentario',
      });
      const fakeThreadOwnerId = 'user-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default

      // Action
      await threadCommentRepositoryPostgres.addComment(fakeThreadOwnerId, 'thread-123', addThreadComment);

      // Assert
      const comment = await ThreadCommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return recently added thread comment correctly', async () => {
      // Arrange
      const addThreadComment = new AddThreadComment({
        content: 'Un Comentario',
      });
      const fakeThreadOwnerId = 'user-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default

      // Action
      const newComment = await threadCommentRepositoryPostgres.addComment(fakeThreadOwnerId, 'thread-123', addThreadComment);

      // Assert
      expect(newComment).toStrictEqual(new NewThreadComment({
        id: 'comment-123',
        content: 'Un Comentario',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const nonexistentCommentId = "xxxxx"
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteComment(nonexistentCommentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should delete a comment from database', async () => {
      // Arrange
      const fakeCommentId = 'comment-123'; // stub comment id

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await ThreadCommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default

      // Action
      await threadCommentRepositoryPostgres.deleteComment(fakeCommentId);

      // Assert
      const comments = await ThreadCommentsTableTestHelper.findCommentsById(fakeCommentId);
      expect(comments).toHaveLength(0);
    });
  });
});
