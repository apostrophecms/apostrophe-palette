apos.define('apostrophe-global', {

  afterConstruct: function(self) {
    console.log('after');
  },

  construct: function(self, options) {
    var $form = $('[data-apos-palette-form]');
    
    // Overridable hooks
    self.beforeSubmit = function ($body, $field) { }
    self.afterSubmit = function ($body, $field) { }

    self.listen = function () {
      $form.find(':input').change(function() {
        
        var $field = $(this).parents('[data-apos-palette-class]');
        self.submit($field);

      });
    },

    self.submit = function ($field) {
      var $body = $('body');
      $field.schema = _.find(options.schema, function(field) {
        if ($field.attr('data-name') === field.name) {
          return field
        }
      });

      self.beforeSubmit($body, $field);

      var save = {};
      return async.series([
        apply,
        buildForSave,
        send,
      ], function (err) {
        if (err) {
          alert('Something was not right. Please review your submission.');
        } else {
          console.log('good good');
        }
      });

      self.afterSubmit();

      function buildForSave(callback) {
        console.log('buildforsave');
        
        var bodyClass = [];

        options.schema.forEach(function (field) {
          var $field = $form.find('[data-name="' + field.name + '"]');
          if ($field.length) {
            var $input = $field.find(':input');
            save[field.name] = $input.val();
            bodyClass.push(field.class + '--' + $input.val());
          }
        });

        save.paletteBodyClass = bodyClass.join(' ');
        save._id = self.options._id;

        return callback(null, save);
      };

      function apply(callback) {
        console.log('apply');
        var $fields = $form.find('[data-apos-palette-class]');
        $fields.each(function () {
          var $field = $(this);
          var newClass = $field.attr('data-apos-palette-class') + '--' + $field.find(':input').val();
          $body.removeClass(function (index, className) {
            var base = $field.attr('data-apos-palette-class');
            var re = new RegExp('\\b' + base + '\\S+', 'g');
            return (className.match(re) || []).join(' ');
          });
          $body.addClass(newClass);
        });

        return callback(null);
      };

      function send(callback) {
        console.log('send');
        return self.api('palette-update', save, function (data) {
          console.log(data);
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

    self.listen();

  }
});