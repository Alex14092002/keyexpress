define('models/fieldRepeaterSetCollection', ['models/fieldRepeaterSetModel', 'models/fieldCollection'], function(repeaterSetModel, fieldCollection) {
    var collection = Backbone.Collection.extend({
        model: repeaterSetModel,

        initialize: function(models, options) {
            this.options = options;

            nfRadio.channel("field-repeater").on('sort:fieldsets', this.sortIDs, this);
            nfRadio.channel("field-repeater").on('remove:fieldset', this.removeSet, this);
            nfRadio.channel("field-repeater").on('add:fieldset', this.addSet, this);

        },

        addSet: function(e) {
            //Get correct Field Model in case of multiple Repeater fields use
            const repeaterFieldID = jQuery(e.target).prev(".nf-repeater").data("field-id");
            const repeaterFieldModel = this.options.repeaterFieldModel.id === repeaterFieldID ? this.options.repeaterFieldModel : undefined;

            if (repeaterFieldModel !== undefined) {
                //Create a new collection
                let fields = new fieldCollection(this.options.templateFields, {
                    formModel: this.options.formModel,
                    repeaterFieldModel: repeaterFieldModel
                });
                //Add it th sets of collection
                this.add({
                    fields: fields
                }, {
                    repeaterFieldModel: repeaterFieldModel
                });
                //reset all fields IDs
                this.sortIDs();
            }

        },

        removeSet: function(fieldset) {
            //Remove the fieldset
            this.remove(fieldset);
            //reset all fields IDs
            this.sortIDs();
        },

        sortIDs: function() {
            nfRadio.channel("field-repeater").request('reset:repeaterFieldsets', this.models);
            //Reset repeater fields IDs when adding / removing a field
            _.each(this.models, function(fieldset, modelIndex) {
                let fields = fieldset.get('fields');
                fieldset.set('index', modelIndex + 1);
                _.each(fields.models, function(field) {
                    //Remove suffix if it has one
                    cutEl = String(field.id).split('_')[0];
                    //Update Suffix using fieldset index
                    field.set("id", cutEl + "_" + modelIndex);
                });
            });
            //Reload repeater field view ( collection of fieldsets updated )
            nfRadio.channel('field-repeater').trigger('rerender:fieldsets');
        },

        beforeSubmit: function(sets) {
            //Collect values of all fields in the repeater and create repeaterFieldValue object
            let fieldsetCollection = sets.models;
            if (fieldsetCollection.length > 0) {
                let repeaterFieldValue = {};
                //Loop through fieldsets
                _.each(fieldsetCollection, function(fieldset) {
                    let fields = fieldset.get('fields');
                    //Loop through fields in each fieldsets
                    _.each(fields.models, function(field) {
                        //Get ID and Value to format and store them in the repeaterFieldValue object
                        let value = field.get('value');
                        let id = field.get('id');
                        repeaterFieldValue[id] = {
                            "value": value,
                            "id": id
                        }
                    });
                });
                //Update repeater field value with repeaterFieldValue 
                nfRadio.channel('nfAdmin').request('update:field', this.options.repeaterFieldModel, repeaterFieldValue);
            }

        },

    });
    return collection;
});