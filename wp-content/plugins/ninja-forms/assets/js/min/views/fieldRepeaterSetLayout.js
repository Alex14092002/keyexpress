define('views/fieldRepeaterSetLayout', ['views/fieldRepeaterFieldCollection'], function(fieldCollection) {
    var view = Marionette.LayoutView.extend({
        tagName: 'fieldset',
        template: '#tmpl-nf-field-repeater-set',

        regions: {
            fields: '.nf-repeater-fieldset',
        },

        onRender: function() {
            this.fields.show(new fieldCollection({
                collection: this.model.get('fields')
            }));
        },

        templateHelpers: function() {
            return {
                maybeFilterHTML: function() {
                    return typeof nfFrontEnd.filter_esc_status !== "undefined" ? nfFrontEnd.filter_esc_status : "false";
                }
            }
        },

        events: {
            'click .nf-remove-fieldset': 'removeSet',
        },

        removeSet: function() {
            nfRadio.channel("field-repeater").trigger('remove:fieldset', this.model)
        }

    });

    return view;
});