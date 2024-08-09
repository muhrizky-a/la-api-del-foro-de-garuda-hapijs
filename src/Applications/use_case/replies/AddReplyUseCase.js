const AddReply = require('../../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, threadId, commentId, useCasePayload) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const addReply = new AddReply(useCasePayload);
    return this._replyRepository.addReply(ownerId, commentId, addReply);
  }
}

module.exports = AddReplyUseCase;
