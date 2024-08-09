const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'A Reply',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
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
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entities correctly', () => {
    // Arrange
    const firstPayload = {
      id: 'reply-123',
      username: 'username',
      date: new Date('2021-08-08T07:19:09.775Z'),
      content: 'A Reply',
      is_delete: false,
    };
    const secondPayload = {
      id: 'reply-123',
      username: 'username',
      date: new Date('2021-08-08T07:19:09.775Z'),
      content: 'A Deleted Reply',
      is_delete: true,
    };

    // Action
    const reply = new Reply(firstPayload);
    const deletedReply = new Reply(secondPayload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(firstPayload.id);
    expect(reply.username).toEqual(firstPayload.username);
    expect(reply.date).toEqual(firstPayload.date);
    expect(reply.content).toEqual(firstPayload.content);

    expect(deletedReply).toBeInstanceOf(Reply);
    expect(deletedReply.id).toEqual(secondPayload.id);
    expect(deletedReply.username).toEqual(secondPayload.username);
    expect(deletedReply.date).toEqual(secondPayload.date);
    expect(deletedReply.content).toEqual('**balasan telah dihapus**');
  });
});
