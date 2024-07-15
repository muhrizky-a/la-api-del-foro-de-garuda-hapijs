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
    // Credentials taken from decoded JWT
    const mockCredentials = {
      id: 'user-123',
      username: 'dicoding',
    };

    // create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewThread));

    // create use case instance
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const newThread = await addThreadUseCase
      .execute(mockCredentials.id, useCasePayload);

    // Assert
    expect(newThread).toStrictEqual(new NewThread({
      id: 'thread-123',
      title: 'Un Hilo',
      owner: 'user-123',
    }));

    expect(mockThreadRepository.addThread)
      .toBeCalledWith(
        mockCredentials.id,
        new AddThread({
          title: 'Un Hilo',
          body: 'Un Contenido',
        }),
      );

    expect(mockThreadRepository.addThread).toBeCalledTimes(1);
  });
});
