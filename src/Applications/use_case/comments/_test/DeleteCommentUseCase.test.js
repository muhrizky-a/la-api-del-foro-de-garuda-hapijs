const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if thread not exist', async () => {
    // Arrange
    const nonexistentThreadId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(nonexistentThreadId, null))
      .rejects
      .toThrowError('thread tidak ditemukan');
  });

  it('should throw error if comment not exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const nonexistentCommentId = 'xxxxx';
    const userId = 'user-123';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, threadId, nonexistentCommentId))
      .rejects
      .toThrowError('comment tidak ditemukan');
  });

  it('should throw error if user not owns the comment', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const unauthorizeUserId = 'user-xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('anda tidak berhak mengakses comment ini')));

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(unauthorizeUserId, threadId, commentId))
      .rejects
      .toThrowError('anda tidak berhak mengakses comment ini');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const ownerId = 'user-123';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

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
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, ownerId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
    expect(mockCommentRepository.deleteComment).toBeCalledTimes(1);
  });
});
