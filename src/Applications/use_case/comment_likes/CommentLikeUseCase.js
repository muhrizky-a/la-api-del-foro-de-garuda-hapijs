class CommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    const existingLike = await this._commentLikeRepository.verifyLikeExists(userId, commentId);

    if (existingLike) {
      await this._commentLikeRepository.deleteLike(existingLike.id);
    } else {
      await this._commentLikeRepository.addLike(userId, commentId);
    }
  }
}

module.exports = CommentLikeUseCase;
