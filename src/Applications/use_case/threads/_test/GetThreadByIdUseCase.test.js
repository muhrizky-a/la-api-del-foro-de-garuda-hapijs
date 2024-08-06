const Thread = require('../../../../Domains/threads/entities/Thread');
const Comment = require('../../../../Domains/comments/entities/Comment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');

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
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
    });

    // Action & Assert
    await expect(getThreadByIdUseCase.execute(nonexistentThreadId))
      .rejects
      .toThrowError('thread tidak ditemukan');
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
      is_delete: false,
    });
    const mockComment2 = new Comment({
      id: 'comment-234',
      username: 'john',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario Eliminado',
      is_delete: true,
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new Thread({
          id: threadId,
          title: 'Un Hilo',
          body: 'Un Contenido',
          date: new Date('2021-08-08T07:26:21.338Z'),
          username: 'dicoding',
        }),
      ));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(
        [
          new Comment({
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Un Comentario',
            is_delete: false,
          }),
          new Comment({
            id: 'comment-234',
            username: 'john',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'Un Comentario Eliminado',
            is_delete: true,
          }),
        ],
      ));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getThreadByIdUseCase.execute(threadId);
    const { comments } = thread;
    const [firstComment, deletedComment] = comments;

    // Assert
    expect(thread.id).toStrictEqual(mockThread.id);
    expect(thread.title).toStrictEqual(mockThread.title);
    expect(thread.body).toStrictEqual(mockThread.body);
    expect(thread.date).toStrictEqual(mockThread.date);
    expect(thread.username).toStrictEqual(mockThread.username);

    expect(comments).toContainEqual(
      mockComment1,
    );
    expect(firstComment).toStrictEqual(
      mockComment1,
    );
    expect(comments).toContainEqual(
      mockComment2,
    );
    expect(deletedComment).toStrictEqual(
      mockComment2,
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledTimes(1);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledTimes(1);
  });
});
