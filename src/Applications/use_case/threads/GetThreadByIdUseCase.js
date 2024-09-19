class GetThreadByIdUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((comment) => comment.id);

    // Fetch replies
    const repliesPromises = commentIds.map((id) => this._replyRepository.getRepliesByCommentId(id));
    const repliesResults = await Promise.all(repliesPromises);

    // Map replies to comments
    comments.forEach((comment) => {
      comment.replies = repliesResults[commentIds.indexOf(comment.id)];
    });

    // Fetch like count
    const likesPromises = commentIds.map((id) => this._commentLikeRepository.getLikeCount(id));
    const likesResults = await Promise.all(likesPromises);

    // // Map like count to comments
    comments.forEach((comment) => {
      const like = likesResults[commentIds.indexOf(comment.id)];
      comment.likeCount = like.count;
    });

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
