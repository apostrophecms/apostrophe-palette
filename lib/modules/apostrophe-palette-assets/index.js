module.exports = {
  extend: 'apostrophe-module',

  afterConstruct: function (self) {
    self.pushAsset('stylesheet', 'index', { when: 'always' });
  }
};