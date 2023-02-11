define('models/fieldCollection', ['models/fieldModel'], function(fieldModel) {
    var collection = Backbone.Collection.extend({
        model: fieldModel,
        comparator: 'order',

        initialize: function(models, options) {
            this.options = options;
            this.on('reset', function(fieldCollection) {
                nfRadio.channel('fields').trigger('reset:collection', fieldCollection);
            }, this);
        },

        validateFields: function() {
            _.each(this.models, function(fieldModel) {
                // added here for help with multi-part part validation
                fieldModel.set('clean', false);
                nfRadio.channel('submit').trigger('validate:field', fieldModel);
            }, this);
        },

        showFields: function() {
            this.invoke('set', {
                visible: true
            });
            this.invoke(function() {
                this.trigger('change:value', this);
            });
        },

        hideFields: function() {
            this.invoke('set', {
                visible: false
            });
            this.invoke(function() {
                this.trigger('change:value', this);
            });
        }
    });
    return collection;
});