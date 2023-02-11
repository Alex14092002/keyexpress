/**
 * Handles submission of our form.
 */
define('controllers/submit', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {
            this.listenTo(nfRadio.channel('forms'), 'init:model', this.registerSubmitHandler);
        },

        /**
         * Register the submission handler function.
         *
         * @since  3.0
         * @param  Backbone.model 	formModel
         * @return void
         */
        registerSubmitHandler: function(formModel) {
            nfRadio.channel('form-' + formModel.get('id')).reply('submit', this.submit);
        },

        /**
         * Handles the actual submission of our form.
         * When we submit:
         *
         * 1) Send out a message saying that we're about to begin form submission.
         * 2) Check the form for errors
         * 3) Submit the data
         * 4) Send out a message with our response
         *
         * @since  3.0
         * @param  Backbone.model 	formModel
         * @return void
         */
        submit: function(formModel) {

            /*
             * Send out a radio message saying that we're about to begin submitting.
             * First we send on the generic forms channel, and then on the form-specific channel.
             */
            nfRadio.channel('forms').trigger('before:submit', formModel);
            nfRadio.channel('form-' + formModel.get('id')).trigger('before:submit', formModel);

            /*
             * Validate our field models.
             */
            var validate = nfRadio.channel('forms').request('maybe:validate', formModel);
            if (false !== validate) {

                // When validating all fields, set clean to false to force validation.
                _.each(formModel.get('fields').models, function(fieldModel) {
                    fieldModel.set('clean', false);
                });

                /*
                 * This method is defined in our models/fieldCollection.js file,
                 * except where overridden by an add-on (ie Layout & Styles).
                 */
                formModel.get('formContentData').validateFields();
            }

            var submit = nfRadio.channel('form-' + formModel.get('id')).request('maybe:submit', formModel);
            if (false == submit) {
                nfRadio.channel('forms').trigger('submit:cancel', formModel);
                nfRadio.channel('form-' + formModel.get('id')).trigger('submit:cancel', formModel);
                return;
            }

            if (false !== validate) {

                // Ignore non-blocking errors.
                var blockingFormErrors = _.filter(formModel.get('errors').models, function(error) {

                    // Ignore email action related errors.
                    if ('invalid_email' == error.get('id') || 'email_not_sent' == error.get('id')) return false;

                    return true; // Error is blocking.
                });

                /*
                 * Make sure we don't have any form errors before we submit.
                 * Return false if we do.
                 */
                if (0 != _.size(blockingFormErrors)) {
                    nfRadio.channel('forms').trigger('submit:failed', formModel);
                    nfRadio.channel('form-' + formModel.get('id')).trigger('submit:failed', formModel);
                    return false;
                }
            }

            /*
             * Send out a radio message saying that we're about to begin submitting.
             * First we send on the generic forms channel, and then on the form-specific channel.
             */
            nfRadio.channel('forms').trigger('after:submitValidation', formModel);
            nfRadio.channel('form-' + formModel.get('id')).trigger('after:submitValidation', formModel);

            /*
             * Actually submit our form, and send out a message with our response.
             */

            var formID = formModel.get('id');
            var fields = {};
            _.each(formModel.get('fields').models, function(field) {
                var fieldDataDefaults = {
                    value: field.get('value'),
                    id: field.get('id')
                };

                // Add field data at the field ID for efficient access.
                fields[field.get('id')] = nfRadio.channel(field.get('type')).request('get:submitData', fieldDataDefaults, field) || fieldDataDefaults;;
            });
            var extra = formModel.get('extra');
            var settings = formModel.get('settings');
            delete settings.formContentData;
            var formData = JSON.stringify({
                id: formID,
                fields: fields,
                settings: settings,
                extra: extra
            });
            var data = {
                'action': 'nf_ajax_submit',
                'security': nfFrontEnd.ajaxNonce,
                'nonce_ts': nfFrontEnd.nonce_ts,
                'formData': formData
            }

            var that = this;

            jQuery.ajax({
                url: nfFrontEnd.adminAjax,
                type: 'POST',
                data: data,
                cache: false,
                success: function(data, textStatus, jqXHR) {
                    try {
                        var response = data;
                        nfRadio.channel('forms').trigger('submit:response', response, textStatus, jqXHR, formModel.get('id'));
                        nfRadio.channel('form-' + formModel.get('id')).trigger('submit:response', response, textStatus, jqXHR);
                        jQuery(document).trigger('nfFormSubmitResponse', {
                            response: response,
                            id: formModel.get('id')
                        });
                    } catch (e) {
                        console.log(e);
                        console.log('Parse Error');
                        console.log(e);
                    }

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // Handle errors here
                    console.log('ERRORS: ' + errorThrown);
                    console.log(jqXHR);

                    try {
                        var response = jQuery.parseJSON(jqXHR.responseText);
                        nfRadio.channel('forms').trigger('submit:response', response, textStatus, jqXHR, formModel.get('id'));
                        nfRadio.channel('form-' + formModel.get('id')).trigger('submit:response', response, textStatus, jqXHR);
                    } catch (e) {
                        console.log('Parse Error');
                    }

                    // STOP LOADING SPINNER
                    nfRadio.channel('forms').trigger('submit:response', 'error', textStatus, jqXHR, errorThrown);
                }
            });

        }

    });

    return controller;
});