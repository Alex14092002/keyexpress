define('controllers/fieldStarRating', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(nfRadio.channel('starrating'), 'init:model', this.register);
            this.listenTo(nfRadio.channel('starrating'), 'render:view', this.initRating);
        },

        register: function(model) {
            model.set('renderRatings', this.renderRatings);
        },

        initRating: function(view) {
            jQuery(view.el).find('.starrating').rating();

        },

        renderRatings: function() {
            var html = document.createElement('span');
            // changed from 'default' to 'number_of_stars'
            for (var i = 0; i <= this.number_of_stars - 1; i++) {
                var template = nfRadio.channel('app').request('get:template', '#tmpl-nf-field-starrating-star');
                var num = i + 1;
                var checked = '';

                // Check to see if current 'star' matches the default value
                if (this.value == num) {
                    checked = 'checked';
                }
                var htmlFragment = template({
                    id: this.id,
                    classes: this.classes,
                    num: num,
                    checked: checked,
                    required: this.required
                });
                html.appendChild(
                    document.createRange().createContextualFragment(htmlFragment)
                );
            }
            return html.innerHTML;
        }

    });

    return controller;
});