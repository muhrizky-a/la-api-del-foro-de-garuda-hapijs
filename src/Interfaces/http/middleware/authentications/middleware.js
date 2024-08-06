const AuthenticateAccessTokenUseCase = require('../../../../Applications/use_case/authentications/AuthenticateAccessTokenUseCase');

class AuthenticationsMiddleware {
  constructor(container) {
    this._container = container;

    this.authenticateAccessTokenHandler = this.authenticateAccessTokenHandler.bind(this);
  }

  async authenticateAccessTokenHandler(request, h) {
    const authenticateAccessTokenUseCase = this._container
      .getInstance(AuthenticateAccessTokenUseCase.name);

    const accessToken = request.headers.authorization.replace('Bearer ', '');
    const credentials = await authenticateAccessTokenUseCase.execute(accessToken);
    return h.authenticated({ credentials });
  }
}

module.exports = AuthenticationsMiddleware;
