const AddThreadCommentUseCase = require('../../../../Applications/use_case/thread_comments/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/thread_comments/DeleteThreadCommentUseCase');

class ThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
  }

  async postThreadCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const addedComment = await addThreadCommentUseCase.execute(ownerId, threadId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
    await deleteThreadCommentUseCase.execute(ownerId, threadId, commentId);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = ThreadCommentsHandler;
