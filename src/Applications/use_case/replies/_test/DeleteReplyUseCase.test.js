const ExistingReply = require('../../../../Domains/replies/entities/ExistingReply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if thread not exist', async () => {
    // Arrange
    const userId = 'user-123';
    const nonexistentThreadId = 'xxxxx';
    const nonexistentCommentId = 'xxxxx';
    const nonexistentReplyId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
      replyRepository: {},
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        userId,
        nonexistentThreadId,
        nonexistentCommentId,
        nonexistentReplyId,
      ),
    ).rejects
      .toThrowError('thread tidak ditemukan');

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(nonexistentThreadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
  });

  it('should throw error if comment not exist', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const nonexistentCommentId = 'xxxxx';
    const nonexistentReplyId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(userId, threadId, nonexistentCommentId, nonexistentReplyId),
    ).rejects
      .toThrowError('comment tidak ditemukan');

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(nonexistentCommentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
  });

  it('should throw error if reply not exist', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const nonexistentReplyId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = jest.fn(() => Promise.reject(new Error('balasan tidak ditemukan')));

    // create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(userId, threadId, commentId, nonexistentReplyId),
    ).rejects
      .toThrowError('balasan tidak ditemukan');

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(nonexistentReplyId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledTimes(1);
  });

  it('should throw error if user not owns the comment', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const unauthorizeUserId = 'user-xxxxx';
    const mockExistingReply = new ExistingReply({
      id: 'reply-123',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = jest.fn(() => Promise.resolve(mockExistingReply));

    // create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(unauthorizeUserId, threadId, commentId, replyId))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.USER_NOT_AUTHORIZED');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledTimes(1);
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const ownerId = 'user-123';
    const mockExistingReply = new ExistingReply({
      id: 'reply-123',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = jest.fn(() => Promise.resolve(mockExistingReply));
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    // create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(ownerId, threadId, commentId, replyId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledTimes(1);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
    expect(mockReplyRepository.deleteReply).toBeCalledTimes(1);
  });
});
