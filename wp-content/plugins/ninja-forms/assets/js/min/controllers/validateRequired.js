define('controllers/validateRequired', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {
            this.listenTo(nfRadio.channel('fields'), 'blur:field', this.validateRequired);
            this.listenTo(nfRadio.channel('fields'), 'change:field', this.validateRequired);
            this.listenTo(nfRadio.channel('fields'), 'keyup:field', this.validateKeyup);

            this.listenTo(nfRadio.channel('fields'), 'change:modelValue', this.validateModelData);
            this.listenTo(nfRadio.channel('submit'), 'validate:field', this.validateModelData);
        },

        validateKeyup: function(el, model, keyCode) {
            if (1 != model.get('required')) {
                return false;
            }

            if (!model.get('clean')) {
                this.validateRequired(el, model);
            }
        },

        validateRequired: function(el, model) {
            if (1 != model.get('required') || !model.get('visible')) {
                return false;
            }

            var currentValue = jQuery(el).val();
            var customReqValidation = nfRadio.channel(model.get('type')).request('validate:required', el, model);
            var defaultReqValidation = true;

            var maskPlaceholder = model.get('mask');
            if (maskPlaceholder) {
                maskPlaceholder = maskPlaceholder.replace(/9/g, '_');
                maskPlaceholder = maskPlaceholder.replace(/a/g, '_');
                maskPlaceholder = maskPlaceholder.replace(/\*/g, '_');
            }

            // If the field has a mask...
            // AND that mask is equal to the current value...            
            if (maskPlaceholder && currentValue === maskPlaceholder) {
                // If we have a pre-existing error...
                if (0 < model.get('errors').length) {
                    // Persist that error.
                    defaultReqValidation = false;
                }
            }
            // If our value is an empty string...
            if (!jQuery.trim(currentValue)) {
                // Throw an error.
                defaultReqValidation = false;
            }

            if ('undefined' !== typeof customReqValidation) {
                var valid = customReqValidation;
            } else {
                var valid = defaultReqValidation;
            }

            this.maybeError(valid, model);
        },

        validateModelData: function(model) {

            if (1 != model.get('required') || !model.get('visible') || model.get('clean')) {
                return false;
            }

            /*
             * If we already have a required error on this model, return false
             */
            if (model.get('errors').get('required-error')) {
                return false;
            }

            currentValue = model.get('value');

            var defaultReqValidation = true;

            if (!jQuery.trim(currentValue)) {
                defaultReqValidation = false;
            }

            var customReqValidation = nfRadio.channel(model.get('type')).request('validate:modelData', model);
            if ('undefined' !== typeof customReqValidation) {
                var valid = customReqValidation;
            } else {
                var valid = defaultReqValidation;
            }

            this.maybeError(valid, model);

        },

        maybeError: function(valid, model) {
            if (!valid) {

                var formModel = nfRadio.channel('form-' + model.get('formID')).request('get:form');

                if ('undefined' != typeof formModel) {
                    nfRadio.channel('fields').request('add:error', model.get('id'), 'required-error', formModel.get('settings').validateRequiredField);
                }
            } else {
                nfRadio.channel('fields').request('remove:error', model.get('id'), 'required-error');
            }
        }
    });

    return controller;
});