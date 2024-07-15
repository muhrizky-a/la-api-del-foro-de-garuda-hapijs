class GetThreadByIdUseCase {
  constructor({ threadRepository, threadCommentRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._threadCommentRepository.getCommentsByThreadId(threadId);
    return { thread, comments };
  }
}

module.exports = GetThreadByIdUseCase;
