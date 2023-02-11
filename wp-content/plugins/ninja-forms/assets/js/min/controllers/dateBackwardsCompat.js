define('controllers/dateBackwardsCompat', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(Backbone.Radio.channel('pikaday-bc'), 'init', this.dateBackwardsCompat);
        },

        dateBackwardsCompat: function(dateObject, fieldModel) {

            /**
             * Start backwards compatibility for old pikaday customisation
             */
            // Legacy properties
            dateObject.pikaday = {};
            dateObject.pikaday._o = {};

            //Old hook for Pikaday Custom code
            nfRadio.channel('pikaday').trigger('init', dateObject, fieldModel);

            // If we've set a disableDayFn property in custom code, hook it up to Flatpickr
            if (typeof dateObject.pikaday._o.disableDayFn !== 'undefined') {
                dateObject.set('disable', [dateObject.pikaday._o.disableDayFn]);
            }

            //Compatibility for i18n pikaday function
            if (typeof dateObject.pikaday._o.i18n !== 'undefined' || typeof dateObject.pikaday._o.firstDay !== 'undefined') {

                let locale = dateObject.config.locale;

                if (typeof dateObject.pikaday._o.firstDay !== 'undefined') {
                    locale.firstDayOfWeek = dateObject.pikaday._o.firstDay;
                }

                if (typeof dateObject.pikaday._o.i18n !== 'undefined') {
                    if (typeof dateObject.pikaday._o.i18n.weekdays !== 'undefined') {
                        locale.weekdays.longhand = dateObject.pikaday._o.i18n.weekdays;
                    }

                    if (typeof dateObject.pikaday._o.i18n.weekdaysShort !== 'undefined') {
                        locale.weekdays.shorthand = dateObject.pikaday._o.i18n.weekdaysShort;
                    }

                    if (typeof dateObject.pikaday._o.i18n.months !== 'undefined') {
                        jQuery('.flatpickr-monthDropdown-months > option').each(function() {
                            this.text = dateObject.pikaday._o.i18n.months[this.value];
                        });
                    }
                }

                dateObject.set('locale', locale);

            }

            if (Object.keys(dateObject.pikaday._o).length > 0) {
                console.log("%cDeprecated Ninja Forms Pikaday custom code detected.", "color: Red; font-size: large");
                console.log("You are using deprecated Ninja Forms Pikaday custom code. Support for this custom code will be removed in a future version of Ninja Forms. Please contact Ninja Forms support for more details.");
            }

        }

    });

    return controller;
});