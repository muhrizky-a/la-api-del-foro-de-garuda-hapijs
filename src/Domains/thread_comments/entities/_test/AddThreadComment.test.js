const AddThreadComment = require('../AddThreadComment');

describe('AddThreadComment entities', () => {
  it('should throw error when payload is empty', () => {
    // Arrange
    const payload = undefined;

    // Action & Assert
    expect(() => new AddThreadComment(payload)).toThrowError('ADD_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new AddThreadComment(payload)).toThrowError('ADD_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = { content: 123 };

    // Action & Assert
    expect(() => new AddThreadComment(payload)).toThrowError('ADD_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThreadComment entities correctly', () => {
    // Arrange
    const payload = { content: 'A Comment' };

    // Action
    const addThreadComment = new AddThreadComment(payload);

    // Assert
    expect(addThreadComment).toBeInstanceOf(AddThreadComment);
    expect(addThreadComment.content).toEqual(payload.content);
  });
});
