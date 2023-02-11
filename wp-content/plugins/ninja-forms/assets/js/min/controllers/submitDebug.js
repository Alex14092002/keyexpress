define('controllers/submitDebug', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {
            this.listenTo(nfRadio.channel('forms'), 'submit:response', this.submitDebug);
        },

        submitDebug: function(response, textStatus, jqXHR, formID) {

            if ('undefined' == typeof response.debug) return;

            /* Form Debug Messages */
            if ('undefined' != typeof response.debug.form) {
                var debugMessages = document.createElement('span');
                _.each(response.debug.form, function(message, index) {
                    var messageText = document.createTextNode(message);
                    debugMessages.appendChild(messageText);
                    debugMessages.appendChild(
                        document.createElement('br')
                    );
                });
                jQuery('.nf-debug-msg').html(debugMessages);
            }

            /* Console Debug Messages */
            if ('undefined' != typeof response.debug.console) {
                var style = '';
                console.log('%c%s', style, 'NINJA SUPPORT');
                _.each(response.debug.console, function(message, index) {
                    console.log(message);
                });
                console.log('%c%s', style, 'END NINJA SUPPORT');
            }
        }

    });

    return controller;
});