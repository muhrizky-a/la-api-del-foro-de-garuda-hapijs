const AuthenticateUserUseCase = require('../../../../Applications/use_case/authentications/AuthenticateUserUseCase');

class AuthenticationsMiddleware {
  constructor(container) {
    this._container = container;

    this.authenticateUserHandler = this.authenticateUserHandler.bind(this);
  }

  async authenticateUserHandler(request, h) {
    const authenticateUserUseCase = this._container.getInstance(AuthenticateUserUseCase.name);
    const credentials = await authenticateUserUseCase.execute(request.headers.authorization);
    return h.authenticated({ credentials });
  }

  // async authorizeUserAccessHandler(request, h) {
  // }

}

module.exports = AuthenticationsMiddleware;
