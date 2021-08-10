document.addEventListener('DOMContentLoaded', function () {

    frame.addArtifacts(artifacts);

    frame.onInitialiseArtifact(function (frame, artifact) {
        if (frame === "SCREEN") {
            ctx = frame.DISPLAY.offScreenContext;
        }
    });

    frame.onChangeMode(function(newMode){
    });

    frame.onResetArtifact(function(mode,artifact){
    });

    frame.gotoMode("CANVAS"); // cause initialise of canvas artifact
    frame.gotoMode("START-SCREEN");

    var lastRender = Date.now();

    var updateParticles = function () {
        for (particle in particles) {
            particles[particle].update(particle);
        }
    };

});

var startGame = function () {
    //setInterval(frame.update, 6);
    frame.update();
};
