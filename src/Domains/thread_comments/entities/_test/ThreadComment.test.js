const ThreadComment = require('../ThreadComment');

describe('ThreadComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'A Comment',
    };

    // Action & Assert
    expect(() => new ThreadComment(payload)).toThrowError('THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: 1.2,
      content: {},
      is_delete: '123',
    };

    // Action & Assert
    expect(() => new ThreadComment(payload)).toThrowError('THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: new Date('2021-08-08T07:19:09.775Z'),
      content: 'A Comment',
      is_delete: false,
    };
    const secondPayload = {
      id: 'comment-123',
      username: 'username',
      date: new Date('2021-08-08T07:19:09.775Z'),
      content: 'A Deleted Comment',
      is_delete: true,
    };

    // Action
    const comment = new ThreadComment(payload);
    const deletedComment = new ThreadComment(secondPayload);

    // Assert
    expect(comment).toBeInstanceOf(ThreadComment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);

    expect(deletedComment).toBeInstanceOf(ThreadComment);
    expect(deletedComment.id).toEqual(secondPayload.id);
    expect(deletedComment.username).toEqual(secondPayload.username);
    expect(deletedComment.date).toEqual(secondPayload.date);
    expect(deletedComment.content).toEqual('**komentar telah dihapus**');
  });
});
