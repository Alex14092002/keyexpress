define('models/fieldRepeaterSetModel', [], function() {
    var model = Backbone.Model.extend({

        initialize: function(fieldsets, options) {

            this.repeaterFieldModel = options.repeaterFieldModel;

            this.set('label', this.repeaterFieldModel.get('label'));

            nfRadio.channel("field-repeater").reply('reset:repeaterFieldsets', this.resetRepeaterFieldsets, this);
            nfRadio.channel("field-repeater").reply('get:repeaterFieldsets', this.getRepeaterFieldsets, this);
            nfRadio.channel("field-repeater").reply('get:repeaterFields', this.getRepeaterFields, this);
            nfRadio.channel("field-repeater").reply('get:repeaterFieldById', this.getRepeaterFieldById, this);

        },

        resetRepeaterFieldsets: function(models) {
            this.collection = {};
            this.collection.models = models;
        },

        getRepeaterFieldsets: function() {
            return this.collection.models;
        },

        getRepeaterFields: function() {
            let fieldsets = this.getRepeaterFieldsets();
            if (fieldsets.length <= 0) return;

            let fields = [];
            _.each(fieldsets, function(fieldset) {
                const inFields = fieldset.get('fields');

                _.each(inFields.models, function(field) {
                    fields.push(field);
                });
            });
            return fields;
        },

        getRepeaterFieldById: function(id) {
            let fields = this.getRepeaterFields();
            if (fields.length <= 0) return;

            let model;
            _.each(fields, function(field) {
                if (field.id === id) {
                    model = field;
                }
            });
            return model;
        }

    });

    return model;
});