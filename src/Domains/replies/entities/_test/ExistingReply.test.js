const ExistingReply = require('../ExistingReply');

describe('ExistingReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
    };

    // Action & Assert
    expect(() => new ExistingReply(payload)).toThrowError('EXISTING_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      owner: true,
    };

    // Action & Assert
    expect(() => new ExistingReply(payload)).toThrowError('EXISTING_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ExistingReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      owner: 'user-123',
    };

    // Action
    const existingReply = new ExistingReply(payload);

    // Assert
    expect(existingReply).toBeInstanceOf(ExistingReply);
    expect(existingReply.id).toEqual(payload.id);
    expect(existingReply.owner).toEqual(payload.owner);
  });
});
