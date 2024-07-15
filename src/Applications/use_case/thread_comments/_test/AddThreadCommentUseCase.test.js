const AddThreadComment = require('../../../../Domains/thread_comments/entities/AddThreadComment');
const NewThreadComment = require('../../../../Domains/thread_comments/entities/NewThreadComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadCommentRepository = require('../../../../Domains/thread_comments/ThreadCommentRepository');
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');

describe('AddThreadCommentUseCase', () => {
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
    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: {},
    });

    // Action & Assert
    await expect(addThreadCommentUseCase.execute(null, nonexistentThreadId, {}))
      .rejects
      .toThrowError('thread tidak ditemukan');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Un Comentario',
    };
    const mockNewThreadComment = new NewThreadComment({
      id: 'comment-123',
      content: 'Un Comentario',
      owner: 'user-123',
    });
    // Credentials taken from decoded JWT
    const mockCredentials = {
      id: 'user-123',
      username: 'dicoding',
    };

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewThreadComment));

    // create use case instance
    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const newComment = await addThreadCommentUseCase
      .execute(
        mockCredentials.id,
        'thread-123',
        useCasePayload,
      );

    // Assert
    expect(newComment).toStrictEqual(new NewThreadComment({
      id: 'comment-123',
      content: 'Un Comentario',
      owner: 'user-123',
    }));

    expect(mockThreadCommentRepository.addComment)
      .toBeCalledWith(
        mockCredentials.id,
        'thread-123',
        new AddThreadComment({
          content: 'Un Comentario',
        }),
      );

    expect(mockThreadCommentRepository.addComment).toBeCalledTimes(1);
  });
});
