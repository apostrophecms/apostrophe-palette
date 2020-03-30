var async = require('async');
var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-widgets',
  contextualOnly: true,
  label: 'Palette',
  beforeConstruct: function (self, options) { },
  afterConstruct: function (self) {
    self.pushAsset('stylesheet', 'index', { when: 'user' });
    self.pushAsset('script', 'leanUser', { when: 'lean' });
  },

  construct: function (self, options) {

    self.updatePalette = function (req, callback) {
      // we already have req.data.global, it is loaded by middleware,
      // no need to load it again
      if (!req.data.global._edit) {
        // Check if we can save the global doc, we're going to do it
        // directly with mongo so otherwise this would be a security hole
        return callback('forbidden');
      }
      if (!(req.body.field && req.body.field.name && (req.body.field.value || req.body.field.value === ''))) {
        // Don't crash on invalid input
        return callback('invalid');
      }
      var paletteSchema = self.apos.docs.getManager('apostrophe-global').options.paletteFields;
      var fieldSchema = _.filter(paletteSchema, { name: req.body.field.name });
      var output = {};
      return async.series([
        convert,
        update
      ], callback);

      function convert(callback) {
        return self.apos.schemas.convert(req, fieldSchema, 'form', { [req.body.field.name]: req.body.field.value }, output, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      };

      function update(callback) {
        // Direct mongo $set and $inc avoids race conditions
        // and performance problems, note we already checked
        // write permission for security

        // Make sure workflow knows even though we are bypassing Apostrophe's update method
        output.workflowModified = true;

        return self.apos.docs.db.update({
          _id: req.data.global._id
        }, {
          $set: output,
          $inc: {
            paletteCounter: 1
          }
        }, callback);
      };
    };

    self.route('post', 'palette-update', function (req, res) {
      return self.updatePalette(req, function (err) {
        if (err) {
          self.apos.utils.error(err);
        }
        return res.send({ status: err ? 'error' : 'ok' });
      });
    });

    // Patch options from the configuration to the browser
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function (req) {

      var browserOptions = superGetCreateSingletonOptions(req);
      var globalModule = self.apos.docs.getManager('apostrophe-global').find(req, {}).options.module;

      browserOptions.schema = globalModule.schema;
      browserOptions.piece = req.data.global;

      return browserOptions;
    };
  }
};
