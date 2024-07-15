const GetThreadByIdUseCase = require('../../../../Applications/use_case/threads/GetThreadByIdUseCase');
const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id } = request.auth.credentials;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(id, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;

    const getThreadByIdUseCase = this._container.getInstance(GetThreadByIdUseCase.name);
    const { thread, comments } = await getThreadByIdUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread: {
          ...thread,
          comments
        },
      },
    });
    return response;
  }
}

module.exports = ThreadsHandler;
