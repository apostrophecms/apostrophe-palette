var _ = require('lodash');
var async = require('async');

module.exports = {
  improve: 'apostrophe-global',

  beforeConstruct: function (self, options) {

    options.arrangedPaletteFields = [];
    if (options.arrangePaletteFields) {
      options.arrangePaletteFields.forEach(function (group, index) {

        group.schema = [];
        group.fields.forEach(function (field) {

          _.find(options.paletteFields, function (pfield) {
            if (pfield.name === field) {
              group.schema.push(pfield);
            }
          });
        });

        options.arrangedPaletteFields.push(group);

      });
    } else {
      options.arrangedPaletteFields = options.paletteFields;
    }

  },

  construct: function(self, options) {

    console.log(options.paletteFields);
    options.addFields = options.paletteFields.concat(options.addFields || []);

    options.addFields.push({
      name: 'paletteTargetClass',
      label: 'Target Class',
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

  },

  afterConstruct: function(self) {
    self.apos.adminBar.add('apostrophe-palette', 'Open Palette');
  }
};  