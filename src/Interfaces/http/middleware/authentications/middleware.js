const AuthenticateAccessTokenUseCase = require('../../../../Applications/use_case/authentications/AuthenticateAccessTokenUseCase');

class AuthenticationsMiddleware {
  constructor(container) {
    this._container = container;

    this.authenticateAccessTokenHandler = this.authenticateAccessTokenHandler.bind(this);
  }

  async authenticateAccessTokenHandler(request, h) {
    const authenticateAccessTokenUseCase = this._container.getInstance(AuthenticateAccessTokenUseCase.name);
    const credentials = await authenticateAccessTokenUseCase.execute(request.headers.authorization);
    return h.authenticated({ credentials });
  }

  // async authorizeUserAccessHandler(request, h) {
  // }

}

module.exports = AuthenticationsMiddleware;
