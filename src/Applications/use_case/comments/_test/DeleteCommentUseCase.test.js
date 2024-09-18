const ExistingComment = require('../../../../Domains/comments/entities/ExistingComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
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

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, nonexistentThreadId, nonexistentCommentId))
      .rejects
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

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, threadId, nonexistentCommentId))
      .rejects
      .toThrowError('comment tidak ditemukan');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(nonexistentCommentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
  });

  it('should throw error if user not owns the comment', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const unauthorizeUserId = 'user-xxxxx';
    const mockExistingComment = new ExistingComment({
      id: 'comment-123',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve(mockExistingComment));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(unauthorizeUserId, threadId, commentId))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.USER_NOT_AUTHORIZED');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const ownerId = 'user-123';
    const mockExistingComment = new ExistingComment({
      id: 'comment-123',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve(mockExistingComment));
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
    expect(mockCommentRepository.deleteComment).toBeCalledTimes(1);
  });
});
