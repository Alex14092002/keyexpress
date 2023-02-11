define('controllers/fieldTextbox', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {
            nfRadio.channel('textbox').reply('get:calcValue', this.getCalcValue, this);
        },

        getCalcValue: function(fieldModel) {
            if ('currency' == fieldModel.get('mask')) {
                var form = nfRadio.channel('app').request('get:form', fieldModel.get('formID'));
                var currencySymbol = ('undefined' !== typeof form) ? form.get('currencySymbol') : '';
                var currencySymbolDecoded = jQuery('<textarea />').html(currencySymbol).text();
                return fieldModel.get('value').replace(currencySymbolDecoded, '');
            }

            return fieldModel.get('value');
        },
    });

    return controller;
});