const JwtTokenManager = require('./JwtTokenManager');

class HapiJwtTokenManager extends JwtTokenManager {
  constructor(jwt, plugin) {
    super(jwt);
    this._jwt = jwt;
    this._plugin = plugin;
  }

  async getPlugin() {
    return this._plugin;
  }
}

module.exports = HapiJwtTokenManager;
