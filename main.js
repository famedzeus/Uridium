// const {app, BrowserWindow} = require('electron')

var screenCanvas, offScreenCanvas, screenContext, offScreenContext;
var width = 800;
var height = 600;
var keyHit = false;
var playerDirection = 0;
var processing = false;
var upKeyCode = 0;
var downKeyCode = 0;
var playerCollisionData = [];
var level = 0;
var ctx;

var levelImages = [];
for(var a = 0; a < 6 ; a++) {
    levelImages.push(document.createElement('img'));
    levelImages[a].src = "./images/level" + (a+1) + ".png";
}




document.addEventListener('DOMContentLoaded', function () {

//    ff.forFrame("Jackpot","Reel","Spinner",function(){
  //      ff.addGroup("reels",{items:[{}],methods:[]});
    //});

/*
    //ff.newGame("Jackpot");
    //ff.addMode("Jackpot","REEL");
    //ff.addFrame("Jackpot","REEL","SPINNER");
    ff.addGroup("Jackpot","REEL","SPINNER","reels",3,{
        update:function(item) {
            var x = 1;
        }
    });
    ff.addItemToGroup("Jackpot","REEL","SPINNER","reels",{x:1});
    ff.Jackpot.REEL.SPINNER.update();
*/
    try{
        frame.addArtifacts(artifacts);
    } catch(e){
        console.log(e);
    }

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

var drawImage = function (context, image, x, y, rgba) {
    if ((x > -1 && x < width) && (y > -1 && y < height)) {
        if (rgba) {
            context.fillStyle = rgba;
        }
        context.drawImage(image, Math.floor(x), Math.floor(y));
    }
};

//document.onkeydown = processKeyDown;
//document.onkeyup = processKeyUp;
var bigExplosion = function (x, y) {
    for (var i = 0; i < 20; i++) {
        particles.push(new Particle({
            x: x,
            y: y,
            life: frameUtils.random(0,300),
            xSpeed: frameUtils.random(-6,6,true),
            ySpeed: frameUtils.random(-6,6,true),
            size: 3,
            startColours: [255, Math.floor(Math.random() * 255), 0],
            endColours: [0, 0, 0],
            wind: [0, 0.1]
        }));
        particles.push(new Particle({
            x: x,
            y: y,
            life: Math.random() * 500,
            xSpeed: frameUtils.random(-9,9,true),
            ySpeed: frameUtils.random(-9,9,true),
            size: 2,
            startColours: [Math.floor(Math.random() * 255), 0, 0],
            endColours: [0, 0, 0]
        }));
    }
};

var minorExplosion = function (x, y) {

    particles.push(new Particle({
        x: x,
        y: y,
        life: Math.random() * 300,
        xSpeed: frameUtils.random(-8,8),
        ySpeed: frameUtils.random(-8,8),
        size: 3,
        startColours: [255, Math.floor(Math.random() * 255), 0],
        endColours: [0, 0, 0],
        wind: [0, 0.1]
    }));

};

var drawSlider = function (title, x, y, max, value) {

    var titleLength = offScreenContext.measureText(title).width;
    var titleHeight = offScreenContext.measureText(title).height;

    // Outer rect
    offScreenContext.fillStyle = "rgb(255,255,255)";
    offScreenContext.fillRect(x + titleLength, y, max, 20);

    //inner value
    offScreenContext.fillStyle = "rgb(0,255,0)";
    offScreenContext.fillText(title, x, y + 15);
    offScreenContext.fillRect(x + 1 + titleLength, y + 2, value, 18 - 2);

    offScreenContext.fillStyle = "rgb(0,0,0)";
    offScreenContext.font = "15px Impact";

    offScreenContext.fillText(Math.floor((value / max) * 100) + "%", x + (max / 2), y + 15);
    offScreenContext.font = "20px Impact";
};

var followTrack = function (obj) {

    if (obj.track[obj.trackCount].startX && obj.track[obj.trackCount].startY) {
        obj.x = obj.track[obj.trackCount].startX;
        obj.y = obj.track[obj.trackCount].startY;
    }

    if (obj.track[obj.trackCount].timesCount == undefined) {
        obj.track[obj.trackCount].timesCount = obj.track[obj.trackCount].times;
    }

    if (obj.track[obj.trackCount].x) {
        var x = obj.track[obj.trackCount].x;
        var y = obj.track[obj.trackCount].y;
        obj.x += x;
        obj.y += y;
    }

    if (obj.track[obj.trackCount].xPos) {
        var x = obj.track[obj.trackCount].xPos;
        var y = obj.track[obj.trackCount].yPos;
        if (x > obj.x)
            obj.x += 2;
        if (x < obj.x)
            obj.x -= 2;
        if (y < obj.y)
            obj.y -= 2;
        if (y > obj.y)
            obj.y += 2;
    }

    var times = obj.track[obj.trackCount].times;

    obj.xDirection = obj.x < 0 ? 'LEFT' : 'RIGHT';

    obj.track[obj.trackCount].timesCount--;
    if (obj.track[obj.trackCount].timesCount == 0) {
        obj.trackCount++;
        if (obj.trackCount == obj.track.length) {
            obj.trackCount = 0;
        }
        obj.track[obj.trackCount].timesCount = obj.track[obj.trackCount].times;
    }
};

var getTrack = function (t, startX, startY) {

    //var t = Math.floor(Math.random()*2);
    if (t > 9) t = 9;

    var straightRight = function() {
        return [{
            x: 6,
            y: 0,
            times: 8000
        }];
    };

    var straightLeft = function() {
        return [{
            x: -6,
            y: 0,
            times: 8000
        }];
    };

    var circularRight = function() {
        var circle = [];
        var track = [];
        for (var r = 0; r < 5; r += 0.01) {
            var x = Math.cos(r) * 200;
            var y = (Math.sin(r) * 200) + 400;
            track.push({
                xPos: x,
                yPos: y,
                times: 1
            });
        }

        // Then straight
        track.push({
            x: 6,
            y: 0,
            times: 400
        });

        return track;
    };

    var circularLeft = function() {
        var circle = [];
        var track = [];
        for (var r = 0; r < 5; r += 0.01) {
            var x = Math.cos(r) * 200;
            var y = (Math.sin(r) * 200) + 400;
            track.push({
                xPos: x,
                yPos: y,
                times: 1
            })
        }

        // Then straight
        track.push({
            x: -6,
            y: 0,
            times: 400
        });

        return track;
    };

    switch (t) {

        case 0:
            return straightRight();
        case 1:
            return straightLeft();
        case 2:
            return circularRight();
        case 3:
            return circularLeft();
        case 4:
            return circularRight();
        case 5:
            return circularLeft();
        case 6:
            return straightRight();
        case 7:
            return straightLeft();
        case 8:
            return straightRight();
        case 9:
            return straightLeft();
    }
};