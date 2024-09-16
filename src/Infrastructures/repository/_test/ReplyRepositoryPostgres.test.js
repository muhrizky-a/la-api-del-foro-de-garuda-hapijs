const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ExistingReply = require('../../../Domains/replies/entities/ExistingReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return recently added reply correctly', async () => {
      // Arrange
      const addComment = new AddReply({
        content: 'Una Respuesta',
      });
      const fakeReplyOwnerId = 'user-123'; // stub user id of the thread owner
      const commentId = 'comment-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default

      // Action
      await replyRepositoryPostgres.addReply(fakeReplyOwnerId, commentId, addComment);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return recently added reply correctly', async () => {
      // Arrange
      const addComment = new AddReply({
        content: 'Una Respuesta',
      });
      const fakeReplyOwnerId = 'user-123'; // stub user id of the thread owner
      const commentId = 'comment-123'; // stub user id of the thread owner

      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default

      // Action
      const newReply = await replyRepositoryPostgres.addReply(
        fakeReplyOwnerId,
        commentId,
        addComment,
      );

      // Assert
      expect(newReply).toStrictEqual(new NewReply({
        id: 'reply-123',
        content: 'Una Respuesta',
        owner: 'user-123',
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty when comment not found', async () => {
      // Arrange
      const nonexistentCommentId = 'comment-xxxxx';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default

      // Action & Assert
      await expect(replyRepositoryPostgres
        .getRepliesByCommentId(nonexistentCommentId))
        .resolves
        .toHaveLength(0);
    });

    it('should return replies correctly', async () => {
      // Arrange
      const fakeCommentId = 'comment-123'; // stub thread id
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, fakeIdGenerator,
      );
      await UsersTableTestHelper.addUser({}); // memasukan user baru dengan data default
      await ThreadsTableTestHelper.addThread({}); // memasukan thread baru dengan data default
      await CommentsTableTestHelper.addComment({}); // memasukan comment baru dengan data default
      await RepliesTableTestHelper.addReply({}); // memasukan balasan baru dengan data default
      await RepliesTableTestHelper.addReply({
        id: 'reply-234',
        content: 'Una Respuesta Eliminado',
      });
      await RepliesTableTestHelper.deleteReply('reply-234');

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(fakeCommentId);
      const [firstReply, deletedReply] = replies;

      // // Assert
      expect(replies).toContainEqual(
        new Reply({
          id: 'reply-123',
          username: 'dicoding',
          date: firstReply.date,
          content: 'Una Respuesta',
          is_delete: false,
        }),
      );
      expect(firstReply).toStrictEqual(
        new Reply({
          id: 'reply-123',
          username: 'dicoding',
          date: firstReply.date,
          content: 'Una Respuesta',
          is_delete: false,
        }),
      );

      expect(replies).toContainEqual(
        new Reply({
          id: 'reply-234',
          username: 'dicoding',
          date: deletedReply.date,
          content: '**balasan telah dihapus**',
          is_delete: true,
        }),
      );
      expect(deletedReply).toStrictEqual(
        new Reply({
          id: 'reply-234',
          username: 'dicoding',
          date: deletedReply.date,
          content: '**balasan telah dihapus**',
          is_delete: true,
        }),
      );
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const nonexistentReplyId = 'reply-xxxxx';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists(nonexistentReplyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return existing reply correctly', async () => {
      // Arrange
      const replyId = 'reply-123'; // stub reply id
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});
      /// memasukan comment baru dengan data default
      await RepliesTableTestHelper.addReply({});

      // Action
      const existingReply = await replyRepositoryPostgres.verifyReplyExists(replyId);

      // Assert
      expect(existingReply).toStrictEqual(
        new ExistingReply({
          id: 'reply-123',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteReply function', () => {
    it('should delete a reply from database', async () => {
      // Arrange
      const replyId = 'reply-123'; // stub reply id
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      /// memasukan user baru dengan data default
      await UsersTableTestHelper.addUser({});
      /// memasukan thread baru dengan data default
      await ThreadsTableTestHelper.addThread({});
      /// memasukan comment baru dengan data default
      await CommentsTableTestHelper.addComment({});
      /// memasukan balasan baru dengan data default
      await RepliesTableTestHelper.addReply({});

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      const [deletedReply] = replies;

      expect(replies).toHaveLength(1);
      expect(replies).toContainEqual({
        id: 'reply-123',
        comment_id: 'comment-123',
        owner: 'user-123',
        date: deletedReply.date,
        content: 'Una Respuesta',
        is_delete: true,
      });
      expect(deletedReply).toStrictEqual({
        id: 'reply-123',
        comment_id: 'comment-123',
        owner: 'user-123',
        date: deletedReply.date,
        content: 'Una Respuesta',
        is_delete: true,
      });
    });
  });
});
