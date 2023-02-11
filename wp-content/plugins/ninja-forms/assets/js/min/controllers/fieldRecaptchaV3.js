define('controllers/fieldRecaptchaV3', [], function() {
    var controller = Marionette.Object.extend({

        initialize: function() {
            this.listenTo(nfRadio.channel('recaptcha_v3'), 'init:model', this.initRecaptcha);
        },

        initRecaptcha: function(model) {
            const formID = model.get('formID');
            try {
                nfRadio.channel('form-' + formID).trigger('disable:submit', model);
                grecaptcha.ready(function() {
                    grecaptcha.execute(model.get('site_key'), {
                        action: 'register'
                    }).then(function(token) {
                        model.set('value', token);
                        nfRadio.channel('form-' + formID).trigger('enable:submit', model);
                    });
                });
            } catch (e) {
                //Wait for the form to fully load and display error
                jQuery(document).on('nfFormReady', (layoutView) => {
                    //Get consent details as recaptcha failed to load
                    let consent = nf_check_recaptcha_consent();

                    //Get submit button
                    let submitFieldID;
                    model.collection.models.forEach((fieldModel) => {
                        if (fieldModel.get("type") === "submit") {
                            submitFieldID = fieldModel.get("id");
                        };
                    });
                    //Display generic error
                    nfRadio.channel('fields').request("add:error", submitFieldID, "recaptcha-v3-missing", model.collection.options.formModel.get("settings").recaptchaConsentMissing);
                    //Create error message and add possible interaction with cookie consent depending on consent result
                    //Display filterable error to add consent
                    this.nf_build_default_consent_action(model, consent.services, submitFieldID, layoutView);
                });
            }
        },
        nf_build_default_consent_action: function(model, services, submitFieldID, layoutView) {
            //Return if no consent management is detected
            const returnIf = services.length <= 1 && services.includes("missing_cookie") || services.length <= 0;
            if (!returnIf) {
                let actionElement = document.createElement("div");
                actionElement.setAttribute("id", "nf_recaptcha_consent_event");
                actionElement.innerText += model.collection.options.formModel.get("settings").recaptchaConsentEvent;

                const detailData = {
                    "services": services,
                    "element": actionElement,
                    "submitFieldID": submitFieldID,
                    "layoutView": layoutView
                }
                //Allow filtering of the element before printing it
                let nf_consent_link_event = new CustomEvent('nf_consent_link', {
                    detail: detailData
                });
                document.dispatchEvent(nf_consent_link_event);

                //Append action to error element
                const genericErrorElements = document.getElementsByClassName("nf-error-recaptcha-v3-missing");
                const genericErrorElementsList = Array.prototype.slice.call(genericErrorElements);
                genericErrorElementsList.forEach((error) => {
                    error.append(actionElement);
                });

            }
        }

    });

    return controller;
});