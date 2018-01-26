var _ = require('lodash');
var async = require('async');

module.exports = {
  improve: 'apostrophe-global',
  beforeConstruct: function (self, options) {
  },

  construct: function(self, options) {

    options.addFields = options.paletteFields.concat(options.addFields || []);

    options.addFields.push({
      name: 'paletteBodyClass',
      label: 'Body Class',
      type: 'string'
    });

    var fieldNames = _.map(options.paletteFields, function (field) {
      return field.name
    });

    options.arrangeFields = [
      {
        name: 'palette',
        label: 'Palette Fields',
        fields: fieldNames
      }
    ].concat(options.arrangeFields || []);

    self.updatePalette = function(req, callback) {
      var values = req.body;

      async.waterfall([
        get,
        modify,
        update
      ], callback);

      function get(callback) {
        return self.find(req, { _id: values._id }).toArray(function(err, docs) {
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
        return self.update(req, doc, {}, callback)
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

  }
};  