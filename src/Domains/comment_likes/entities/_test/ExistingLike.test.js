const ExistingLike = require('../ExistingLike');

describe('ExistingLike entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new ExistingLike(payload)).toThrowError('EXISTING_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
    };

    // Action & Assert
    expect(() => new ExistingLike(payload)).toThrowError('EXISTING_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ExistingLike entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-like-123',
    };

    // Action
    const existingLike = new ExistingLike(payload);

    // Assert
    expect(existingLike).toBeInstanceOf(ExistingLike);
    expect(existingLike.id).toEqual(payload.id);
  });
});
