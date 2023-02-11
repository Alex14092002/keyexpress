define('controllers/fieldHTML', [], function() {
    var controller = Marionette.Object.extend({

        htmlFields: [],
        trackedMergeTags: [],

        initialize: function() {
            this.listenTo(Backbone.Radio.channel('fields-html'), 'init:model', this.setupFieldMergeTagTracking);
        },

        setupFieldMergeTagTracking: function(fieldModel) {
            this.htmlFields.push(fieldModel);

            var formID = fieldModel.get('formID');

            this.listenTo(nfRadio.channel('form-' + formID), 'init:model', function(formModel) {

                var mergeTags = fieldModel.get('default').match(new RegExp(/{field:(.*?)}/g));
                if (!mergeTags) return;

                _.each(mergeTags, function(mergeTag) {
                    var fieldKey = mergeTag.replace('{field:', '').replace('}', '');
                    var fieldModel = formModel.get('fields').findWhere({
                        key: fieldKey
                    });
                    if ('undefined' == typeof fieldModel) return;

                    this.trackedMergeTags.push(fieldModel);
                    this.listenTo(nfRadio.channel('field-' + fieldModel.get('id')), 'change:modelValue', this.updateFieldMergeTags);
                }, this);

                // Let's get this party started!
                this.updateFieldMergeTags();
            }, this);
        },

        updateFieldMergeTags: function(fieldModel) {
            _.each(this.htmlFields, function(htmlFieldModel) {
                var value = htmlFieldModel.get('value');
                _.each(this.trackedMergeTags, function(fieldModel) {

                    /* Search the value for any spans with mergetag data-key
                     * values
                     */
                    var spans = value.match(new RegExp(/<span data-key="field:(.*?)<\/span>/g));
                    _.each(spans, function(spanVar) {
                        /* See if the span string contains the current
                         * fieldModel's key. If so replace the span with a
                         * merge tag for evaluation.
                         */
                        if (-1 < spanVar.indexOf("data-key=\"field:" + fieldModel.get('key'))) {
                            value = value.replace(spanVar, "{field:" + fieldModel.get('key') + "}");
                        }
                    });

                    var mergeTag = '{field:' + fieldModel.get('key') + '}';
                    /* We replace the merge tag with the value
                     * surrounded by a span so that we can still find it
                     * and not affect itself or other field merge tags
                     */
                    value = value.replace(mergeTag, "<span data-key=\"field:" +
                        fieldModel.get('key') + "\">" +
                        fieldModel.getValue() + "</span>");
                }, this);
                htmlFieldModel.set('value', value);
                htmlFieldModel.trigger('reRender');
            }, this);
        }

    });

    return controller;
});