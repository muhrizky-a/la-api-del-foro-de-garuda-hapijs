const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const ExistingComment = require('../../../Domains/comments/entities/ExistingComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return recently added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Un Comentario',
      });
      const fakeThreadOwnerId = 'user-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default

      // Action
      await commentRepositoryPostgres.addComment(fakeThreadOwnerId, 'thread-123', addComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return recently added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Un Comentario',
      });
      const fakeThreadOwnerId = 'user-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default

      // Action
      const newComment = await commentRepositoryPostgres
        .addComment(fakeThreadOwnerId, 'thread-123', addComment);

      // Assert
      expect(newComment).toStrictEqual(new NewComment({
        id: 'comment-123',
        content: 'Un Comentario',
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const nonexistentThreadId = 'thread-xxxxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default

      // Action & Assert
      await expect(commentRepositoryPostgres
        .getCommentsByThreadId(nonexistentThreadId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const fakeThreadId = 'thread-123'; // stub thread id
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({});
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        content: 'Un Comentario Eliminado',
      });
      await CommentsTableTestHelper.deleteComment('comment-234');

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(fakeThreadId);
      const [firstComment, deletedComment] = comments;

      // // Assert
      expect(comments).toContainEqual(
        new Comment({
          id: 'comment-123',
          username: 'dicoding',
          date: firstComment.date,
          content: 'Un Comentario',
          is_delete: false,
        }),
      );
      expect(firstComment).toStrictEqual(
        new Comment({
          id: 'comment-123',
          username: 'dicoding',
          date: firstComment.date,
          content: 'Un Comentario',
          is_delete: false,
        }),
      );

      expect(comments).toContainEqual(
        new Comment({
          id: 'comment-234',
          username: 'dicoding',
          date: deletedComment.date,
          content: '**komentar telah dihapus**',
          is_delete: true,
        }),
      );
      expect(deletedComment).toStrictEqual(
        new Comment({
          id: 'comment-234',
          username: 'dicoding',
          date: deletedComment.date,
          content: '**komentar telah dihapus**',
          is_delete: true,
        }),
      );
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const nonexistentCommentId = 'comment-xxxxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists(nonexistentCommentId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return existing comment correctly', async () => {
      // Arrange
      const commentId = 'comment-123'; // stub comment id
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});

      // Action
      const existingComment = await commentRepositoryPostgres.verifyCommentExists(commentId);

      // Assert
      expect(existingComment).toStrictEqual(
        new ExistingComment({
          id: 'comment-123',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const nonexistentCommentId = 'comment-xxxxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment(nonexistentCommentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should delete a comment from database', async () => {
      // Arrange
      const commentId = 'comment-123'; // stub comment id
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(0);
    });
  });
});
