define('views/fieldRepeaterLayout', ['views/fieldRepeaterSetCollection'], function(repeaterSetCollection) {

    var view = Marionette.LayoutView.extend({
        tagName: 'div',
        template: '#tmpl-nf-field-repeater',

        regions: {
            sets: '.nf-repeater-fieldsets',
        },

        initialize: function() {

            this.collection = this.model.get('sets');

            nfRadio.channel('field-repeater').on('rerender:fieldsets', this.render, this);

            this.listenTo(nfRadio.channel('form-' + this.model.get('formID')), 'before:submit', this.beforeSubmit);

        },

        onRender: function() {
            this.sets.show(new repeaterSetCollection({
                collection: this.collection
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
            'click .nf-add-fieldset': 'addSet'
        },

        addSet: function(e) {
            nfRadio.channel('field-repeater').trigger('add:fieldset', e);
        },

        beforeSubmit: function() {
            this.collection.beforeSubmit(this.model.get('sets'));
        }


    });

    return view;
});