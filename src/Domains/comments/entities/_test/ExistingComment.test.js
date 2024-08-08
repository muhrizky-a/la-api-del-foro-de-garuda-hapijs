const ExistingComment = require('../ExistingComment');

describe('ExistingComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
    };

    // Action & Assert
    expect(() => new ExistingComment(payload)).toThrowError('EXISTING_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      owner: true,
    };

    // Action & Assert
    expect(() => new ExistingComment(payload)).toThrowError('EXISTING_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ExistingComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const comment = new ExistingComment(payload);

    // Assert
    expect(comment).toBeInstanceOf(ExistingComment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.owner).toEqual(payload.owner);
  });
});
