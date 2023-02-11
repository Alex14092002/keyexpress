/**
 * Controller responsible for removing unique field errors.
 */

define('controllers/uniqueFieldError', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            /*
             * Listen to keyup and field changes.
             *
             * If those fields have a unique field error, remove that error.
             */
            this.listenTo(nfRadio.channel('fields'), 'change:modelValue', this.removeError);
            this.listenTo(nfRadio.channel('fields'), 'keyup:field', this.removeError);
            this.listenTo(nfRadio.channel('fields'), 'blur:field', this.removeError);

        },

        removeError: function(el, model) {
            model = model || el;
            /*
             * Remove any unique field errors.
             */
            nfRadio.channel('fields').request('remove:error', model.get('id'), 'unique_field');
        },

    });

    return controller;
});