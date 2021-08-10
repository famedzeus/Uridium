var artifacts = {

    // This object is mandatory
    "CANVAS": {
        "SCREEN": {
            alias: "DISPLAY",
            screenCanvas: null,
            screenContext: null,
            offScreenCanvas: null,
            offScreenContext: null,
            frameCount:0,
            lastFrameCount:0,
            frameTimer:null,
            initialise: function (artifact,fn) {
                this.screenCanvas = document.getElementById('screenCanvas');
                this.screenContext = this.screenCanvas.getContext("2d");
                this.screenCanvas.width = width;
                this.screenCanvas.height = height;

                this.offScreenCanvas = document.createElement('canvas');
                this.offScreenContext = this.offScreenCanvas.getContext("2d");
                this.offScreenCanvas.width = width;
                this.offScreenCanvas.height = height;
                this.offScreenContext.font = "25px Verdana";

                frameUtils.animationManager.start(this.offScreenContext);

                fn(artifact);
            },
            update: function () {
                if(!this.frameTimer) {
                    this.frameTimer = setInterval(function(){
                        frame.DISPLAY.lastFrameCount = frame.DISPLAY.frameCount;
                        frame.DISPLAY.frameCount = 0;
                    },1000);
                }
                if (!frame.updatingArtifacts) {

                    this.processing = true;
                    for (particle in particles) {
                        particles[particle].update(particle);
                    }

                    this.offScreenContext.globalAlpha = frame.getOpacity();

                    this.screenContext.drawImage(this.offScreenCanvas, 0, 0);
                    this.processing = false;

                    this.frameCount++;

                }
            }
        }
    },
    "ASSETS":{
        "LOADING":{
            initialise:function(artifact, fn){
                fn(artifact);
            },
            update:function() {
                frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                frame.DISPLAY.offScreenContext.fillText("Loading assets..." + frame.numberOfArtifactsInitialised,100,100);
            }
        }
    },
    "TRANSITION": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "CONNECTING": {
            delay: 0,
            initialise: function (artifact,fn) {
                this.delay = 100;
                fn(artifact);
            },
            reset: function () {
                this.delay = 100;
            },
            gotoFrame: function (newFrame) {
                this.newFrame = newFrame;
            },
            update: function (artifact) {
                if (this.delay > 0) {
                    this.delay--;
                    frame.DISPLAY.offScreenContext.clearRect(0, 0, width, height);
                    frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + ",0," + frameUtils.strobeColour.getStrobe() + ")";
                    frameUtils.centreText(frame.DISPLAY.offScreenContext, "Connecting...", height / 2);
                }
                else {
                    frame.gotoMode(this.newFrame);
                }
            }
        },
        "USE1": {
            frame: "EFFECTS",
            name: "STATIC"
        }
    },
    "START-SCREEN": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "BACKGROUND": {
            image: null,
            x: 0,
            y: 0,
            opacity: 1,
            initialise: function (artifact,fn) {
                this.image = document.createElement("IMG");
                this.image.src = "./images/bg.jpg";
                this.x = -800;
                this.y = -600;
                this.opacity = 1;
                fn(artifact);
            },
            reset: function () {
                this.opacity = 1;
            },
            update: function () {
                //this.x -= .1;
                frame.DISPLAY.offScreenContext.globalAlpha = this.opacity;
                frame.DISPLAY.offScreenContext.drawImage(this.image, this.x, this.y);
                frame.DISPLAY.offScreenContext.globalAlpha = 1;
            }
        },
        /*
        "MORPH-TEXT":{
            x:0,
            y:0,
            shake:2,
            text:"",
            gradient:null,
            move:0,
            rad:0,
            share:0,
            pivots:[{pos:0,pos2:1},{pos:0.33,pos2:0.66},{pos:0.66,pos2:0.33}],
            initialise:function() {
                this.text = "1234567890";
                this.x = 0;
                this.y = 200;
                this.share = 1;

            },
            update:function() {
                var s = frame.DISPLAY.offScreenContext.measureText(this.text);
                this.gradient = frame.DISPLAY.offScreenContext.createLinearGradient(this.x,this.y,this.x+s.width+10,this.y+20);

                for(var p in this.pivots){
                    this.pivots[p].pos -= 0.005;
                    if(this.pivots[p].pos < 0){
                        this.pivots[p].pos = 1;
                    }
                    this.pivots[p].pos2 += 0.005;
                    if(this.pivots[p].pos2 > 1){
                        this.pivots[p].pos2 = 0;
                    }
                }

                //this.gradient.addColorStop(0.5,"rgb(255,255,255)");
                this.gradient.addColorStop(this.pivots[0].pos,"rgba(155,55,55,0.2)");
                this.gradient.addColorStop(this.pivots[1].pos,"rgba(155,155,155,0.2)");
                this.gradient.addColorStop(this.pivots[2].pos,"rgba(255,255,255,0.2)");

            //    this.gradient.addColorStop(this.pivots[0].pos2,"rgba(255,255,255,0.5)");
            //    this.gradient.addColorStop(this.pivots[1].pos2,"rgba(155,155,155,0.5)");
            //    this.gradient.addColorStop(this.pivots[2].pos2,"rgba(55,55,55,0.5)");

                // Fill with gradient
                frame.DISPLAY.offScreenContext.fillStyle=this.gradient;
                //frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                //frame.DISPLAY.offScreenContext.font = "" + frameUtils.random(30,32) + "px Arial";
                frame.DISPLAY.offScreenContext.fillText(this.text,this.x,this.y);
                frame.DISPLAY.offScreenContext.font = "30px Arial";
            }
        },*/
        "URIDIUM-IMAGE": {
            splashImage: null,
            x: 0,
            initialise: function (artifact,fn) {
                this.splashImage = document.createElement("IMG");
                this.splashImage.src = "./images/uridium.png";
                this.splashImage.onload = function() {
                    this.x = 1000;
                    fn(artifact);
                };
            },
            update: function () {
                frame.DISPLAY.offScreenContext.globalAlpha = 0.8;
                frame.DISPLAY.offScreenContext.drawImage(this.splashImage, (width / 2) - (this.splashImage.width / 2), 100);
                frame.DISPLAY.offScreenContext.globalAlpha = 1;
                this.x -= 0.5;
                if (this.x == -2000)
                    this.x = 1000;
            }
        },
        "PRESS-A-KEY-TO-START": {
            keyHit: false,
            fadeInCount: 0,
            initialise: function (artifact,fn) {
                this.keyHit = false;
                this.fadeInCount = 0;
                document.onkeyup = function (e) {
                    artifacts["START-SCREEN"]["PRESS-A-KEY-TO-START"].keyHit = true;
                }
                fn(artifact);
            },
            update: function () {
                frame.DISPLAY.offScreenContext.fillStyle = "rgba(" + frameUtils.strobeColour.getStrobe() + ",0,0," + this.fadeInCount + ")";
                frameUtils.centreText(frame.DISPLAY.offScreenContext, "PRESS A KEY TO START", height - 100);
                this.fadeInCount += 0.005;
                if (this.keyHit) {
                    frame["TRANSITION,CONNECTING"].newFrame = "MAIN-GAME";
                    frame.gotoMode("TRANSITION");
                }
            }
        }
    },
    "MAIN-GAME": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "KEY-DOWN": {
            initialise: function (artifact,fn) {
                document.onkeydown = function (e) {

                    e = e || window.event;

                    var player = frame.PLAYER;

                    // Player right
                    if (e.keyCode == 39) {
                        player.playerXDirection = "RIGHT";
                    }
                    // Player left
                    if (e.keyCode == 37) {
                        player.playerXDirection = "LEFT";
                    }
                    if (e.keyCode == 40) {
                        player.playerYDirection = "DOWN";
                    }
                    if (e.keyCode == 38) {
                        player.playerYDirection = "UP";
                    }
                    if (e.keyCode == 80) {
                        frame.togglePause();
                    }

                        //console.log(e.keyCode);

                    // Fire
                    if (e.keyCode == 32) {
                        player.playerFiring = true;
                    }

                    downKeyCode = e.keyCode;
                };
                fn(artifact);
            },
            update: function () {

            }
        },
        "KEY-UP": {
            initialise: function (artifact,fn) {
                document.onkeyup = function (e) {
                    var player = frame.PLAYER;

                    if (e.keyCode == 39 || e.keyCode == 37) {
                        player.playerXDirection = "";
                    }
                    if (e.keyCode == 40 || e.keyCode == 38) {
                        player.playerYDirection = "";
                    }
                    if (e.keyCode == 32) {
                        player.playerFiring = false;
                    }
                    if (e.keyCode == 13) {
                        //	if(numberOfNeutrons > 0) {
                        //		neutrons.push(new Neutron());
                        //		numberOfNeutrons--;
                        //	}
                    }

                    keyHit = true;

                    upKeyCode = e.keyCode;
                };
                fn(artifact);
            },
            reset: function () {
                this.initialised = false;
                this.initialising = false;
            },
            update: function () {

            }
        },
        "STARS": {
            canvas: null,
            context: null,
            initialise: function (artifact,fn) {
                this.canvas = document.createElement('canvas');
                this.context = this.canvas.getContext("2d");
                this.canvas.width = width;
                this.canvas.height = height;

                var fillStyle = "rgb(0,0,0)";
                this.context.fillStyle = fillStyle;
                this.context.fillRect(0, 0, width, height);

                fillStyle = "rgb(255,255,255)";
                this.context.fillStyle = fillStyle;
                for (var a = 0; a < 300; a++) {
                    var x = frameUtils.random(0, width);
                    var y = frameUtils.random(0, height);
                    this.context.fillRect(x, y, frameUtils.random(1, 2), frameUtils.random(1, 2));
                }

                this.x = 0;
                this.y = 0;
                this.opacity = 0;
                fn(artifact);
            },
            update: function () {
                if (this.opacity < 1)
                    this.opacity += 0.01;

                frame.DISPLAY.offScreenContext.drawImage(this.canvas, 0, 0);
                //frame.DISPLAY.offScreenContext.globalAlpha = this.opacity;
                //frame.DISPLAY.offScreenContext.drawImage(this.image,this.x-500,this.y-500);
                //frame.DISPLAY.offScreenContext.globalAlpha = 1;
            },
            reset: function () {
                this.x = 0;
                this.opacity = 0;
            }
        },
        "MESSAGE": {
            messages: [],
            message: '',
            messagesCount: 0,
            opacity: 0,
            initialise: function (artifact,fn) {
                this.messages = [];
                this.message = "";
                this.messagesCount = [];
                this.opacity = 0;
                fn(artifact);
            },
            createProperty: function (message) {
                this.messages.push(message);
                this.messagesCount++;
            },
            update: function () {

                for (var message in this.messages) {
                    if (this.messages[message].message != '') {

                        var length = frame.DISPLAY.offScreenContext.measureText(this.messages[message]).width;
                        frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + ",0,0)";
                        frame.DISPLAY.offScreenContext.fillText(this.messages[message], (width / 2) - (length / 2), (height / 2) + (message * 20));
                        this.messagesCount[message]++;
                        if (this.messagesCount[message] == 500) {
                            this.messages.splice(message, 1);
                            this.messagesCount.splice(message, 1);
                        }
                    }
                }
            }
        },
        "SCOREBOARD": {
            alias: "HUD",
            radiation: 0,
            numberOfNeutrons: 0,
            score: 0,
            countdown: 0,
            lastBonusScore: 0,
            scoreTarget: 0,
            initialise: function (artifact,fn) {
                this.countdown = 10000;
                this.score = 0;
                this.numberOfNeutrons = 0;
                this.lastBonusScore = false;
                this.radiation = 0;
                this.scoreTarget = 0;
                //this.countdownTimer = setInterval(this.updateCountdown(this.countdown),1000,true);
                fn(artifact);
            },
            updateCountdown: function (countdown) {
                countdown--;
                frame.DISPLAY.offScreenContext.fillText(Math.floor(countdown / 60) + ":" + countdown % 60, 320, 25);
                if (countdown == 0)
                    alert("!");
            },
            reset: function () {
                if (frame.HUD.countdown < 10)
                    frame.HUD.countdown = 10;
                else
                    this.countdown = 10000;
            },
            addScore: function (target) {
                this.scoreTarget += target;
            },
            update: function () {

                if (this.scoreTarget > 0) {
                    this.score += 10;
                    this.scoreTarget -= 10;
                }

                frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                frame.DISPLAY.offScreenContext.fillText(frameUtils.getFormattedScore(Math.floor(this.score)), 20, 40);

                frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                frame.DISPLAY.offScreenContext.fillText("" + frame.DISPLAY.lastFrameCount + "fps",100,100);

                this.countdown -= 0.008;
                if (this.countdown < 11) {

                    frameUtils.centreText(frame.DISPLAY.offScreenContext, Math.floor(this.countdown), 30);
                    frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + ",0,0)";
                    frameUtils.centreText(frame.DISPLAY.offScreenContext, "LAND NOW!", 60);

                    // Can player land?
                    // Has it hit threshold?
                    if(frame.getMode() != "LAND") {
                        var points = frame.PLAYER.getCollisionPoints(0);
                        if ((points[1] > 200 && points[1] < 220) && frame.PLAYER.speed > 0) {
                            frame.gotoMode("LAND");
                        }
                    }
                }
                // Has ship landed within countdown?
                if (this.countdown <= 0) {
                    frame.PLAYER.playerExploding = true;
                }

                frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";

                //frame.DISPLAY.offScreenContext.fillText("" + frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills, width - 160, 40);

                if(frame.PLAYER.playerRollRightImages.length > 0) {
                    frame.DISPLAY.offScreenContext.drawImage(frame.PLAYER.playerRollRightImages[1], width - 80, 10);
                }
                frame.DISPLAY.offScreenContext.fillText(frame.PLAYER.lives, width - 30, 40);

                //drawSlider("Acc:",120,5,25*2,frame["MAIN-GAME,ALIEN-WAVE"].killAverage*2);
            //    frame.DISPLAY.offScreenContext.fillText("AVERAGE:" + frame["MAIN-GAME,ALIEN-WAVE"].killAverage,120,25);
            //    frame.DISPLAY.offScreenContext.fillText("ACCURACY:" + frame.PLAYER.playerStats.accuracy + "%",400,25);

                var waves = frame["MAIN-GAME,ALIEN-WAVE"].numberOfWaves % 20;
                if (waves == 0 && frame["MAIN-GAME,ALIEN-WAVE"].numberOfWaves > 0) {
                    frame["MAIN-GAME,MESSAGE"].createProperty(frameUtils.getFormattedScore(this.score));
                    frame.PLAYER.lives++;
                    this.score += 10;
                    frame["MAIN-GAME,ALIEN-WAVE"].level++;
                    frame["MAIN-GAME,ALIEN-WAVE"].numberOfWaves = 0;
                    frame.gotoMode("BONUS-GAME");
                }
            }
        }
    },
    "GAME-OVER": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "USE1": {
            frame: "MAIN-GAME",
            name: "STARS"
        },
        "USE2": {
            frame: "MAIN-GAME",
            name: "LEVEL"
        },
        "USE3": {
            frame: "EFFECTS",
            name: "STATIC"
        },
        "USE4": {
            frame: "MAIN-GAME",
            name: "LEVEL-FURNITURE"
        },
        "USE5": {
            frame: "MAIN-GAME",
            name: "ALIENS"
        },
        "USE51": {
            frame: "MAIN-GAME",
            name: "TEZZALARS"
        },
        "DEAD": {
            fadeInCount: 0,
            count: 0,
            initialise: function (artifact,fn) {
                this.fadeInCount = 0;
                this.count = 0;
                fn(artifact);
            },
            reset: function () {
                this.count = 0;
                this.fadeInCount = 0;
            },
            update: function () {
                keyHit = false;
                frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + ",0," + frameUtils.strobeColour.getStrobe() + ")";
                frameUtils.centreText(frame.DISPLAY.offScreenContext, "Connection lost...", width / 2);
                this.count++;
                this.fadeInCount += 0.005;

                if (frame.LEVEL.opacity >= 0.004)
                    frame.LEVEL.opacity -= 0.004;
                if (frame["MAIN-GAME,STARS"].opacity >= 0.004)
                    frame["MAIN-GAME,STARS"].opacity -= 0.004;

                if (this.count == 300) {
                    frame.resetAll(artifacts);
                    frame.gotoMode("START-SCREEN");
                }
            }
        }
    },
    "EFFECTS": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "STATIC": {
            opacity: 0,
            raster: 0,
            initialise: function (artifact,fn) {
                this.opacity = 0;
                this.raster = -100;
                fn(artifact);
            },
            reset: function () {
                this.opacity = 0;
            },
            update: function () {
                // Static
                for (var a = 0; a < 1200; a++) {
                    x = frameUtils.random(0, width);
                    y = frameUtils.random(0, height);
                    var c = frameUtils.random(0, 255);
                    var flicker = frameUtils.random(0, 500);
                    frame.DISPLAY.offScreenContext.fillStyle = "rgba(" + c + "," + c + "," + c + "," + this.opacity + ")";
                    frame.DISPLAY.offScreenContext.fillRect(x, y, 2, 2);
                }
                this.opacity += 0.005;

                frame.DISPLAY.offScreenContext.fillStyle = "rgba(255,255,255,1)";
                line = frameUtils.random(0, 100);
                if (line < 5) {
                    frame.DISPLAY.offScreenContext.fillRect(x, 0, 2, height);
                }

                frame.DISPLAY.offScreenContext.fillStyle = "rgba(255,255,255,0.1)";
                frame.DISPLAY.offScreenContext.fillRect(0, this.raster, width, 100);

                this.raster += 1;
                if (this.raster > height + 40)
                    this.raster = -100;
            }
        }
    },
    "PLAYER-DIED": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "USE1": {
            frame: "MAIN-GAME",
            name: "STARS"
        },
        "USE2": {
            frame: "MAIN-GAME",
            name: "LEVEL"
        },
        "USE3": {
            frame: "EFFECTS",
            name: "STATIC"
        },
        "USE4": {
            frame: "MAIN-GAME",
            name: "LEVEL-FURNITURE"
        },
        "USE5": {
            frame: "MAIN-GAME",
            name: "ALIENS"
        },
        "USE6": {
            frame: "MAIN-GAME",
            name: "TEZZALARS"
        },
//        "USE7": {
//            frame: "MAIN-GAME",
 //           name: "POWER-UP-LASERS"
//        },
        "USE8": {
            frame: "MAIN-GAME",
            name: "SILOS"
        },
        "USE9": {
            frame: "MAIN-GAME",
            name: "SILO-MINES"
        },
        "STAND-BY": {
            count: 0,
            fadeInCount: 0,
            initialise: function (artifact,fn) {
                this.count = 0;
                this.fadeInCount = 0;
                fn(artifact);
            },
            reset: function () {
                this.count = 0;
                this.fadeInCount = 0;
            },
            update: function () {
                keyHit = false;
                frame.DISPLAY.offScreenContext.fillStyle = "rgba(0,0,0," + this.fadeInCount + ")";
                frameUtils.centreText(frame.DISPLAY.offScreenContext, "Signal interrupted...reconnecting...", width / 3);
                this.count++;
                this.fadeInCount += 0.005;

                if (frame.LEVEL.opacity >= 0.004)
                    frame.LEVEL.opacity -= 0.004;
                if (frame["MAIN-GAME,STARS"].opacity >= 0.004)
                    frame["MAIN-GAME,STARS"].opacity -= 0.004;

                frame.DISPLAY.offScreenContext.font = "40px Arial";

                if (this.count == 200) {
                    frame.gotoMode("MAIN-GAME");
                }
            }
        }
    },
    "LAND": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "USE1": {
            frame: "MAIN-GAME",
            name: "STARS"
        },
        "USE2": {
            frame: "MAIN-GAME",
            name: "LEVEL"
        },
        "USE4": {
            frame: "MAIN-GAME",
            name: "LEVEL-FURNITURE"
        },
        "USE5": {
            frame: "MAIN-GAME",
            name: "SCOREBOARD"
        },
        "LAND": {
            landed: false,
            initialise: function (artifact,fn) {
                this.landed = false;
                fn(artifact);

            },
            update: function () {
                var player = frame.PLAYER;
                frame.DISPLAY.offScreenContext.globalAlpha = 0.5;
                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImageShadows[1], player.x + player.height, player.y + player.height);
                frame.DISPLAY.offScreenContext.globalAlpha = 1;
                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImages[1], player.x, player.y);

                if (!this.landed) {
                    player.height -= 0.5;
                    if (player.speed > 0.0001)
                        player.speed -= .1;
                    if (player.height < 0) {
                        player.height = 1;
                        player.speed = 0.0001;
                    }
                    if (player.height == .5 && player.speed == 0.0001) {
                        this.landed = true;
                        frame.HUD.countdown = 10000;

                        this.accuracyBonus = (100 / frame.PLAYER.playerStats.shots) * frame["MAIN-GAME,ALIEN-WAVE"].totalKills;
                        this.accuracyBonus = !this.accuracyBonus ? 0 : this.accuracyBonus;
                    }
                }
                else {

                    // add bonus points
                    if (frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills > 0) {

                        frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + ",0," + frameUtils.strobeColour.getStrobe() + ")";
                        frameUtils.centreText(frame.DISPLAY.offScreenContext, "WAVE KILLS: " + Math.floor(frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills), height / 2);
                        frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills -= 0.1;
                        frame.HUD.addScore(10);
                    }

                    if (this.accuracyBonus > 0) {

                        frame.DISPLAY.offScreenContext.fillStyle = "rgb(0," + frameUtils.strobeColour.getStrobe() + "," + frameUtils.strobeColour.getStrobe() + ")";
                        frameUtils.centreText(frame.DISPLAY.offScreenContext, "ACCURACY BONUS: " + Math.floor(this.accuracyBonus) + "%", (height / 2) + 50);
                        this.accuracyBonus -= 0.5;
                        frame.HUD.addScore(20);
                    }

                    if (frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills <= 0 && this.accuracyBonus <= 0) {
                        frame.gotoMode("TAKE-OFF");
                    }

                }
            },
            reset: function () {
                this.landed = false;
            }
        }
    },
    "TAKE-OFF": {
        "USE0":{
            frame:"CANVAS",
            name:"SCREEN"
        },
        "USE1": {
            frame: "MAIN-GAME",
            name: "STARS"
        },
        "USE2": {
            frame: "MAIN-GAME",
            name: "LEVEL"
        },
        "USE3": {
            frame: "MAIN-GAME",
            name: "PLAYER"
        },
        "TAKE-OFF": {
            mode: 'TAKING-OFF',
            xPos: 0,
            initialise: function (artifact,fn) {
                this.mode = "TAKING-OFF";
                this.xPos = 4000;
                artifacts["MAIN-GAME"]["TEZZALARS"].clearTezzalars = true;
                fn(artifact);
            },
            reset: function () {
                this.xPos = 4000;
                artifacts["MAIN-GAME"]["TEZZALARS"].clearTezzalars = true;
            },
            update: function () {

                var player = frame.PLAYER;
                var levelX = frame.LEVEL.x;

                // Prevent collision and flip actions for player ship
                frame.PLAYER.takingOff = true;

                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImageShadows[1],player.x+player.height,player.y+player.height);
                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImages[1],player.x,player.y);

                // Lift off
                if (player.height < 100) {
                    player.height += 0.4;
                    player.speed += .16;
                }
                else {
                    frame.LEVEL.level++;
                    frame.LEVEL.newLevel = true;
                    frame["MAIN-GAME,ALIEN-WAVE"].level++;
                    frame["TRANSITION,CONNECTING"].newFrame = "MAIN-GAME";
                    frame.PLAYER.lives++;
                    frame.gotoMode("TRANSITION");
                }
           }
        }
    },
    "BONUS": {
        "USE0": {
            frame: "CANVAS",
            name: "SCREEN"
        },
        "USE1": {
            frame: "MAIN-GAME",
            name: "STARS"
        },
        "USE2": {
            frame: "MAIN-GAME",
            name: "LEVEL"
        },
        "SWITCH": {
            switchSpeed: 0,
            values: 0,
            currentValues: 1,
            switchDirection: 300,
            switchCountdown: 0,
            keyPress: false,
            bonusValue: 0,
            bonusOver: false,
            initialise: function (artifact,fn) {
                this.switchSpeed = 50;
                this.values = [{
                    l: 1200,
                    r: 1000,
                    d: 50
                }, {
                    l: 1500,
                    r: 1200,
                    d: 40
                }, {
                    l: 2000,
                    r: 1500,
                    d: 50
                }, {
                    l: 2000,
                    r: 3000,
                    d: 50
                }, {
                    l: 5000,
                    r: 3000,
                    d: 50
                }, {
                    l: 5000,
                    r: 10000,
                    d: 5
                }, {
                    l: 15000,
                    r: 10000,
                    d: 2
                }];
                this.currentValues = 1;
                this.switchDirection = -300;
                this.switchCountdown = this.values[0].d;
                this.keyPress = false;
                this.bonusValue = 0;
                this.bonusOver = false;

                document.onkeyup = function (e) {
                    artifacts["BONUS"]["SWITCH"].keyPress = true;
                }

                fn(artifact);
            },
            reset: function () {
                this.initialise();
            },
            update: function () {

                //offScreenContext.clearRect(0,0,800,600);
                //offScreenContext.clearRect(700,100+this.currentValues*100,100,40);
                var player = frame.PLAYER;
                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImageShadow, 47, 0, 48, 46, player.x + player.height, player.y + player.height, 48, 46);
                frame.DISPLAY.offScreenContext.drawImage(player.playerRollRightImage, 47, 0, 48, 46, player.x, player.y, 48, 46);

                if (this.switchCountdown > 0) {

                    var ypos = 600 - (this.currentValues * 100);
                    var xpos = 350 - this.switchDirection;

                    frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                    frame.DISPLAY.offScreenContext.fillRect(xpos, ypos, 100, 40);
                    frame.DISPLAY.offScreenContext.fillStyle = "rgb(0,0,0)";

                    // Left
                    if (this.switchDirection < 0)
                        frame.DISPLAY.offScreenContext.fillText(this.values[this.currentValues].l, xpos, ypos + 30);
                    else
                        frame.DISPLAY.offScreenContext.fillText(this.values[this.currentValues].r, xpos, ypos + 30);

                    frame.DISPLAY.offScreenContext.fillRect(350 + this.switchDirection, ypos, 100, 40);

                    if (this.keyPress) {
                        this.keyPress = false;
                        if (this.values[this.currentValues].l == "Quit" || this.values[this.currentValues].l == this.bonusValue) {
                            //frame.HUD.addScore(this.bonusValue);
                            //frame.gotoMode("MAIN-GAME",1000);
                            this.bonusOver = true;
                        }
                        else {
                            this.bonusValue = this.values[this.currentValues].l;
                            this.switchDirection += 40;
                            this.currentValues++;
                        }
                    }

                    this.switchCountdown--;
                }
                else {
                    if (!this.bonusOver) {
                        this.switchDirection = -this.switchDirection;
                        this.switchCountdown = this.values[this.currentValues].d;
                    }
                }

                if (this.bonusOver) {

                    if (this.values[this.currentValues].l > 0) {
                        frame.HUD.update();
                        this.values[this.currentValues].l -= 10;
                        frame.HUD.addScore(10);
                        frame.DISPLAY.offScreenContext.fillStyle = "rgb(" + frameUtils.strobeColour.getStrobe() + "," + frameUtils.strobeColour.getStrobe() + "," + frameUtils.strobeColour.getStrobe() + ")";
                        frameUtils.centreText(frame.DISPLAY.offScreenContext, this.values[this.currentValues].l, width / 2);
                    }
                    else {
                        level++;
                        frame["TRANSITION,CONNECTING"].newFrame = "MAIN-GAME";
                        frame.gotoMode("TRANSITION");
                    }
                }
            }
        }
    }
};