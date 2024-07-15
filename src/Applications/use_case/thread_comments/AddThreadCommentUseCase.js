const AddThreadComment = require('../../../Domains/thread_comments/entities/AddThreadComment');

class AddThreadCommentUseCase {
  constructor({ threadRepository, threadCommentRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(ownerId, threadId, useCasePayload) {
    await this._threadRepository.verifyThreadExists(threadId);

    const addThread = new AddThreadComment(useCasePayload);
    return this._threadCommentRepository.addComment(ownerId, threadId, addThread);
  }
}

module.exports = AddThreadCommentUseCase;
