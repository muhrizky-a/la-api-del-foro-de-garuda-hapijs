class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const repliesPromises = comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
      // return { ...comment, replies };
      comment.replies = replies;
      return comment;
    });

    await Promise.all(repliesPromises);

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
