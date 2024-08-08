class ExistingComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const {
      id,
      owner,
    } = payload;

    if (
      !id
      || !owner
    ) {
      throw new Error('EXISTING_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('EXISTING_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ExistingComment;
