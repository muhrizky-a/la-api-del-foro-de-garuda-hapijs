const AddThread = require('../../../../Domains/threads/entities/AddThread');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Un Hilo',
      body: 'Un Contenido',
    };
    const mockNewThread = new NewThread({
      id: 'thread-123',
      title: 'Un Hilo',
      owner: 'user-123',
    });
    const ownerId = 'user-123';

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockNewThread));

    // create use case instance
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const newThread = await addThreadUseCase.execute(ownerId, useCasePayload);

    // Assert
    expect(newThread).toStrictEqual(new NewThread({
      id: 'thread-123',
      title: 'Un Hilo',
      owner: 'user-123',
    }));

    expect(mockThreadRepository.addThread)
      .toBeCalledWith(
        ownerId,
        new AddThread({
          title: 'Un Hilo',
          body: 'Un Contenido',
        }),
      );

    expect(mockThreadRepository.addThread).toBeCalledTimes(1);
  });
});
