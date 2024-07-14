class AuthenticateAccessTokenUseCase {
  constructor({
    authenticationTokenManager,
  }) {
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);

    const accessToken = await this._splitAccessToken(useCasePayload);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { username, id } = await this._authenticationTokenManager.decodePayload(accessToken);

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

  async _splitAccessToken(payload) {
    const accessToken = payload.replace('Bearer ', '');
    return accessToken;
  }
}

module.exports = AuthenticateAccessTokenUseCase;
