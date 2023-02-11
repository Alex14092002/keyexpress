define('controllers/fieldRepeater', ['models/fieldRepeaterSetCollection', 'models/fieldCollection'], function(repeaterSetCollection, fieldCollection) {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(nfRadio.channel('repeater'), 'init:model', this.initRepeater);
        },

        initRepeater: function(model) {
            if ('undefined' == typeof model.collection.options.formModel) {
                return false;
            }

            let fields = new fieldCollection(model.get('fields'), {
                formModel: model.collection.options.formModel
            });
            model.set('sets', new repeaterSetCollection([{
                fields: fields
            }], {
                templateFields: model.get('fields'),
                formModel: model.collection.options.formModel,
                repeaterFieldModel: model
            }));
        },

    });

    return controller;
});