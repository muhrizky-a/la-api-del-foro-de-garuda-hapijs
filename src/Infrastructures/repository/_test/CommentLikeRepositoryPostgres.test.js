const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const ExistingLike = require('../../../Domains/comment_likes/entities/ExistingLike');
const Like = require('../../../Domains/comment_likes/entities/Like');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like and return recently added comment correctly', async () => {
      // Arrange
      const fakeUserId = 'user-123'; // stub user id
      const commentId = 'comment-123'; // stub comment id

      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default

      // Action
      await commentLikeRepositoryPostgres.addLike(fakeUserId, commentId);

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeByUserIdAndCommentId(fakeUserId, commentId);
      const [like] = likes;

      expect(likes).toHaveLength(1);
      expect(likes).toContainEqual({
        id: 'comment-like-123',
        user_id: 'user-123',
        comment_id: 'comment-123',
        date: like.date,
      });
      expect(like).toStrictEqual({
        id: 'comment-like-123',
        user_id: 'user-123',
        comment_id: 'comment-123',
        date: like.date,
      });
    });
  });

  describe('getLikeCount function', () => {
    it('should return 0 when comment not found', async () => {
      // Arrange
      const nonexistentCommentId = 'comment-xxxxx';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCount(nonexistentCommentId);

      // Assert
      expect(result).toStrictEqual(
        new Like({ count: '0' }),
      );
      expect(result.count).toStrictEqual(0);
    });

    it('should return 1 like count', async () => {
      // Arrange
      const fakeUserId = 'user-123'; // stub user id
      const commentId = 'comment-123'; // stub comment id

      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default
      await commentLikeRepositoryPostgres.addLike(fakeUserId, commentId);

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCount(commentId);

      // Assert
      expect(result).toStrictEqual(
        new Like({ count: '1' }),
      );
      expect(result.count).toStrictEqual(1);
    });

  });

  describe('verifyLikeExists function', () => {
    it('should return null when user not found', async () => {
      // Arrange
      const nonexistentUserId = 'user-xxxxx';
      const commentId = 'comment-123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.verifyLikeExists(nonexistentUserId, commentId);

      // Assert
      expect(result).toStrictEqual(null);
    });

    it('should return null when comment not found', async () => {
      // Arrange
      const userId = 'user-123';
      const nonexistentCommentId = 'comment-xxxxx';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.verifyLikeExists(userId, nonexistentCommentId);

      // Assert
      expect(result).toStrictEqual(null);
    });

    it('should return existing like correctly', async () => {
      // Arrange
      const userId = 'user-123'; // stub user id
      const commentId = 'comment-123'; // stub comment id
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});
      /// like comment baru dengan data default
      await CommentLikesTableTestHelper.addLike({});

      // Action
      const result = await commentLikeRepositoryPostgres.verifyLikeExists(userId, commentId);

      // Assert
      expect(result).toStrictEqual(
        new ExistingLike({
          id: 'comment-like-123',
        }),
      );
    });
  });

  describe('deleteLike function', () => {
    it('should delete a like from database', async () => {
      // Arrange
      const userId = 'user-123'; // stub user id
      const commentId = 'comment-123'; // stub comment id
      const likeId = 'comment-like-123'; // stub like id
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});
      /// like comment baru dengan data default
      await CommentLikesTableTestHelper.addLike({});

      // Action
      await commentLikeRepositoryPostgres.deleteLike(likeId);


      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeByUserIdAndCommentId(userId, commentId);
      expect(likes).toHaveLength(0);
    });
  });
});
