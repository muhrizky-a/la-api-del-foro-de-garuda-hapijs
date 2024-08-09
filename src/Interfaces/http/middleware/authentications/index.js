const AuthenticationsMiddleware = require('./middleware');

module.exports = {
  name: 'authenticationsMiddleware',
  register: async (server, { container }) => {
    const authenticationsMiddleware = new AuthenticationsMiddleware(container);

    const authenticationScheme = () => ({
      authenticate: authenticationsMiddleware.authenticateAccessTokenHandler,
    });

    server.auth.scheme('forumapi_custom_scheme', authenticationScheme);
    server.auth.strategy('forumapi_custom_jwt', 'forumapi_custom_scheme');
  },
};
