const util = require('util')
var _ = require('lodash');
var async = require('async');

module.exports = {
  improve: 'apostrophe-global',

  beforeConstruct: function (self, options) {

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

              callback();
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

          callback();
          
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

          callback();
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

    self.addHelpers({
      aposPaletteGetFieldSchema: function(fieldName) {
        var fieldSchemaObj = _.filter(self.schema, function(field) {
          if (field.name === fieldName) {
            return true
          }
        })
        return fieldSchemaObj[0];
      },

      aposPaletteIsArray: function(data) {
        return _.isArray(data);
      }
    });

    options.addFields = options.paletteFields.concat(options.addFields || []);

    var fieldNames = _.map(options.paletteFields, function (field) {
      return field.name
    });

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'palette',
        label: 'Palette Fields',
        fields: fieldNames
      }
    ]);

  },

  afterConstruct: function(self) {
    self.apos.adminBar.add('apostrophe-palette', 'Open Palette');
  }
};  