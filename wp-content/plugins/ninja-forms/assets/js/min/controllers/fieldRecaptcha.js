define('controllers/fieldRecaptcha', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(nfRadio.channel('recaptcha'), 'init:model', this.initRecaptcha);
            this.listenTo(nfRadio.channel('forms'), 'submit:response', this.resetRecaptcha);
        },

        initRecaptcha: function(model) {
            nfRadio.channel('recaptcha').reply('update:response', this.updateResponse, this, model.id);
        },

        updateResponse: function(response, fieldID) {
            var model = nfRadio.channel('fields').request('get:field', fieldID);
            model.set('value', response);
            nfRadio.channel('fields').request('remove:error', model.get('id'), 'required-error');
        },

        resetRecaptcha: function() {
            var recaptchaID = 0;
            jQuery('.g-recaptcha').each(function() {
                try {
                    grecaptcha.reset(recaptchaID);
                } catch (e) {
                    console.log('Notice: Error trying to reset grecaptcha.');
                }
                recaptchaID++;
            });
        }
    });

    return controller;
});