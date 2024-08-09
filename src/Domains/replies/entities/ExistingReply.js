class ExistingReply {
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
      throw new Error('EXISTING_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('EXISTING_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ExistingReply;
