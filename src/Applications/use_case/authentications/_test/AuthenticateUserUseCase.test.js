const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const AuthenticateUserUseCase = require('../AuthenticateUserUseCase');

describe('AuthenticateUserUseCase', () => {
  it('should throw error if use case payload is empty or not exist', async () => {
    // Arrange
    const useCasePayload = undefined;
    const authenticateUserUseCase = new AuthenticateUserUseCase({});

    // Action & Assert
    await expect(authenticateUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('AUTHENTICATE_USER_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN');
  });

  it('should throw error if use case payload not string', async () => {
    // Arrange
    const useCasePayload = 123;
    const authenticateUserUseCase = new AuthenticateUserUseCase({});

    // Action & Assert
    await expect(authenticateUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('AUTHENTICATE_USER_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if access token fails to verify', async () => {
    // Arrange
    const useCasePayload = 'Bearer wrong_access_token';
    const mockedAccessToken = 'access_token';
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // Mocking 
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('access token tidak valid')));

    // create use case instance
    const authenticateUserUseCase = new AuthenticateUserUseCase({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(authenticateUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('access token tidak valid');
  });

  it('should orchestrating the authentication of access token action correctly', async () => {
    // Arrange
    const useCasePayload = 'Bearer access_token';
    const mockedAccessToken = 'access_token';
    const mockedDecodedAccessToken = {
      username: 'username',
      id: 'user-123',
    };
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // Mocking
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedDecodedAccessToken));

    // create use case instance
    const authenticateUserUseCase = new AuthenticateUserUseCase({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const credentials = await authenticateUserUseCase.execute(useCasePayload);

    // Assert
    expect(credentials).toStrictEqual(mockedDecodedAccessToken);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toHaveBeenCalledWith(mockedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toHaveBeenCalledWith(mockedAccessToken);
  });
});
