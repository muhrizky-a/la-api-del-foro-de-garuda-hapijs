class AuthenticateAccessTokenUseCase {
  constructor({
    authenticationTokenManager,
  }) {
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);

    await this._authenticationTokenManager.verifyAccessToken(useCasePayload);
    const { username, id } = await this._authenticationTokenManager.decodePayload(useCasePayload);

    return { username, id };
  }

  _verifyPayload(payload) {
    if (!payload) {
      throw new Error('AUTHENTICATE_ACCESS_TOKEN_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN');
    }

    if (typeof payload !== 'string') {
      throw new Error('AUTHENTICATE_ACCESS_TOKEN_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AuthenticateAccessTokenUseCase;
