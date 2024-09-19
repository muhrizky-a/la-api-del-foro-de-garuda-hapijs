const CommentLikeUseCase = require('../../../../Applications/use_case/comment_likes/CommentLikeUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.likeHandler = this.likeHandler.bind(this);
  }

  async likeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const commentLikeUseCase = this._container.getInstance(CommentLikeUseCase.name);
    await commentLikeUseCase.execute(userId, threadId, commentId);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = CommentLikesHandler;
