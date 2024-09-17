const Thread = require('../../../../Domains/threads/entities/Thread');
const Comment = require('../../../../Domains/comments/entities/Comment');
const Reply = require('../../../../Domains/replies/entities/Reply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

describe('GetThreadByIdUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if thread not exist', async () => {
    // Arrange
    const nonexistentThreadId = 'xxxxx';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
    });

    // Action & Assert
    await expect(getThreadByIdUseCase.execute(nonexistentThreadId))
      .rejects
      .toThrowError('thread tidak ditemukan');
    expect(mockThreadRepository.getThreadById).toBeCalledWith(nonexistentThreadId);
    expect(mockThreadRepository.getThreadById).toBeCalledTimes(1);
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = new Thread({
      id: threadId,
      title: 'Un Hilo',
      body: 'Un Contenido',
      date: new Date('2021-08-08T07:26:21.338Z'),
      username: 'dicoding',
    });
    const mockComment1 = new Comment({
      id: 'comment-123',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario',
      owner: 'user-123',
      is_delete: false,
    });
    const mockComment2 = new Comment({
      id: 'comment-234',
      username: 'john',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario',
      owner: 'user-234',
      is_delete: false,
    });
    const mockComment3 = new Comment({
      id: 'comment-345',
      username: 'john',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario Eliminado',
      owner: 'user-234',
      is_delete: true,
    });
    const mockReply1ofComment1 = new Reply({
      id: 'reply-123',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Una Respuesta',
      is_delete: false,
    });
    const mockReply2ofComment1 = new Reply({
      id: 'reply-234',
      username: 'john',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Una Respuesta',
      is_delete: true,
    });
    mockComment1.replies = [mockReply1ofComment1, mockReply2ofComment1];
    mockComment2.replies = [];
    mockComment3.replies = [];

    const expectedThread = {
      ...mockThread,
      comments: [
        mockComment1,
        mockComment2,
        mockComment3,
      ],
    };

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn(
      () => Promise.resolve(
        new Thread({
          id: threadId,
          title: 'Un Hilo',
          body: 'Un Contenido',
          date: new Date('2021-08-08T07:26:21.338Z'),
          username: 'dicoding',
        }),
      ),
    );

    /// mocking comment with reply, comment without reply, and deleted comment
    mockCommentRepository.getCommentsByThreadId = jest.fn(
      () => Promise.resolve(
        [
          new Comment({
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Un Comentario',
            owner: 'user-123',
            is_delete: false,
          }),
          new Comment({
            id: 'comment-234',
            username: 'john',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Un Comentario',
            owner: 'user-234',
            is_delete: false,
          }),
          new Comment({
            id: 'comment-345',
            username: 'john',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Un Comentario Eliminado',
            owner: 'user-234',
            is_delete: true,
          }),
        ],
      ),
    );
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(
        [
          new Reply({
            id: 'reply-123',
            username: 'dicoding',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Una Respuesta',
            is_delete: false,
          }),
          new Reply({
            id: 'reply-234',
            username: 'john',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Una Respuesta',
            is_delete: true,
          }),
        ],
      ))
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => Promise.resolve([]));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getThreadByIdUseCase.execute(threadId);
    const { comments } = thread;
    const [commentWithReply, commentWithoutReply, deletedComment] = comments;
    const [firstReply, deletedReply] = commentWithReply.replies;

    // Assert
    expect(thread).toStrictEqual(expectedThread);

    expect(comments).toContainEqual(mockComment1);
    expect(commentWithReply).toStrictEqual(mockComment1);
    expect(comments).toContainEqual(mockComment2);
    expect(commentWithoutReply).toStrictEqual(mockComment2);
    expect(comments).toContainEqual(mockComment3);
    expect(deletedComment).toStrictEqual(mockComment3);
    expect(firstReply).toStrictEqual(mockReply1ofComment1);
    expect(deletedReply).toStrictEqual(mockReply2ofComment1);

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledTimes(1);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-234');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-345');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(3);
  });
});
