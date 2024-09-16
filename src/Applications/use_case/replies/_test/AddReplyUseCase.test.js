const AddReply = require('../../../../Domains/replies/entities/AddReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
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
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
      replyRepository: {},
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(null, nonexistentThreadId, {}, {}),
    ).rejects
      .toThrowError('thread tidak ditemukan');

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(nonexistentThreadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
  });

  it('should throw error if comment not exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const nonexistentCommentId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('comment tidak ditemukan')));

    // create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(null, threadId, nonexistentCommentId, {}),
    ).rejects
      .toThrowError('comment tidak ditemukan');

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(nonexistentCommentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const ownerId = 'user-123';
    const useCasePayload = {
      content: 'Una Respuesta',
    };
    const mockNewReply = new NewReply({
      id: 'reply-123',
      content: 'Una Respuesta',
      owner: 'user-123',
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewReply));

    // create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const newReply = await addReplyUseCase
      .execute(
        ownerId,
        threadId,
        commentId,
        useCasePayload,
      );

    // Assert
    expect(newReply).toStrictEqual(new NewReply({
      id: 'reply-123',
      content: 'Una Respuesta',
      owner: 'user-123',
    }));

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledTimes(1);
    expect(mockReplyRepository.addReply)
      .toBeCalledWith(
        ownerId,
        commentId,
        new AddReply({
          content: 'Una Respuesta',
        }),
      );
    expect(mockReplyRepository.addReply).toBeCalledTimes(1);
  });
});
