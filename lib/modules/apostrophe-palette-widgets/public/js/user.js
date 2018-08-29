apos.define('apostrophe-palette-widgets', {

  extend: 'apostrophe-widgets',

  construct: function (self, options) {

    // Overridable hooks for project level
    self.beforeSubmit = function ($field, fieldValue, fieldSchema) {},
    self.afterSubmit = function ($field, fieldValue, fieldSchema) {},

    self.play = function ($widget, data, options) {

      var $form = $('[data-apos-palette-form]');
      var $tag = $('[data-apos-palette-styles]')
      var schema = self.options.schema;
      var piece = _.cloneDeep(self.options.piece);

      // Listen for changes to form elements within the palette tool
      self.listen = function () {
        $form.find(':input:not([data-apos-workflow-field-state-control])').change(function () {
          var $field = $(this).parents('[data-apos-palette-field]');
          var fieldValue = $field.find(':input:not([data-apos-workflow-field-state-control])').val();
          var fieldSchema = _.find(schema, function (field) {
            if ($field.attr('data-name') === field.name) {
              return field
            }
          });
          self.submit($field, fieldValue, fieldSchema);
        });
      },

      // Handles prepping the current front end for changes as well as sending
      // updates to the apostrophe-global piece
      self.submit = function ($field, fieldValue, fieldSchema) {

        self.beforeSubmit($field, fieldValue, fieldSchema);

        var save = {};
        return async.series([
          apply,
          buildForSave,
          send,
        ], function (err) {
          if (err) {
            apos.notify('Something was not right. Please review your submission.', { type: 'error', dismiss: true });
          } else {
            self.afterSubmit($field, fieldValue, fieldSchema);
          }
        });

        // Append new CSS rule to the end of our generated stylesheet. Last rule wins!
        function apply(callback) {
          var selector = $field.attr('data-apos-palette-selector');
          var property = $field.attr('data-apos-palette-property');
          var mediaQuery = $field.attr('data-apos-palette-media-query');
          var unit = $field.attr('data-apos-palette-unit') || "";

          if (selector && property) {
            property = property.split(',');
            _.each(property, function (prop) {
              var rule = "";
              if (mediaQuery) {
                rule = '@media ' + mediaQuery + ' { ';
              }

              rule = rule + selector + " { " + prop + ": " + $field.find(':input:not([data-apos-workflow-field-state-control])').val() + unit + "; } ";

              if (mediaQuery) {
                rule = rule + ' }';
              }
              $tag.append(rule);
            });
          }

          return callback(null);
        };

        // build an object of data from the palette field to update the apostrophe-global piece with
        function buildForSave(callback) {

          save.field = {
            name: fieldSchema.name,
            value: $field.find(':input:not([data-apos-workflow-field-state-control])').val()
          };

          save._id = self.options.piece._id;

          return callback(null, save);
        };

        // send the update back to the server
        function send(callback) {
          return self.api('palette-update', save, function (data) {

            if (data.status === 'ok') {
              // All is well
              return callback(null);
            }
            // API-level error
            return callback('error');
          }, function (err) {
            // Transport-level error
            return callback(err);
          });
        };
      },

      self.init = function () {
        return apos.schemas.populate($form, schema, piece, function (err) {
          if (err) {
            apos.notify('A problem populating/enhancing the palette field', { type: 'error', dismiss: true });
            return;
          }

          self.listen();

        });
      }

      self.init();

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

      })
    };
  }
});
