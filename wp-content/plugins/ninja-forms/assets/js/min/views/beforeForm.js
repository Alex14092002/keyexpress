define('views/beforeForm', [], function() {

    var view = Marionette.ItemView.extend({
        tagName: "nf-section",
        template: "#tmpl-nf-before-form",

    });

    return view;
});