const NewThreadComment = require('../NewThreadComment');

describe('NewThreadComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'A Comment',
    };

    // Action & Assert
    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'A Comment',
      owner: {},
    };

    // Action & Assert
    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });


  it('should create NewThreadComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      owner: 'user-123',
    };

    // Action
    const newThreadComment = new NewThreadComment(payload);

    // Assert
    expect(newThreadComment).toBeInstanceOf(NewThreadComment);
    expect(newThreadComment.id).toEqual(payload.id);
    expect(newThreadComment.content).toEqual(payload.content);
    expect(newThreadComment.owner).toEqual(payload.owner);
  });
});
