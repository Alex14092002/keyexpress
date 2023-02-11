define('controllers/fieldDate', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(nfRadio.channel('date'), 'init:model', this.registerFunctions);
            this.listenTo(nfRadio.channel('date'), 'render:view', this.initDatepicker);
        },

        registerFunctions: function(model) {
            model.set('renderHourOptions', this.renderHourOptions);
            model.set('renderMinuteOptions', this.renderMinuteOptions);
            model.set('maybeRenderAMPM', this.maybeRenderAMPM);
            model.set('customClasses', this.customClasses);
            // Overwrite the default getValue() method.
            model.getValue = this.getValue;
        },

        renderHourOptions: function() {
            return this.hours_options;
        },

        renderMinuteOptions: function() {
            return this.minutes_options;
        },

        maybeRenderAMPM: function() {
            if ('undefined' == typeof this.hours_24 || 1 == this.hours_24) {
                return;
            }

            return '<div style="float:left;"><select class="ampm extra"><option value="am">AM</option><option value="pm">PM</option></select></div>';
        },

        initDatepicker: function(view) {
            view.model.set('el', view.el);
            var el = jQuery(view.el).find('.nf-element')[0];
            view.listenTo(nfRadio.channel('form-' + view.model.get('formID')), 'before:submit', this.beforeSubmit, view);

            // If we are using a time_only date_mode, then hide the date input.
            if ('undefined' != typeof view.model.get('date_mode') && 'time_only' == view.model.get('date_mode')) {
                jQuery(el).hide();
                return false;
            }

            var dateFormat = view.model.get('date_format');

            // For "default" date format, convert PHP format to JS compatible format.
            if ('' == dateFormat || 'default' == dateFormat) {
                dateFormat = this.convertDateFormat(nfi18n.dateFormat);
                // Make sure this is a deep conversion of the original model.
                view.model.set('date_format', dateFormat);
            }

            var dateSettings = {
                classes: jQuery(el).attr("class"),
                placeholder: view.model.get('placeholder'),
                parseDate: function(datestr, format) {
                    return moment(datestr, format, true).toDate();
                },
                formatDate: function(date, format, locale) {
                    return moment(date).format(format);
                },
                dateFormat: dateFormat,
                altFormat: dateFormat,
                altInput: true,
                ariaDateFormat: dateFormat,
                mode: "single",
                allowInput: true,
                disableMobile: "true",
                locale: {
                    months: {
                        shorthand: nfi18n.monthsShort,
                        longhand: nfi18n.months
                    },
                    weekdays: {
                        shorthand: nfi18n.weekdaysShort,
                        longhand: nfi18n.weekdays
                    },
                    firstDayOfWeek: nfi18n.startOfWeek,
                }
            };

            // Filter our datepicker settings object.
            let filteredDatePickerSettings = nfRadio.channel('flatpickr').request('filter:settings', dateSettings, view);
            if ('undefined' != typeof filteredDatePickerSettings) {
                dateSettings = filteredDatePickerSettings;
            }

            var dateObject = flatpickr(el, dateSettings);

            if (1 == view.model.get('date_default')) {
                dateObject.setDate(moment().format(dateFormat));
                view.model.set('value', moment().format(dateFormat));
            }

            //Trigger Pikaday backwards compatibility
            nfRadio.channel('pikaday-bc').trigger('init', dateObject, view.model, view);

            nfRadio.channel('flatpickr').trigger('init', dateObject, view.model, view);
        },

        beforeSubmit: function(formModel) {
            if ('date_only' == this.model.get('date_mode')) {
                return false;
            }
            let hour = jQuery(this.el).find('.hour').val();
            let minute = jQuery(this.el).find('.minute').val();
            let ampm = jQuery(this.el).find('.ampm').val();
            let current_value = this.model.get('value');
            let date = false;

            if (_.isObject(current_value)) {
                date = current_value.date;
            } else {
                date = current_value;
            }

            let date_value = {
                date: date,
                hour: hour,
                minute: minute,
                ampm: ampm,
            };

            this.model.set('value', date_value);
        },

        getYearRange: function(fieldModel) {
            var yearRange = 10;
            var yearRangeStart = fieldModel.get('year_range_start');
            var yearRangeEnd = fieldModel.get('year_range_end');

            if (yearRangeStart && yearRangeEnd) {
                return [yearRangeStart, yearRangeEnd];
            } else if (yearRangeStart) {
                yearRangeEnd = yearRangeStart + yearRange;
                return [yearRangeStart, yearRangeEnd];
            } else if (yearRangeEnd) {
                yearRangeStart = yearRangeEnd - yearRange;
                return [yearRangeStart, yearRangeEnd];
            }

            return yearRange;
        },

        getMinDate: function(fieldModel) {
            var minDate = null;
            var yearRangeStart = fieldModel.get('year_range_start');

            if (yearRangeStart) {
                return new Date(yearRangeStart, 0, 1);
            }

            return minDate;
        },

        getMaxDate: function(fieldModel) {
            var maxDate = null;
            var yearRangeEnd = fieldModel.get('year_range_end');

            if (yearRangeEnd) {
                return new Date(yearRangeEnd, 11, 31);
            }

            return maxDate;
        },

        convertDateFormat: function(dateFormat) {
            // http://php.net/manual/en/function.date.php
            // https://github.com/dbushell/Pikaday/blob/master/README.md#formatting  **** Switched to flatpickr ***
            // Note: Be careful not to add overriding replacements. Order is important here.

            /** Day */
            dateFormat = dateFormat.replace('D', 'ddd'); // @todo Ordering issue?
            dateFormat = dateFormat.replace('d', 'DD');
            dateFormat = dateFormat.replace('l', 'dddd');
            dateFormat = dateFormat.replace('j', 'D');
            dateFormat = dateFormat.replace('N', ''); // Not Supported
            dateFormat = dateFormat.replace('S', ''); // Not Supported
            dateFormat = dateFormat.replace('w', 'd');
            dateFormat = dateFormat.replace('z', ''); // Not Supported

            /** Week */
            dateFormat = dateFormat.replace('W', 'W');

            /** Month */
            dateFormat = dateFormat.replace('M', 'MMM'); // "M" before "F" or "m" to avoid overriding.
            dateFormat = dateFormat.replace('F', 'MMMM');
            dateFormat = dateFormat.replace('m', 'MM');
            dateFormat = dateFormat.replace('n', 'M');
            dateFormat = dateFormat.replace('t', ''); // Not Supported

            // Year
            dateFormat = dateFormat.replace('L', ''); // Not Supported
            dateFormat = dateFormat.replace('o', 'YYYY');
            dateFormat = dateFormat.replace('Y', 'YYYY');
            dateFormat = dateFormat.replace('y', 'YY');

            // Time - Not supported
            dateFormat = dateFormat.replace('a', '');
            dateFormat = dateFormat.replace('A', '');
            dateFormat = dateFormat.replace('B', '');
            dateFormat = dateFormat.replace('g', '');
            dateFormat = dateFormat.replace('G', '');
            dateFormat = dateFormat.replace('h', '');
            dateFormat = dateFormat.replace('H', '');
            dateFormat = dateFormat.replace('i', '');
            dateFormat = dateFormat.replace('s', '');
            dateFormat = dateFormat.replace('u', '');
            dateFormat = dateFormat.replace('v', '');

            // Timezone - Not supported
            dateFormat = dateFormat.replace('e', '');
            dateFormat = dateFormat.replace('I', '');
            dateFormat = dateFormat.replace('O', '');
            dateFormat = dateFormat.replace('P', '');
            dateFormat = dateFormat.replace('T', '');
            dateFormat = dateFormat.replace('Z', '');

            // Full Date/Time - Not Supported
            dateFormat = dateFormat.replace('c', '');
            dateFormat = dateFormat.replace('r', '');
            dateFormat = dateFormat.replace('u', '');

            return dateFormat;
        },

        customClasses: function(classes) {
            if ('date_and_time' == this.date_mode) {
                classes += ' date-and-time';
            }
            return classes;
        },

        // This function is called whenever we want to know the value of the date field.
        // Since it could be a date/time field, we can't return just the value.
        getValue: function() {

            if ('date_only' == this.get('date_mode')) {
                return this.get('value');
            }

            let el = this.get('el');
            let hour = jQuery(el).find('.hour').val();
            let minute = jQuery(el).find('.minute').val();
            let ampm = jQuery(el).find('.ampm').val();
            let current_value = this.get('value');
            let date = false;

            if (_.isObject(current_value)) {
                date = current_value.date;
            } else {
                date = current_value;
            }

            let value = '';

            if ('undefined' != typeof date) {
                value += date;
            }

            if ('undefined' != typeof hour && 'undefined' != typeof minute) {
                value += ' ' + hour + ':' + minute;
            }

            if ('undefined' != typeof ampm) {
                value += ' ' + ampm;
            }

            return value;

            // let date_value = {
            //     date: date,
            //     hour: hour,
            //     minute: minute,
            //     ampm: ampm,
            // };

            // this.model.set( 'value', date_value );
        }
    });

    return controller;
});