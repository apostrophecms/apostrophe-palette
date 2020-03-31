var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-global',

  beforeConstruct: function (self, options) {

    // If grouping configuration is passed, group the fields together for coherent sets of controls
    // There is a max depth of 2 groups
    // TODO this recursive grouping could be refactored
    var arrangedPaletteFields = [];
    if (options.arrangePaletteFields) {

      options.arrangePaletteFields.forEach(function(item) {
        var temp;
        if (_.isString(item)) {

          // top level, individual field
          var field = _.find(options.paletteFields, { name: item });

          if (field) {
            temp = {
              name: field.name,
              label: field.label,
              type: 'field',
              schema: [field]
            };

            arrangedPaletteFields.push(temp);
          } else {
            self.apos.utils.warn('Unrecognized field in arrangePaletteFields: ' + item);
          }
        } else if (item.fields && _.isString(item.fields[0])) {

          // group of fields
          temp = {
            name: item.name,
            label: item.label,
            type: 'group',
            schema: []
          };

          item.fields.forEach(function(field) {
            var pField = _.find(options.paletteFields, { name: field });
            if (pField) {
              temp.schema.push(pField);
            } else {
              self.apos.utils.warn('Unrecognized field in arrangePaletteFields: ' + field);
            }
          });

          arrangedPaletteFields.push(temp);

        } else if (item.fields && _.isObject(item.fields[0])) {

          // group of groups
          temp = {
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
            };

            group.fields.forEach(function (field) {
              var pField = _.find(options.paletteFields, { name: field });
              if (pField) {
                innerGroup.schema.push(pField);
              } else {
                self.apos.utils.warn('Unrecognized field in arrangePaletteFields: ' + field);

              }
            });

            temp.groups.push(innerGroup);

          });

          arrangedPaletteFields.push(temp);
        }
      });
      options.arrangedPaletteFields = arrangedPaletteFields;
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
      return field.name;
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

      var paletteFields = self.apos.modules['apostrophe-global'].options.paletteFields;
      var rules = [];

      paletteFields.forEach(function(field) {
        var selectors = field.selector;
        var properties = field.property;
        var fieldValue = req.data.global[field.name];
        var fieldUnit = field.unit || '';

        if (!fieldValue) {
          return;
        }

        if (_.isString(selectors)) {
          selectors = [selectors];
        }

        if (_.isString(properties)) {
          properties = [properties];
        }

        properties.forEach(function (property) {
          selectors.forEach(function (selector) {
            var rule = '';
            if (field.mediaQuery) {
              rule += '@media ' + field.mediaQuery + ' { ';
            }
            if (field.valueTemplate) {
              var regex = /%VALUE%/gi;
              rule += selector + '{ ' + property + ': ' + field.valueTemplate.replace(regex, fieldValue + fieldUnit) + '; }';
            } else {
              rule += selector + ' { ' + property + ': ' + fieldValue + fieldUnit + '; }';
            }

            if (field.mediaQuery) {
              rule += ' } ';
            }
            rules.push(rule);
          });
        });
      });

      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=31557600');
      return res.send(rules.join(''));

    });
  },

  // Add a Open/Close button to the admin bar
  afterConstruct: function(self) {
    self.apos.adminBar.add('apostrophe-palette', 'Open Palette');
  }
};
