class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((comment) => comment.id);
    const repliesPromises = commentIds.map((id) => this._replyRepository.getRepliesByCommentId(id));
    const repliesResults = await Promise.all(repliesPromises);

    // Map replies back to comments
    comments.forEach((comment) => {
      comment.replies = repliesResults[commentIds.indexOf(comment.id)];
    });

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
