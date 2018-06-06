var util = require('util')
var _ = require('lodash');
var async = require('async');
var NodeCache = require("node-cache");
var paletteCache = new NodeCache({ stdTTL: 600, checkperiod: 600 });


module.exports = {
  improve: 'apostrophe-global',

  beforeConstruct: function (self, options) {

    // If grouping configuration is passed, group the fields together for coherent sets of controls
    // There is a max depth of 2 groups
    // TODO this recursive grouping could be refactored
    var arrangedPaletteFields = [];
    if (options.arrangePaletteFields) {

      async.each(options.arrangePaletteFields, function(item, callback) {

        if (_.isString(item)) {

          // top level, individual field
          _.find(options.paletteFields, function (field) {
            if (field.name === item) {

              var temp = {
                name: field.name,
                label: field.label,
                type: 'field',
                schema: [ field ]
              };

              arrangedPaletteFields.push(temp);

              return callback();
            }
          });
        } else if (item.fields && _.isString(item.fields[0])) {

          // group of fields
          var temp = {
            name: item.name,
            label: item.label,
            type: 'group',
            schema: []
          };

          item.fields.forEach( function(field) {
            _.find(options.paletteFields, function (pField) {
              if (pField.name === field) {
                temp.schema.push(pField);
              }
            });
          });

          arrangedPaletteFields.push(temp);

          return callback();

        } else if (item.fields && _.isObject(item.fields[0])) {

          // group of groups
          var temp = {
            name: item.name,
            label: item.label,
            type: 'group',
            groups: []
          };

          item.fields.forEach(function (group) {
            var innerGroup = {
              name: group.name,
              label: group.label,
              type: 'group',
              schema: []
            }

            group.fields.forEach(function (field) {
              _.find(options.paletteFields, function (pField) {
                if (pField.name === field) {
                  innerGroup.schema.push(pField);
                }
              });
            });

            temp.groups.push(innerGroup)

          });

          arrangedPaletteFields.push(temp);

          return callback();
        }
      }, function (err) {

        if (err) { console.log(err); }
        else {
          options.arrangedPaletteFields = arrangedPaletteFields;
        }
      });

    } else {
      options.arrangedPaletteFields = options.paletteFields;
    }

  },

  construct: function(self, options) {

    // This extra field will serve as a counter for each change that is made via palette.
    // It will be appended to the stylesheet call to allow browsers to cache stylesheets while being sure
    // browsers will get new sheets as edits are made
    options.addFields = options.paletteFields.concat(options.addFields || []).concat([
      {
        name: 'paletteCounter',
        label: 'Palette Counter',
        type: 'integer',
        readOnly: true,
        def: 0,
        help: 'This is managed by the Palette module'
      }
    ]);

    // Separate the palette field names so we can group them in a tab
    var fieldNames = _.map(options.paletteFields, function (field) {
      return field.name
    });

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'palette',
        label: 'Palette Fields',
        fields: fieldNames.concat(['paletteCounter'])
      }
    ]);

    // This route serves the existing palette stylesheet, constructed from the global object
    // We do it this way so the browser can cache the styles as often as possible
    self.route('get', 'palette-styles', function (req, res) {

      var cacheInfo = paletteCache.get('paletteCacheInfo');

      if (cacheInfo && (cacheInfo.counter === req.data.global.paletteCounter || !req.data.global.paletteCounter)) {
        console.log('from cache');

        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=31557600');
        return res.send(cacheInfo.stylesheet);
      }

      var paletteFields = self.apos.modules['apostrophe-global'].options.paletteFields;
      var rules = [];

      paletteFields.forEach(function(field) {
        var selectors = field.selector;
        var properties = field.property;
        var fieldValue = req.data.global[field.name];
        var fieldUnit = field.unit || '';

        if (_.isString(selectors)) {
          selectors = [ selectors ];
        }

        if (_.isString(properties)) {
          properties = [ properties ];
        }

        properties.forEach(function (property) {
          selectors.forEach(function (selector) {
            var rule = '';
            if (field.mediaQuery) {
              rule += '@media ' + field.mediaQuery + ' { ';
            }
            rule += selector + ' { ' + property + ': ' + fieldValue + fieldUnit + '; }';
            if (field.mediaQuery) {
              rule += ' } ';
            }
            rules.push(rule);
          });
        });
      });

      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=31557600');
      console.log('freshly');
      paletteCache.set('paletteCacheInfo', { stylesheet: rules.join(''), counter: req.data.global.paletteCounter });
      return res.send(rules.join(''));

    });
  },

  // Add a Open/Close button to the admin bar
  afterConstruct: function(self) {
    self.apos.adminBar.add('apostrophe-palette', 'Open Palette');
  }
};
