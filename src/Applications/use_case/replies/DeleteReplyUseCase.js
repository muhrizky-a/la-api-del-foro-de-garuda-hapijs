class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const existingReply = await this._replyRepository.verifyReplyExists(replyId);
    if (existingReply.owner !== ownerId) {
      throw new Error('DELETE_REPLY_USE_CASE.USER_NOT_AUTHORIZED');
    }

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
