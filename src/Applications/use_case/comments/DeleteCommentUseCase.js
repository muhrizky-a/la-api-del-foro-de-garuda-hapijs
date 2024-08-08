class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, threadId, commentId) {
    await this._threadRepository.verifyThreadExists(threadId);

    const existingComment = await this._commentRepository.verifyCommentExists(commentId);
    if (existingComment.owner !== ownerId) {
      throw new Error('DELETE_COMMENT_USE_CASE.USER_NOT_AUTHORIZED');
    }

    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
