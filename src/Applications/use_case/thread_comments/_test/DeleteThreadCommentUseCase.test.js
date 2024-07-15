const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadCommentRepository = require('../../../../Domains/thread_comments/ThreadCommentRepository');
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');

describe('DeleteThreadCommentUseCase', () => {
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
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(nonexistentThreadId, null))
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
    const mockThreadCommentRepository = new ThreadCommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(userId, threadId, nonexistentCommentId))
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
    const mockThreadCommentRepository = new ThreadCommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('anda tidak berhak mengakses comment ini')));

    // create use case instance
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(unauthorizeUserId, threadId, commentId))
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
    const mockThreadCommentRepository = new ThreadCommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // create use case instance
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    await deleteThreadCommentUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockThreadCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, ownerId);
    expect(mockThreadCommentRepository.verifyCommentOwner).toBeCalledTimes(1);
    expect(mockThreadCommentRepository.deleteComment).toBeCalledWith(commentId);
    expect(mockThreadCommentRepository.deleteComment).toBeCalledTimes(1);
  });
});
