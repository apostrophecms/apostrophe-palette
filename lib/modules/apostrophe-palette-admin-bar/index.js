module.exports = {
  improve: 'apostrophe-admin-bar',
  beforeConstruct: function(self, options) {
    options.removeWhenLive = [ 'apostrophe-palette' ].concat(options.removeWhenLive || []);
  }
};
