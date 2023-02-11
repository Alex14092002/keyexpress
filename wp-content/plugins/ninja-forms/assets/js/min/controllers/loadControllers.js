define(
    'controllers/loadControllers', [
        'controllers/formData',
        'controllers/fieldError',
        'controllers/changeField',
        'controllers/changeEmail',
        'controllers/changeDate',
        'controllers/fieldCheckbox',
        'controllers/fieldCheckboxList',
        'controllers/fieldImageList',
        'controllers/fieldRadio',
        'controllers/fieldNumber',
        'controllers/mirrorField',
        'controllers/confirmField',
        'controllers/updateFieldModel',
        'controllers/submitButton',
        'controllers/submitDebug',
        'controllers/getFormErrors',
        'controllers/validateRequired',
        'controllers/submitError',
        'controllers/actionRedirect',
        'controllers/actionSuccess',
        'controllers/fieldSelect',
        'controllers/coreSubmitResponse',
        'controllers/fieldProduct',
        'controllers/fieldTotal',
        'controllers/fieldQuantity',
        'controllers/calculations',
        'controllers/dateBackwardsCompat',
        'controllers/fieldDate',
        'controllers/fieldRecaptcha',
        'controllers/fieldRecaptchaV3',
        'controllers/fieldHTML',
        'controllers/helpText',
        'controllers/fieldTextbox',
        'controllers/fieldTextareaRTE',
        'controllers/fieldStarRating',
        'controllers/fieldTerms',
        'controllers/formContentFilters',
        'controllers/loadViews',
        'controllers/formErrors',
        'controllers/submit',
        'controllers/defaultFilters',
        'controllers/uniqueFieldError',
        'controllers/fieldRepeater',
    ],
    function(
        FormData,
        FieldError,
        ChangeField,
        ChangeEmail,
        ChangeDate,
        FieldCheckbox,
        FieldCheckboxList,
        FieldImageList,
        FieldRadio,
        FieldNumber,
        MirrorField,
        ConfirmField,
        UpdateFieldModel,
        SubmitButton,
        SubmitDebug,
        GetFormErrors,
        ValidateRequired,
        SubmitError,
        ActionRedirect,
        ActionSuccess,
        FieldSelect,
        CoreSubmitResponse,
        FieldProduct,
        FieldTotal,
        FieldQuantity,
        Calculations,
        DateBackwardsCompat,
        FieldDate,
        FieldRecaptcha,
        FieldRecaptchaV3,
        FieldHTML,
        HelpText,
        FieldTextbox,
        FieldTextareaRTE,
        FieldStarRating,
        FieldTerms,
        FormContentFilters,
        LoadViews,
        FormErrors,
        Submit,
        DefaultFilters,
        UniqueFieldError,
        FieldRepeater
    ) {
        var controller = Marionette.Object.extend({
            initialize: function() {

                /**
                 * App Controllers
                 */
                new LoadViews();
                new FormErrors();
                new Submit();

                /**
                 * Field type controllers
                 */
                new FieldCheckbox();
                new FieldCheckboxList();
                new FieldImageList();
                new FieldRadio();
                new FieldNumber();
                new FieldSelect();
                new FieldProduct();
                new FieldTotal();
                new FieldQuantity();
                new FieldRecaptcha();
                new FieldRecaptchaV3();
                new FieldHTML();
                new HelpText();
                new FieldTextbox();
                new FieldTextareaRTE();
                new FieldStarRating();
                new FieldTerms();
                new FormContentFilters();
                new UniqueFieldError();
                new FieldRepeater();

                /**
                 * Misc controllers
                 */
                new FieldError();
                new ChangeField();
                new ChangeEmail();
                new ChangeDate();

                new MirrorField();
                new ConfirmField();
                new UpdateFieldModel();
                new SubmitButton();
                new SubmitDebug();
                new GetFormErrors();
                new ValidateRequired();
                new SubmitError();
                new ActionRedirect();
                new ActionSuccess();

                new CoreSubmitResponse();
                new Calculations();

                new DefaultFilters();

                /**
                 * Data controllers
                 */
                new DateBackwardsCompat();
                new FieldDate();
                new FormData();

            }
        });

        return controller;
    });