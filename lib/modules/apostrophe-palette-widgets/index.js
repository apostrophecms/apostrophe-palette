var async = require('async');
var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-widgets',
  scene: 'user',
  contextualOnly: true,
  label: 'Palette',
  beforeConstruct: function (self, options) {
    // self.piecesModuleName = options.piecesModuleName || self.__meta.name.replace(/\-submit\-widgets$/, '');
    // self.pieces = options.apos.modules[self.piecesModuleName];
    // options.label = options.label || ('Submit Your ' + self.pieces.label);
  },
  afterConstruct: function (self) {
    self.pushAsset('stylesheet', 'index', { when: 'user' });
  },

  construct: function (self, options) {

    self.updatePalette = function (req, callback) {
      var values = req.body;

      async.waterfall([
        get,
        modify,
        update
      ], callback);

      function get(callback) {
        return self.apos.modules['apostrophe-global'].find(req, { _id: values._id }).toArray(function (err, docs) {
          callback(err, docs);
        });
      };

      function modify(docs, callback) {
        var doc = docs[0];
        delete values._id;

        for (var key in values) {
          if (values.hasOwnProperty(key)) {
            doc[key] = values[key];
          }
        }

        callback(null, doc);
      }

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

      console.log(browserOptions.modifier);
      return browserOptions;
    };
  }
};