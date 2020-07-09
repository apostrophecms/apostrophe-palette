module.exports = {
  improve: 'apostrophe-admin-bar',
  beforeConstruct: function(self, options) {
    options.safeLiveDenyList = ['apostrophe-palette'].concat(options.safeLiveDenyList || []);
  }
};
