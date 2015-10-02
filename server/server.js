


Meteor.startup(function () {
    // reset the state
    Viewport.remove({});
    Viewport.insert({});

    Meteor.publish("ViewportSession", function () {
        return Viewport.find();
    });

    SlideSync.remove({});
    SlideSync.insert({});
    Meteor.publish("SlideSession", function () {
        return SlideSync.find();
    });
});
