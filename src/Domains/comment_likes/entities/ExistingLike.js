class ExistingLike {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
  }

  _verifyPayload(payload) {
    const { id } = payload;

    if (!id) {
      throw new Error('EXISTING_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string') {
      throw new Error('EXISTING_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ExistingLike;
