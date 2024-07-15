const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const AuthenticateAccessTokenUseCase = require('../AuthenticateAccessTokenUseCase');

describe('AuthenticateAccessTokenUseCase', () => {
  it('should throw error if use case payload is empty or not exist', async () => {
    // Arrange
    const useCasePayload = undefined;
    const authenticateAccessTokenUseCase = new AuthenticateAccessTokenUseCase({});

    // Action & Assert
    await expect(authenticateAccessTokenUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('AUTHENTICATE_ACCESS_TOKEN_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN');
  });

  it('should throw error if use case payload not string', async () => {
    // Arrange
    const useCasePayload = 123;
    const authenticateAccessTokenUseCase = new AuthenticateAccessTokenUseCase({});

    // Action & Assert
    await expect(authenticateAccessTokenUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('AUTHENTICATE_ACCESS_TOKEN_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if access token fails to verify', async () => {
    // Arrange
    const useCasePayload = 'Bearer wrong_access_token';
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // Mocking
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('access token tidak valid')));

    // create use case instance
    const authenticateAccessTokenUseCase = new AuthenticateAccessTokenUseCase({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(authenticateAccessTokenUseCase.execute(useCasePayload))
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
    const authenticateAccessTokenUseCase = new AuthenticateAccessTokenUseCase({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const credentials = await authenticateAccessTokenUseCase.execute(useCasePayload);

    // Assert
    expect(credentials).toStrictEqual(mockedDecodedAccessToken);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toHaveBeenCalledWith(mockedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toHaveBeenCalledWith(mockedAccessToken);
  });
});
