class Like {
  constructor(payload) {
    this._verifyPayload(payload);

    this.count = parseInt(payload.count, 10);
  }

  _verifyPayload(payload) {
    const { count } = payload;

    if (!count) {
      throw new Error('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof count !== 'string') {
      throw new Error('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (Number.isNaN(parseInt(count, 10))) {
      throw new Error('LIKE.FAILED_TO_PARSE_DATA');
    }
  }
}

module.exports = Like;
