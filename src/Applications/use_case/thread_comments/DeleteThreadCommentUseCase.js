class DeleteThreadCommentUseCase {
    constructor({ threadRepository, threadCommentRepository }) {
        this._threadRepository = threadRepository;
        this._threadCommentRepository = threadCommentRepository;
    }

    async execute(ownerId, threadId, commentId) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._threadCommentRepository.verifyCommentOwner(commentId, ownerId);
        await this._threadCommentRepository.deleteComment(commentId);
    }
}

module.exports = DeleteThreadCommentUseCase;
