define('controllers/fieldImageList', [], function() {
    var controller = Marionette.Object.extend({
        initialize: function() {
            this.listenTo(nfRadio.channel('listimage'), 'init:model', this.register);
            nfRadio.channel('listimage').reply('before:updateField', this.beforeUpdateField, this);
            nfRadio.channel('listimage').reply('get:calcValue', this.getCalcValue, this);
        },

        register: function(model) {
            model.set('renderOptions', this.renderOptions);
            model.set('renderOtherText', this.renderOtherText);
            model.set('selected', []);

            /*
             * When we init a model, we need to set our 'value' to the selected option's value.
             * This is the list equivalent of a 'default value'.
             */
            if (0 != model.get('image_options').length) {
                var selected = _.filter(model.get('image_options'), function(opt) {
                    return 1 == opt.selected
                });
                selected = _.map(selected, function(opt) {
                    return opt.value
                });
            }

            /*
             * This part is re-worked to take into account custom user-meta
             * values for fields.
             */
            var savedVal = model.get('value');
            if ('undefined' !== typeof savedVal && Array.isArray(savedVal)) {
                model.set('value', savedVal);
            } else if ('undefined' != typeof selected) {
                model.set('value', selected);
            }
        },

        renderOptions: function() {
            var html = '';

            if ('' == this.value || (Array.isArray(this.value) && 0 < this.value.length) ||
                0 < this.value.length) {
                var valueFound = true;
            } else {
                var valueFound = false;
            }

            if (this.allow_multi_select === 1) {
                this.old_classname = 'list-checkbox';
                this.image_type = 'checkbox';
            } else {
                this.image_type = 'radio';
            }

            if (this.list_orientation === 'horizontal') {
                this.flex_direction = 'row';
            } else {
                this.flex_direction = 'column';
            }
            var that = this;

            var num_columns = parseInt(this.num_columns) || 1;
            var current_column = 1;
            var current_row = 1;

            _.each(this.image_options, function(image, index) {
                if (!this.show_option_labels) {
                    image.label = '';
                } else {
                    image.label = (typeof nfFrontEnd.filter_esc_status !== "undefined" && nfFrontEnd.filter_esc_status === "true") ? _.escape(image.label) : image.label;
                }
                if (Array.isArray(this.value)) {
                    if (Array.isArray(this.value[0]) && -1 !== _.indexOf(this.value[0], image.value)) {
                        valueFound = true;
                    } else if (_.indexOf(this.value, image.value)) {
                        valueFound = true;
                    }
                }

                if (image.value == this.value) {
                    valueFound = true;
                }

                /*
                 * TODO: This is a bandaid fix for making sure that each option has a "visible" property.
                 * This should be moved to creation so that when an option is added, it has a visible property by default.
                 */
                if ('undefined' == typeof image.visible) {
                    image.visible = true;
                }

                if (that.list_orientation === 'horizontal' && current_column <= num_columns) {
                    image.styles = "margin:auto;grid-column: " + current_column + "; grid-row = " + current_row;

                    if (current_column === num_columns) {
                        current_column = 1;
                        current_row += 1;
                    } else {
                        current_column += 1;
                    }
                }

                image.image_type = that.image_type;
                image.fieldID = this.id;
                image.classes = this.classes;
                image.index = index;

                var selected = false;
                /*
                 * This part has been re-worked to account for values passed in
                 * via custom user-meta ( a la User Mgmt add-on)
                 */
                if (Array.isArray(this.value) && 0 < this.value.length) {
                    if (-1 !== _.indexOf(this.value[0].split(','), image.value) ||
                        -1 !== _.indexOf(this.value, image.value)) {
                        selected = true;
                    }
                } else if (!_.isArray(this.value) && image.value == this.value) {
                    selected = true;
                } else if ((1 == image.selected && this.clean) && ('undefined' === typeof this.value || '' === this.value)) {
                    selected = true;
                }

                image.selected = selected;
                image.isSelected = selected;
                image.required = this.required;
                image.maybeFilterHTML = this.maybeFilterHTML;
                var template = nfRadio.channel('app').request('get:template', '#tmpl-nf-field-listimage-option');
                html += template(image);
            }, this);

            if (1 == this.show_other) {
                if ('nf-other' == this.value) {
                    valueFound = false;
                }
                var data = {
                    fieldID: this.id,
                    classes: this.classes,
                    value: this.value,
                    currentValue: this.value,
                    renderOtherText: this.renderOtherText,
                    valueFound: valueFound
                };

                var template = nfRadio.channel('app').request('get:template', '#tmpl-nf-field-listimage-other');
                html += template(data);

            }

            return html;
        },

        renderOtherText: function() {
            if ('nf-other' == this.currentValue || !this.valueFound) {
                if ('nf-other' == this.currentValue) {
                    this.currentValue = '';
                }
                var data = {
                    fieldID: this.fieldID,
                    classes: this.classes,
                    currentValue: this.currentValue
                };
                var template = nfRadio.channel('app').request('get:template', '#tmpl-nf-field-listimage-other-text');
                return template(data);
            }
        },

        getCalcValue: function(fieldModel) {
            var calc_value = 0;
            var options = fieldModel.get('options');
            if (0 != options.length) {
                /*
                 * Check to see if this is a multi-select list.
                 */
                if (1 == parseInt(fieldModel.get('allow_multi_select'))) {
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
                     * If we have a selcted value, use it.
                     */
                    if ('undefined' !== typeof selected) {
                        calc_value = selected.calc;
                    }
                }
            }
            return calc_value;
        },

        beforeUpdateField: function(el, model) {

            if (model.get('allow_multi_select') !== 1) {
                var selected = jQuery(el).val();
                var options = model.get('image_options');
                _.each(options, function(option, index) {
                    if (option.value === selected) {
                        option.isSelected = true;
                        option.selected = true;
                    } else {
                        option.isSelected = false;
                        option.selected = false;
                    }
                    if (!option.isSelected) {
                        option.selected = false;
                        jQuery("#nf-field-" + option.fieldID + "-" + index).removeClass('nf-checked');
                        jQuery("#nf-label-field-" + option.fieldID + "-" + index).removeClass('nf-checked-label');
                    } else {
                        jQuery("#nf-field-" + option.fieldID + "-" + index).addClass('nf-checked');
                        jQuery("#nf-label-field-" + option.fieldID + "-" + index).addClass('nf-checked-label');
                    }
                });
            } else {
                var selected = model.get('value') || [];
                if (typeof selected == 'string') selected = [selected];
                var value = jQuery(el).val();
                var checked = jQuery(el).prop('checked');
                if (checked) {
                    selected.push(value);
                    jQuery(el).addClass('nf-checked');
                    jQuery(el).parent().find('label[for="' + jQuery(el).prop('id') + '"]').addClass('nf-checked-label');
                } else {
                    jQuery(el).removeClass('nf-checked');
                    jQuery(el).parent().find('label[for="' + jQuery(el).prop('id') + '"]').removeClass('nf-checked-label');
                    var i = selected.indexOf(value);
                    if (-1 != i) {
                        selected.splice(i, 1);
                    } else if (Array.isArray(selected)) {
                        var optionArray = selected[0].split(',');
                        var valueIndex = optionArray.indexOf(value);
                        if (-1 !== valueIndex) {
                            optionArray.splice(valueIndex, 1);
                        }
                        selected = optionArray.join(',');
                    }
                }
            }

            return _.clone(selected);
        }
    });

    return controller;
});