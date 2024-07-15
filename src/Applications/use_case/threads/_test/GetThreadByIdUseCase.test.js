const Thread = require('../../../../Domains/threads/entities/Thread');
const ThreadComment = require('../../../../Domains/thread_comments/entities/ThreadComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadCommentRepository = require('../../../../Domains/thread_comments/ThreadCommentRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');

describe('GetThreadByIdUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if thread not exist', async () => {
    // Arrange
    const nonexistentThreadId = "xxxxx"

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('thread tidak ditemukan')));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: {},
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
      title: "Un Hilo",
      body: "Un Contenido",
      date: new Date('2021-08-08T07:26:21.338Z'),
      username: "dicoding",
    });
    const mockThreadComment1 = new ThreadComment({
      id: 'comment-123',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario',
      is_delete: false,
    });
    const mockThreadComment2 = new ThreadComment({
      id: 'comment-234',
      username: 'john',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'Un Comentario Eliminado',
      is_delete: true,
    });

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockThreadCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(
        [
          mockThreadComment1,
          mockThreadComment2
        ]
      ));

    // create use case instance
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const { thread, comments } = await getThreadByIdUseCase.execute(threadId);
    const [firstComment, deletedComment] = comments

    // Assert
    expect(thread).toStrictEqual(
      new Thread({
        id: 'thread-123',
        title: "Un Hilo",
        body: "Un Contenido",
        date: new Date('2021-08-08T07:26:21.338Z'),
        username: "dicoding",
      })
    );

    expect(comments).toContainEqual(
      new ThreadComment({
        id: 'comment-123',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'Un Comentario',
        is_delete: false,
      })
    );
    expect(firstComment).toStrictEqual(
      new ThreadComment({
        id: 'comment-123',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'Un Comentario',
        is_delete: false,
      })
    );
    expect(comments).toContainEqual(
      new ThreadComment({
        id: 'comment-234',
        username: 'john',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'Un Comentario Eliminado',
        is_delete: true,
      })
    );
    expect(deletedComment).toStrictEqual(
      new ThreadComment({
        id: 'comment-234',
        username: 'john',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'Un Comentario Eliminado',
        is_delete: true,
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledTimes(1);
    expect(mockThreadCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockThreadCommentRepository.getCommentsByThreadId).toBeCalledTimes(1);
  });
});
