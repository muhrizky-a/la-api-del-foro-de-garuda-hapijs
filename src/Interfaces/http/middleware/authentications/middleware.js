const AccessTokenAuthenticator = require('../../../../Applications/middleware/authentications/AccessTokenAuthenticator');

class AuthenticationsMiddleware {
  constructor(container) {
    this._container = container;

    this.authenticateAccessTokenHandler = this.authenticateAccessTokenHandler.bind(this);
  }

  async authenticateAccessTokenHandler(request, h) {
    const accessTokenAuthenticator = this._container
      .getInstance(AccessTokenAuthenticator.name);

    const authorizationHeader = request.headers.authorization;
    const credentials = await accessTokenAuthenticator.execute(authorizationHeader);
    return h.authenticated({ credentials });
  }
}

module.exports = AuthenticationsMiddleware;
