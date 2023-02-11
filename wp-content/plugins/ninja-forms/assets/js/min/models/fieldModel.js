define('models/fieldModel', ['models/fieldErrorCollection'], function(fieldErrorCollection) {
    var model = Backbone.Model.extend({
        defaults: {
            placeholder: '',
            value: '',
            label_pos: '',
            classes: 'ninja-forms-field',
            reRender: false,
            mirror_field: false,
            confirm_field: false,
            clean: true,
            disabled: '',
            visible: true,
            invalid: false
        },

        initialize: function() {
            var type = this.get('type');

            this.set('formID', this.collection.options.formModel.get('id'));
            this.listenTo(nfRadio.channel('form-' + this.get('formID')), 'reset', this.resetModel);

            this.bind('change', this.changeModel, this);
            this.bind('change:value', this.changeValue, this);
            this.set('errors', new fieldErrorCollection());

            if (type === 'listimage') {
                this.get = this.listimageGet;
                this.set = this.listimageSet;
            }

            /*
             * Trigger an init event on two channels:
             * 
             * fields
             * field-type
             *
             * This lets specific field types modify model attributes before anything uses them.
             */
            nfRadio.channel('fields').trigger('init:model', this);
            nfRadio.channel(this.get('type')).trigger('init:model', this);
            nfRadio.channel('fields-' + this.get('type')).trigger('init:model', this);

            if ('undefined' != typeof this.get('parentType')) {
                nfRadio.channel(this.get('parentType')).trigger('init:model', this);
            }

            /*
             * When we load our form, fire another event for this field.
             */
            this.listenTo(nfRadio.channel('form-' + this.get('formID')), 'loaded', this.formLoaded);

            /*
             * Before we submit our form, send out a message so that this field can be modified if necessary.
             */
            this.listenTo(nfRadio.channel('form-' + this.get('formID')), 'before:submit', this.beforeSubmit);
        },

        listimageGet: function(attr) {
            if (attr === 'options') {
                attr = 'image_options';
            }

            return Backbone.Model.prototype.get.call(this, attr);
        },

        listimageSet: function(attributes, options) {
            if ('options' === attributes) {
                attributes = 'image_options';
            }
            return Backbone.Model.prototype.set.call(this, attributes, options);
        },

        changeModel: function() {
            nfRadio.channel('field-' + this.get('id')).trigger('change:model', this);
            nfRadio.channel(this.get('type')).trigger('change:model', this);
            nfRadio.channel('fields').trigger('change:model', this);
        },

        changeValue: function() {
            nfRadio.channel('field-' + this.get('id')).trigger('change:modelValue', this);
            nfRadio.channel(this.get('type')).trigger('change:modelValue', this);
            nfRadio.channel('fields').trigger('change:modelValue', this);
        },

        addWrapperClass: function(cl) {
            this.set('addWrapperClass', cl);
        },

        removeWrapperClass: function(cl) {
            this.set('removeWrapperClass', cl);
        },

        setInvalid: function(invalid) {
            this.set('invalid', invalid);
        },

        formLoaded: function() {
            nfRadio.channel('fields').trigger('formLoaded', this);
            nfRadio.channel('fields-' + this.get('type')).trigger('formLoaded', this);
        },

        beforeSubmit: function(formModel) {
            nfRadio.channel(this.get('type')).trigger('before:submit', this);
            nfRadio.channel('fields').trigger('before:submit', this);
        },

        /**
         * Return the value of this field.
         * This method exists so that more complex fields can return more than just the field value.
         * Those advanced fields should create their own method with this name.
         * 
         * @since  3.5
         * @return {string} Value of this field.
         */
        getValue: function() {
            return this.get('value');
        }

    });

    return model;
});