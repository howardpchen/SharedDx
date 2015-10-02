ClientId = Random.id(); // "unique" id for this client - so we can ignore state updates from ourself

// counter starts at 0
Session.setDefault('counter', 0);
Meteor.startup(function () {

});

Template.imageContainer.onCreated(function() {
    this.subscribe("ViewportSession");
});

Template.sampleSlides.onRendered( function () {
    Reveal.initialize();

    Meteor.subscribe("SlideSession", function () {

        Reveal.addEventListener( 'slidechanged', function( event ) {
            var ss = SlideSync.findOne();
            if (DEBUG) console.log("SlideSync: " + ss);
            var cur_state = getRevealState();
            if (!ss) {
                SlideSync.insert(
                    {clientId: ClientId, state: cur_state}
                );
                if (DEBUG) console.log("First time saving state");
                if (DEBUG) console.log(cur_state);
            }
            else {
                SlideSync.update(
                    {_id: ss._id},
                    {clientId: ClientId, state: cur_state}
                );
                if (DEBUG) console.log("Found state, now updating");
            }
        }, false);
        updateSlides = function () {
            var ss = SlideSync.findOne();

            // On initial connect, client-side database has not been initialized yet.
            // Return immediately in this case.
            if (!ss) return;

            var cur_state = ss.state;
            setRevealState(cur_state);
        };

        Deps.autorun(updateSlides);
    });

});


// neo:reveal-js uses v2.6.2,
// So customized getState/setState functions are necessary
// Based on reveal v3.0.0 code.

getRevealState = function () {
    var indices = Reveal.getIndices();

    return {
        indexh: indices.h,
        indexv: indices.v,
        indexf: indices.f,
        paused: Reveal.isPaused(),
        overview: Reveal.isOverview()
    };

}

setRevealState = function (state) {

    if( typeof state === 'object' ) {
        Reveal.slide( deserialize( state.indexh ), deserialize( state.indexv ), deserialize( state.indexf ) );

        var pausedFlag = deserialize( state.paused ),
            overviewFlag = deserialize( state.overview );

        if( typeof pausedFlag === 'boolean' && pausedFlag !== Reveal.isPaused() ) {
            Reveal.togglePause( pausedFlag );
        }

        if( typeof overviewFlag === 'boolean' && overviewFlag !== Reveal.isOverview() ) {
            Reveal.toggleOverview( overviewFlag );
        }
    }
}

/**
 * Utility for deserializing a value.
 */
function deserialize( value ) {

    if( typeof value === 'string' ) {
        if( value === 'null' ) return null;
        else if( value === 'true' ) return true;
        else if( value === 'false' ) return false;
        else if( value.match( /^\d+$/ ) ) return parseFloat( value );
    }

    return value;

}
