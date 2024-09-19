const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentLikeRepository = new CommentLikeRepository();

    // Action and Assert
    await expect(commentLikeRepository.addLike(0, 0)).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikeRepository.verifyLikeExists(0, 0)).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikeRepository.deleteLike(0)).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
