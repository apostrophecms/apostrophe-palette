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
        $form.find(':input').change(function () {
          var $field = $(this).parents('[data-apos-palette-field]');
          var fieldValue = $field.find(':input').val();
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
            alert('Something was not right. Please review your submission.');
          } else {
            self.afterSubmit($field, fieldValue, fieldSchema);
          }
        });

        // Append new CSS rule to the end of our generated stylesheet. Last rule wins!
        function apply(callback) {
          var selector = $field.attr('data-apos-palette-selector');
          var property = $field.attr('data-apos-palette-property');
          var unit = $field.attr('data-apos-palette-unit') || "";

          if (selector && property) {
            property = property.split(',');
            _.each(property, function (prop) {
              var rule = selector + " { " + prop + ": " + $field.find(':input').val() + unit + "; } ";
              $tag.append(rule);
            });
          }
          
          return callback(null);
        };

        // build an object of data from the palette field to update the apostrophe-global piece with
        function buildForSave(callback) {

          schema.forEach(function (field) {
            var $field = $form.find('[data-name="' + field.name + '"]');
            if ($field.length) {
              var $input = $field.find(':input');
              save[field.name] = $input.val();
            }
          });

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
            alert('A problem populating/enhancing the palette field');
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