const AddComment = require('../../../../Domains/comments/entities/AddComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
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
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(null, nonexistentThreadId, {}))
      .rejects
      .toThrowError('thread tidak ditemukan');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(nonexistentThreadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Un Comentario',
    };
    const ownerId = 'user-123';
    const threadId = 'thread-123';
    const mockNewComment = new NewComment({
      id: 'comment-123',
      content: 'Un Comentario',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewComment));

    // create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const newComment = await addCommentUseCase
      .execute(
        ownerId,
        threadId,
        useCasePayload,
      );

    // Assert
    expect(newComment).toStrictEqual(new NewComment({
      id: 'comment-123',
      content: 'Un Comentario',
      owner: 'user-123',
    }));

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.addComment)
      .toBeCalledWith(
        'user-123',
        'thread-123',
        new AddComment({
          content: 'Un Comentario',
        }),
      );
    expect(mockCommentRepository.addComment).toBeCalledTimes(1);
  });
});
