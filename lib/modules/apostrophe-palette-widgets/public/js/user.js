apos.define('apostrophe-palette-widgets', {

  extend: 'apostrophe-widgets',

  construct: function (self, options) {

    // Overridable hooks for project level
    self.beforeSubmit = function ($target, $field, fieldValue, fieldSchema) {},
    self.afterSubmit = function ($target, $field, fieldValue, fieldSchema) {},

    self.play = function ($widget, data, options) {
      
      var $form = $('[data-apos-palette-form]');
      var schema = self.options.schema;
      var piece = _.cloneDeep(self.options.piece);
      var modifier = self.options.modifier;
      var target = self.options.target;
      var $target = $(target);

      // Listen for changes to form elements within the palette tool
      self.listen = function () {
        $form.find(':input').change(function () {
          var $field = $(this).parents('[data-apos-palette-class]');
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

        self.beforeSubmit($target, $field, fieldValue, fieldSchema);

        var save = {};
        return async.series([
          apply,
          buildForSave,
          send,
        ], function (err) {
          if (err) {
            alert('Something was not right. Please review your submission.');
          } else {
            self.afterSubmit($target, $field, fieldValue, fieldSchema);
          }
        });

        // Apply CSS class of changed form element onto the $target element
        function apply(callback) {

          var $fields = $form.find('[data-apos-palette-class]');
          var newClass = $field.attr('data-apos-palette-class') + modifier + $field.find(':input').val();
          $target.removeClass(function (index, className) {
            var base = $field.attr('data-apos-palette-class');
            var re = new RegExp('\\b' + base + '\\S+', 'g');
            return (className.match(re) || []).join(' ');
          });
          $target.addClass(newClass);

          return callback(null);
        };

        // build an object of data from the palette field to update the apostrophe-global piece with
        function buildForSave(callback) {

          var targetClass = [];

          schema.forEach(function (field) {
            var $field = $form.find('[data-name="' + field.name + '"]');
            if ($field.length) {
              var $input = $field.find(':input');
              save[field.name] = $input.val();
              targetClass.push(field.class + modifier + $input.val());
            }
          });

          save.paletteTargetClass = targetClass.join(' ');
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
        var $form = $('[data-apos-palette-form]');
        var $this = $(this);

        if ($this.parent().hasClass(activeClass)) {
          $this.parent().removeClass(activeClass);
          return;
        }
        
        $form.find('.apos-palette__group').each(function() {
          $(this).removeClass(activeClass);
        });

        $this.parent().addClass(activeClass);
        
      })
    };
  }
});