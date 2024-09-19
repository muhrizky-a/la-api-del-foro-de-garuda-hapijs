const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.likeHandler,
    options: {
      auth: 'forumapi_custom_jwt',
    },
  },
]);

module.exports = routes;
