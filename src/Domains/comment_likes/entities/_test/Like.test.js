const Like = require('../Like');

describe('Like entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      count: true,
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload fail to parse to int', () => {
    // Arrange
    const payload = {
      count: "word",
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.FAILED_TO_PARSE_DATA');
  });

  it('should create Like entities correctly', () => {
    // Arrange
    const payload = {
      count: '42',
    };

    // Action
    const like = new Like(payload);

    // Assert
    expect(like).toBeInstanceOf(Like);
    expect(like.count).toEqual(parseInt(payload.count, 10));
  });
});
