var async = require('async');
var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-widgets',
  scene: 'user',
  contextualOnly: true,
  label: 'Palette',
  beforeConstruct: function (self, options) { },
  afterConstruct: function (self) {
    self.pushAsset('stylesheet', 'index', { when: 'user' });
  },

  construct: function (self, options) {

    self.updatePalette = function (req, callback) {
      var paletteSchema = self.apos.docs.getManager('apostrophe-global').find(req, {}).options.module.options.paletteFields;

      return async.waterfall([
        get,
        convert,
        update
      ], callback);

      function get(callback) {
        return self.apos.modules['apostrophe-global'].find(req, { _id: req.body._id }).toObject(function (err, doc) {
          if (err) {
            return callback(err);
          }
          callback(null, doc);
        });
      };

      function convert(doc, callback) {
        return self.apos.schemas.convert(req, paletteSchema, 'form', req.body, doc, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, doc)
        });
      };

      function update(doc, callback) {
        return self.apos.modules['apostrophe-global'].update(req, doc, {}, callback)
      };
    };

    self.route('post', 'palette-update', function (req, res) {
      return self.updatePalette(req, function (err) {
        if (err) {
          console.error(err);
        }
        return res.send({ status: err ? 'error' : 'ok' });
      });
    });

    // Patch options from the configuration to the browser
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function (req) {

      var browserOptions = superGetCreateSingletonOptions(req);
      var globalModule = self.apos.docs.getManager('apostrophe-global').find(req, {}).options.module;

      browserOptions.schema = globalModule.schema
      browserOptions.target = globalModule.options.target || 'body';
      browserOptions.modifier = globalModule.options.modifierSeparator || '--';
      browserOptions.piece = req.data.global;

      return browserOptions;
    };
  }
};