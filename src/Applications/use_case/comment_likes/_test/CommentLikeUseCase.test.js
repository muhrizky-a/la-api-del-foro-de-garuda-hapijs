const ExistingLike = require('../../../../Domains/comment_likes/entities/ExistingLike');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../../Domains/comment_likes/CommentLikeRepository');
const CommentLikeUseCase = require('../CommentLikeUseCase');

describe('CommentLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if thread not exist', async () => {
    // Arrange
    const userId = 'user-123';
    const nonexistentThreadId = 'xxxxx';
    const nonexistentCommentId = 'comment-xxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action & Assert
    await expect(
      commentLikeUseCase.execute(
        userId,
        nonexistentThreadId,
        nonexistentCommentId,
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

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action & Assert
    await expect(
      commentLikeUseCase.execute(
        userId,
        threadId,
        nonexistentCommentId,
      ),
    ).rejects
      .toThrowError('comment tidak ditemukan');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(nonexistentCommentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
  });

  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';
    const mockNonexistentLike = null;

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExists = jest.fn(
      () => Promise.resolve(mockNonexistentLike),
    );
    mockCommentLikeRepository.addLike = jest.fn(() => Promise.resolve());

    // create use case instance
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await commentLikeUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledWith(userId, commentId);
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.addLike).toBeCalledWith(userId, commentId);
    expect(mockCommentLikeRepository.addLike).toBeCalledTimes(1);
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';
    const mockExistingLike = new ExistingLike({
      id: 'comment-like-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExists = jest.fn(() => Promise.resolve(mockExistingLike));
    mockCommentLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    // create use case instance
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await commentLikeUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledWith(userId, commentId);
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(mockExistingLike.id);
    expect(mockCommentLikeRepository.deleteLike).toBeCalledTimes(1);
  });
});
