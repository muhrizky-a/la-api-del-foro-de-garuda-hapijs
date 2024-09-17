const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const AccessTokenAuthenticator = require('../AccessTokenAuthenticator');

describe('AccessTokenAuthenticator', () => {
  it('should throw error if use case payload is empty or not exist', async () => {
    // Arrange
    const useCasePayload = undefined;
    const accessTokenAuthenticator = new AccessTokenAuthenticator({});

    // Action & Assert
    await expect(accessTokenAuthenticator.execute(useCasePayload))
      .rejects
      .toThrowError('ACCESS_TOKEN_AUTHENTICATOR.NOT_CONTAIN_ACCESS_TOKEN');
  });

  it('should throw error if use case payload not string', async () => {
    // Arrange
    const useCasePayload = 123;
    const accessTokenAuthenticator = new AccessTokenAuthenticator({});

    // Action & Assert
    await expect(accessTokenAuthenticator.execute(useCasePayload))
      .rejects
      .toThrowError('ACCESS_TOKEN_AUTHENTICATOR.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if access token fails to verify', async () => {
    // Arrange
    const useCasePayload = 'Bearer wrong_access_token';
    const splittedAccessToken = 'wrong_access_token';
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // Mocking
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn(() => Promise.reject(new Error('access token tidak valid')));

    // create use case instance
    const accessTokenAuthenticator = new AccessTokenAuthenticator({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(accessTokenAuthenticator.execute(useCasePayload))
      .rejects
      .toThrowError('access token tidak valid');
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledWith(splittedAccessToken);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledTimes(1);
  });

  it('should orchestrating the authentication of access token action correctly', async () => {
    // Arrange
    const useCasePayload = 'Bearer access_token';
    const splittedAccessToken = 'access_token';
    const mockedDecodedAccessToken = {
      username: 'username',
      id: 'user-123',
    };
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // Mocking
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn(
      () => Promise.resolve(mockedDecodedAccessToken),
    );

    // create use case instance
    const accessTokenAuthenticator = new AccessTokenAuthenticator({
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const credentials = await accessTokenAuthenticator.execute(useCasePayload);

    // Assert
    expect(credentials).toStrictEqual(mockedDecodedAccessToken);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toHaveBeenCalledWith(splittedAccessToken);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledTimes(1);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toHaveBeenCalledWith(splittedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledTimes(1);
  });
});
