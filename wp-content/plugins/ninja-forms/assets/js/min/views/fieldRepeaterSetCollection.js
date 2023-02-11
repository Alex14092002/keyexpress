define('views/fieldRepeaterSetCollection', ['views/fieldRepeaterSetLayout'], function(repeaterSetLayout) {
    var view = Marionette.CollectionView.extend({
        tagName: 'div',
        childView: repeaterSetLayout,
    });

    return view;
});