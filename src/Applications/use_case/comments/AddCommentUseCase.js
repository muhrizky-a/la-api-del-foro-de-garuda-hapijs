const AddComment = require('../../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, threadId, useCasePayload) {
    await this._threadRepository.verifyThreadExists(threadId);

    const addThread = new AddComment(useCasePayload);
    return this._commentRepository.addComment(ownerId, threadId, addThread);
  }
}

module.exports = AddCommentUseCase;
