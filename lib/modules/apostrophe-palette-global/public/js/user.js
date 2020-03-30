apos.define('apostrophe-global', {

  afterConstruct: function(self) {
  },

  construct: function(self, options) {
    apos.adminBar.link('apostrophe-palette', function () {
      var $body = $('body');
      var $menuItem = $('[data-apos-admin-bar-item="apostrophe-palette"]');

      $body.toggleClass('apos-palette-active');

      if ($body.hasClass('apos-palette-active')) {
        $menuItem.text('Close Palette');
      } else {
        $menuItem.text('Open Palette');
      }
    });
  }
});
