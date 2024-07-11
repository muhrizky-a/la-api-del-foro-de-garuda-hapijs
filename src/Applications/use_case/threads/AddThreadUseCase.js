const AddThread = require('../../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(ownerId, addThread);
  }
}

module.exports = AddThreadUseCase;
