class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const content = payload.is_delete
      ? '**komentar telah dihapus**'
      : payload.content;

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = content;
  }

  _verifyPayload(payload) {
    const {
      id,
      username,
      date,
      content,
      is_delete,
    } = payload;

    if (
      !id
      || !username
      || !date
      || !content
      || is_delete === undefined
      || is_delete === null
    ) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'object'
      || typeof content !== 'string'
      || typeof is_delete !== 'boolean'
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
