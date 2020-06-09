apos.define('apostrophe-palette-widgets', {

  extend: 'apostrophe-widgets',

  construct: function (self, options) {
    // Overridable hooks for project level
    self.beforeSubmit = function ($field, fieldValue, fieldSchema) {};
    self.afterSubmit = function ($field, fieldValue, fieldSchema) {};

    self.play = function ($widget, data, options) {

      var $form = $('[data-apos-palette-form]');
      var $tag = $('[data-apos-palette-styles]');
      var schema = self.options.schema;
      var piece = _.cloneDeep(self.options.piece);

      self.init($form, $tag, schema, piece);

      // apostrophe-palette interface
      $form.on('click', '[data-apos-palette-group-button]', function(e) {
        e.preventDefault();
        var activeClass = 'apos-palette__group--active';
        var $this = $(this);

        if ($this.parent().hasClass(activeClass)) {
          $this.parent().removeClass(activeClass);
          return;
        }

        $this.parent().siblings('.apos-palette__group').each(function() {
          var $self = $(this);
          $self.removeClass(activeClass);
          $self.find('.apos-palette__group').removeClass(activeClass);
        });

        $this.parent().addClass(activeClass);
      });
    };

    self.init = function ($form, $tag, schema, piece) {
      return apos.schemas.populate($form, schema, piece, function (err) {
        if (err) {
          apos.notify('A problem populating/enhancing the palette field', {
            type: 'error',
            dismiss: true
          });
          return;
        }

        self.listen($form, $tag, schema, piece);

      });
    };

    // Listen for changes to form elements within the palette tool
    self.listen = function ($form, $tag, schema, piece) {
      $form.find(':input:not([data-apos-workflow-field-state-control])').change(function () {
        var $field = $(this).parents('[data-apos-palette-field]');
        var fieldValue = $field.find(':input:not([data-apos-workflow-field-state-control])').val();
        var fieldSchema = _.find(schema, function (field) {
          if ($field.attr('data-name') === field.name) {
            return field;
          }
        });
        self.submit($field, fieldValue, fieldSchema, $tag);
      });
    };

    // One debounced save function for each field.
    // If we didn't break them out this way then saves
    // for different fields around the same time might
    // never happen.
    self.debouncedSaves = {};

    // Handles prepping the current front end for changes as well as sending
    // updates to the apostrophe-global piece
    self.submit = function ($field, fieldValue, fieldSchema, $tag) {
      self.apply($field, fieldValue, fieldSchema, $tag);
      var save = self.debouncedSaves[fieldSchema.name];
      if (!save) {
        save = _.debounce(self.save, 250, {
          leading: true,
          trailing: true
        });
        self.debouncedSaves[fieldSchema.name] = save;
      }
      save($field, fieldValue, fieldSchema, $tag);
    };

    // Append new CSS rule to the end of our generated stylesheet. Last rule wins!
    self.apply = function($field, fieldValue, fieldSchema, $tag) {
      var selector = $field.attr('data-apos-palette-selector');
      var property = $field.attr('data-apos-palette-property');
      var mediaQuery = $field.attr('data-apos-palette-media-query');
      var unit = $field.attr('data-apos-palette-unit') || "";
      var valueTemplate = $field.attr('data-apos-value-template') || false;
      var value = $field.find(':input:not([data-apos-workflow-field-state-control])').val();

      if (!value) {
        return;
      }

      if (selector && property) {
        property = property.split(',');
        _.each(property, function (prop) {
          var rule = "";
          if (mediaQuery) {
            rule = '@media ' + mediaQuery + ' { ';
          }

          if (valueTemplate) {
            var regex = /%VALUE%/gi;
            rule = rule + selector + " { " + prop + ": " + valueTemplate.replace(regex, value + unit) + "; } ";
          } else {
            rule = rule + selector + " { " + prop + ": " + value + unit + "; } ";
          }

          if (mediaQuery) {
            rule = rule + ' }';
          }
          $tag.append(rule);
        });
      }
    };

    self.save = function($field, fieldValue, fieldSchema, $tag) {
      // build an object of data from the palette field to update the apostrophe-global piece with
      var save = {};
      save.field = {
        name: fieldSchema.name,
        value: $field.find(':input:not([data-apos-workflow-field-state-control])').val()
      };
      save._id = self.options.piece._id;

      return send(function(err) {
        if (err) {
          apos.notify('Something was not right. Please review your submission.', {
            type: 'error',
            dismiss: true
          });
        } else {
          self.afterSubmit($field, fieldValue, fieldSchema, $tag);
        }
      });

      // send the update back to the server
      function send(callback) {
        return self.api('palette-update', save, function (data) {
          if (data.status === 'ok') {
            // All is well
            apos.emit('workflowModified');
            return callback(null);
          }
          // API-level error
          return callback('error');
        }, function (err) {
          // Transport-level error
          return callback(err);
        });
      };
    };

  }
});
