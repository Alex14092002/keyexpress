define('controllers/fieldSelect', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {

            this.listenTo(nfRadio.channel('fields'), 'init:model', function(model) {
                if ('list' == model.get('parentType')) this.register(model);
            }, this);

            nfRadio.channel('listselect').reply('get:calcValue', this.getCalcValue, this);
            nfRadio.channel('listmultiselect').reply('get:calcValue', this.getCalcValue, this);
        },

        register: function(model) {
            model.set('renderOptions', this.renderOptions);
            model.set('renderOtherAttributes', this.renderOtherAttributes);
            /*
             * When we init a model, we need to set our 'value' to the selected option's value.
             * This is the list equivalent of a 'default value'.
             */
            if (0 != model.get('options').length) {
                //Check to see if there is a value set for the field
                var savedVal = model.get('value');

                /*
                 * Check to see if this is a multi-select list.
                 */
                if ('listmultiselect' == model.get('type')) {
                    /*
                     * We're using a multi-select, so we need to check out any selected options and add them together.
                     */
                    var selected = _.filter(model.get('options'), function(opt) {
                        return 1 == opt.selected
                    });
                    selected = _.map(selected, function(opt) {
                        return opt.value
                    });
                    var value = selected;
                } else if ('listradio' !== model.get('type')) {
                    /*
                     * Check to see if we have a selected value.
                     */
                    var selected = _.find(model.get('options'), function(opt) {
                        return 1 == opt.selected
                    });
                    /*
                     * We don't have a selected value, so use our first option.
                     */
                    if ('undefined' == typeof selected) {
                        selected = _.first(model.get('options'));
                    }

                    if ('undefined' != typeof selected &&
                        'undefined' != typeof selected.value) {
                        var value = selected.value;
                    } else if ('undefined' != typeof selected) {
                        var value = selected.label;
                    }
                }

                /*
                 * This part is re-worked to take into account custom user-meta
                 * values for fields.
                 */
                if ('undefined' !== typeof savedVal && '' !== savedVal &&
                    Array.isArray(savedVal)) {
                    model.set('value', savedVal);
                } else if ('undefined' != typeof selected) {
                    model.set('value', value);
                }
            }
        },

        renderOptions: function() {
            var html = '';

            _.each(this.options, function(option) {
                /*
                 * This part has been re-worked to account for values passed in
                 * via custom user-meta ( a la User Mgmt add-on)
                 */
                if (_.isArray(this.value)) {
                    // If we have a multiselect list...
                    // AND it has selected values...
                    if ('listmultiselect' === this.type && 0 < this.value.length &&
                        -1 != _.indexOf(this.value[0].split(','), option.value)) {
                        var selected = true;
                    } else if (-1 != _.indexOf(this.value, option.value)) {
                        var selected = true;
                    }
                } else if (!_.isArray(this.value) && option.value == this.value) {
                    var selected = true;
                } else if ((1 == option.selected && this.clean) &&
                    'undefined' === typeof this.value) {
                    var selected = true;
                } else {
                    var selected = false;
                }

                /*
                 * TODO: This is a bandaid fix for making sure that each option has a "visible" property.
                 * This should be moved to creation so that when an option is added, it has a visible property by default.
                 */
                if ('undefined' == typeof option.visible) {
                    option.visible = true;
                }

                option.selected = selected;
                option.fieldID = this.id;
                option.classes = this.classes;
                option.currentValue = this.value;
                option.label = (typeof nfFrontEnd.filter_esc_status !== "undefined" && nfFrontEnd.filter_esc_status === "true") ? _.escape(option.label) : option.label;

                option.maybeFilterHTML = this.maybeFilterHTML;
                var template = nfRadio.channel('app').request('get:template', '#tmpl-nf-field-listselect-option');
                html += template(option);
            }, this);

            return html;
        },

        renderOtherAttributes: function() {
            var otherAttributes = '';

            if ('listmultiselect' == this.type) {
                otherAttributes = otherAttributes + ' multiple';

                var multiSize = this.multi_size || 5;
                otherAttributes = otherAttributes + ' size="' + multiSize + '"';
            }

            return otherAttributes;
        },

        getCalcValue: function(fieldModel) {
            var calc_value = 0;
            var options = fieldModel.get('options');
            if (0 != options.length) {
                /*
                 * Check to see if this is a multi-select list.
                 */
                if ('listmultiselect' == fieldModel.get('type')) {
                    /*
                     * We're using a multi-select, so we need to check out any selected options and add them together.
                     */
                    _.each(fieldModel.get('value'), function(val) {
                        var tmp_opt = _.find(options, function(opt) {
                            return opt.value == val
                        });
                        calc_value += Number(tmp_opt.calc);
                    });
                } else {
                    /*
                     * We are using a single select, so our selected option is in the 'value' attribute.
                     */
                    var selected = _.find(options, function(opt) {
                        return fieldModel.get('value') == opt.value
                    });
                    /*
                     * We don't have a selected value, so use our first option.
                     */
                    if ('undefined' == typeof selected) {
                        selected = fieldModel.get('options')[0];
                    }
                    calc_value = selected.calc;
                }
            }
            return calc_value;
        }

    });

    return controller;
});