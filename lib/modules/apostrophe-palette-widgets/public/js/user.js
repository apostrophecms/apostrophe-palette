apos.define('apostrophe-palette-widgets', {

  extend: 'apostrophe-widgets',

  construct: function (self, options) {

    self.play = function ($widget, data, options) {
      console.log('playing');
      var $form = $('[data-apos-palette-form]');
      var schema = self.options.schema;
      var piece = _.cloneDeep(self.options.piece);

      // Overridable hooks
      self.beforeSubmit = function ($target, $field) { }
      self.afterSubmit = function ($target, $field) { }

      self.listen = function () {
        $form.find(':input').change(function () {

          var $field = $(this).parents('[data-apos-palette-class]');
          self.submit($field);

        });
      },

        self.submit = function ($field) {

          var $target = options.target || 'body';
          $target = $($target);

          $field.schema = _.find(options.schema, function (field) {
            if ($field.attr('data-name') === field.name) {
              return field
            }
          });

          self.beforeSubmit($target, $field);

          var save = {};
          return async.series([
            apply,
            buildForSave,
            send,
          ], function (err) {
            if (err) {
              alert('Something was not right. Please review your submission.');
            } else {
              self.afterSubmit($target, $field);
            }
          });

          function buildForSave(callback) {

            var targetClass = [];

            schema.forEach(function (field) {
              var $field = $form.find('[data-name="' + field.name + '"]');
              if ($field.length) {
                var $input = $field.find(':input');
                save[field.name] = $input.val();
                targetClass.push(field.class + options.modifier + $input.val());
              }
            });

            save.paletteTargetClass = targetClass.join(' ');
            save._id = self.options.piece._id;

            return callback(null, save);
          };

          function apply(callback) {
            // console.log('apply');
            var $fields = $form.find('[data-apos-palette-class]');
            $fields.each(function () {
              var $field = $(this);
              var newClass = $field.attr('data-apos-palette-class') + options.modifier + $field.find(':input').val();
              $target.removeClass(function (index, className) {
                var base = $field.attr('data-apos-palette-class');
                var re = new RegExp('\\b' + base + '\\S+', 'g');
                return (className.match(re) || []).join(' ');
              });
              $target.addClass(newClass);
            });

            return callback(null);
          };

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
          console.log('initialize');
          return apos.schemas.populate($form, schema, piece, function (err) {
            if (err) {
              alert('A problem occurred setting up the contact form.');
              return;
            }

            self.listen();

          });
        }

      self.init();
    };
  }
});