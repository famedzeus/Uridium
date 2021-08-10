artifacts["MAIN-GAME"]["PLAYER"] = {

    alias: "PLAYER",
    playerRollRightImages: [],
    playerRollLeftImages: [],
    playerRollLeftImageShadows: [],
    playerRollRightImageShadows: [],
    flipImages: [],
    flipImageShadows: [],
    playerExplodeImages: document.createElement("IMG"),
    playerExplodingFrame: 0,
    playerExplodingDelay: 0,
    x: width / 2,
    y: height / 2,
    playerExploding: false,
    playerFireCount: 0,
    lives: 5,
    height: 20,
    powerUp: 0,
    powerUpTimer: 100,
    speed: -1,
    explodingCount: 300,
    playerStats: {},
    collisionWidth: 48, //this.playerImage.width,
    collisionHeight: 46, //this.playerImage.height,
    collisionImage: this.playerImage,
    preventExplode: false,
    playerCollisionData: [],
    initialise: function (artifact, fn) {

        frameUtils.createAnimationImagesArray("./images/player-roll-right.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].playerRollRightImages = a;
        });
        frameUtils.createAnimationImagesArray("./images/player-roll-left.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].playerRollLeftImages = a;
        });
        frameUtils.createAnimationImagesArray("./images/player-roll-right-shadow.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].playerRollRightImageShadows = a;
        });
        frameUtils.createAnimationImagesArray("./images/player-roll-left-shadow.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].playerRollLeftImageShadows = a;
        });
        frameUtils.createAnimationImagesArray("./images/flip.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].flipImages = a;
        });
        frameUtils.createAnimationImagesArray("./images/flip-shadow.png",48,46,function(a) {
            artifacts["MAIN-GAME"]["PLAYER"].flipImageShadows = a;
            fn(artifact);
        });

        this.x = width / 2;
        this.y = height / 2;
        this.playerExploding = false;
        this.playerFireCount = 0;
        this.lives = 5;
        this.height = 20;
        this.powerUp = 0;
        this.powerUpTimer = 100;

        this.speed = -1;
        this.explodingCount = 50;

        this.playerStats = {};
        this.playerStats.accuracy = 0;
        this.playerStats.shots = 0;

        this.collisionWidth = 48; //this.playerImage.width;
        this.collisionHeight = 46; //this.playerImage.height;
        this.collisionImage = this.playerImage;
        this.preventExplode = false;

        this.playerCollisionData = [];
    },
    reset: function () {

        this.playerExploding = false;
        this.explodingCount = 50;
        this.playermode = "";
        this.speed = -1;
        this.y = height / 2;
        this.height = 20;
        this.playerYDirection = "";
        this.playerXDirection = "";
        playerCollisionData = [];
        this.playerStats.accuracy = 0;
        this.playerStats.shots = 0;
        this.takingOff = false;

        //this.playerXDirection = "LEFT";

        //                this.playerStats = {};
        //               this.playerStats.accuracy = 0;
        //             this.playerStats.shots = 0;
    },
    update: function () {

        //frame.DISPLAY.fillText(this.playerXDirection +":" + this.playerYDirection,300,300);
        //frame.DISPLAY.fillText(this.y,300,300);
        var ctx = frame.DISPLAY.offScreenContext;

        if (!this.playerExploding && !this.takingOff) {

            if (this.playerYDirection == "DOWN" && this.y < 450) {
                this.y += 6;
            }
            if (this.playerYDirection == "UP" && this.y > 100) {
                this.y -= 6;
            }

            var flipSpeed = 0.60;
            var rollSpeed = 0.60;

            if (this.playerXDirection == "RIGHT" && this.playerMode != "TURNINGRIGHT") {
                // Threshold for flip right
                if (this.speed > -1 && this.speed < 0) {
                    this.playerMode = "TURNINGRIGHT";
                    var player = frame.PLAYER;
                    frameUtils.animationManager.killAnimation("TURNLEFT");
                    // Flip right
                    frameUtils.animationManager.addAnimation("TURNRIGHT", {
                        mode: 'FLIPRIGHT', delay: 4, startFrame: 13, endFrame: 6, player: player
                    }, function (anim) {
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(anim.player.flipImageShadows[anim.frameCount], anim.player.x + anim.player.height, anim.player.y + anim.player.height);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(anim.player.flipImages[anim.frameCount], anim.player.x, anim.player.y);
                        player.speed += 0.15;
                        if (player.exploding)
                            anim.killAnimation = true;
                    });
                    // Then roll right
                    frameUtils.animationManager.addAnimation("TURNRIGHT", {
                        mode: 'ROLLRIGHT', delay: 5, startFrame: 8, endFrame: 0, player:player
                    }, function (anim) {
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(anim.player.playerRollRightImageShadows[anim.frameCount], anim.player.x + anim.player.height, anim.player.y + anim.player.height);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(anim.player.playerRollRightImages[anim.frameCount], anim.player.x, anim.player.y);
                        if (player.exploding)
                            anim.killAnimation = true;
                    }, function (anim) {
                        anim.player.playerMode = "RIGHT";
                    });
                    this.offset = 0;
                }
                else {
                    if (this.speed < 15)
                        this.speed += 0.6;
                }
            }
            if (this.playerXDirection == "LEFT" && this.playerMode != "TURNINGLEFT") {
                // Threshold for flip left
                if (this.speed < 1 && this.speed > 0) {
                    this.playerMode = "TURNINGLEFT";
                    var player = frame.PLAYER;
                    frameUtils.animationManager.killAnimation("TURNRIGHT");
                    // Flip left
                    frameUtils.animationManager.addAnimation("TURNLEFT", {
                        mode: 'FLIPLEFT', delay: 4, startFrame: 0, endFrame: 7
                    }, function (anim) {
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(player.flipImageShadows[anim.frameCount], player.x + player.height, player.y + player.height);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(player.flipImages[anim.frameCount], player.x, player.y);
                        player.speed -= 0.15;
                        if (player.exploding)
                            anim.killAnimation = true;
                    });
                    // Then roll left
                    frameUtils.animationManager.addAnimation("TURNLEFT", {
                        mode: 'ROLLLEFT', delay: 5,  startFrame: 8, endFrame: 0
                    }, function (anim) {
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(player.playerRollLeftImageShadows[1 + anim.frameCount], player.x + player.height, player.y + player.height);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(player.playerRollLeftImages[1 + anim.frameCount], player.x, player.y);
                        if (player.exploding)
                            anim.killAnimation = true;
                    }, function () {
                        player.playerMode = "LEFT";
                    });
                    this.offset = 0;
                }
                else {
                    if (this.speed > -15)
                        this.speed -= 0.6;
                }
            }

            if (this.playerMode != "TURNINGRIGHT" && this.playerMode != "TURNINGLEFT") {
                if (this.speed > 0) {
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(this.playerRollRightImageShadows[1], this.x + this.height, this.y + this.height);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(this.playerRollRightImages[1], this.x, this.y);
                    if (frame.LEVEL.x < -3950) {
                        this.playerXDirection = "LEFT";
                        //this.offset = 0;
                    }
                }
                if (this.speed < 0 && this.playerRollLeftImageShadows.length > 0 ) {
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(this.playerRollLeftImageShadows[1], this.x + 20, this.y + 20);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(this.playerRollLeftImages[1], this.x, this.y);
                    if (frame.LEVEL.x > 600) {
                        this.playerXDirection = "RIGHT";
                        //this.offset = 14;
                    }
                }
            }

            // Hit level object? - test 2 pixels around ship
            var pointsRed = this.getCollisionPoints(0);
            var pointsGreen = this.getCollisionPoints(1);
            var pointsBlue = this.getCollisionPoints(2);
            if ((pointsRed[0] == 33 && pointsGreen[0] == 39 && pointsBlue[0] == 46) ||
                (pointsRed[1] == 33 && pointsGreen[1] == 39 && pointsBlue[1] == 46) ||
                (pointsRed[2] == 33 && pointsGreen[2] == 39 && pointsBlue[2] == 46) ||
                (pointsRed[3] == 33 && pointsGreen[3] == 39 && pointsBlue[3] == 46)) {
                this.playerExploding = true;
            }
            pointsRed = this.getCollisionPoints(3);
            pointsGreen = this.getCollisionPoints(4);
            pointsBlue = this.getCollisionPoints(5);
            if ((pointsRed[0] == 33 && pointsGreen[0] == 39 && pointsBlue[0] == 46) ||
                (pointsRed[1] == 33 && pointsGreen[1] == 39 && pointsBlue[1] == 46) ||
                (pointsRed[2] == 33 && pointsGreen[2] == 39 && pointsBlue[2] == 46) ||
                (pointsRed[3] == 33 && pointsGreen[3] == 39 && pointsBlue[3] == 46)) {
                this.playerExploding = true;
            }

            // Hit tezzalar with ship?
            var levelX = frame.LEVEL.x;

            for (p in artifacts["MAIN-GAME"]["TEZZALARS"].tezzalars) {
                var tezzalar = artifacts["MAIN-GAME"]["TEZZALARS"];
                if (!tezzalar.tezzalars[p].destroyed) {
                    //frame.DISPLAY.offScreenContext.fillRect(tezzalar.tezzalars[p].x + levelX, tezzalar.tezzalars[p].y,tezzalar.tezzalars[p].energyField*2,tezzalar.tezzalars[p].energyField*2);
                    frameUtils.checkForCollision(tezzalar.tezzalars[p].energyField,
                        tezzalar.tezzalars[p].energyField,
                        tezzalar.tezzalars[p].x + levelX,
                        tezzalar.tezzalars[p].y,
                        48, 46, this.x, this.y,
                        function () {
                            frame.PLAYER.playerExploding = true;
                        });
                }
            }
        }

        if (this.takingOff) {
            frame.DISPLAY.offScreenContext.globalAlpha = 0.5;
            frame.DISPLAY.offScreenContext.drawImage(this.playerRollRightImageShadows[0], this.x + this.height, this.y + this.height);
            frame.DISPLAY.offScreenContext.globalAlpha = 1;
            frame.DISPLAY.offScreenContext.drawImage(this.playerRollRightImages[0], this.x, this.y);
        }

        if (this.playerExploding) {

            //frameUtils.animationManager.killAnimation("TURNLEFT");
            //frameUtils.animationManager.killAnimation("TURNRIGHT");                                    
            var player = frame.PLAYER;

            this.explodingCount--;
            var levelX = frame.LEVEL.x;

            this.speed = 0;

            if (this.speed > 0)
                this.speed -= 0.2;
            else
                this.speed += 0.2;

            for (var i = 0; i < 4; i++) {
                particles.push(new Particle({
                    x: frameUtils.random(this.x - 10, this.x + 34),
                    y: frameUtils.random(this.y - 10, this.y + 33),
                    life: Math.random() * 500,
                    xSpeed: this.speed / 4,
                    ySpeed: frameUtils.random(-1, 1, true),
                    size: 2,
                    startColours: [255, Math.floor(Math.random() * 255), 0],
                    endColours: [0, 0, 0],
                    wind: [0, 0]
                }));

            }

            if (this.explodingCount == 0) {
                bigExplosion(24 + this.x, 23 + this.y);
                bigExplosion(24 + this.x, 23 + this.y);
                bigExplosion(24 + this.x, 23 + this.y);
                bigExplosion(24 + this.x, 23 + this.y);
                this.speed = 0;
                this.lives--;
                this.playerExploding = false;
                if (this.lives > 0)
                    frame.gotoMode("PLAYER-DIED");
                else
                    frame.gotoMode("GAME-OVER");
            }

        }

        // Stats
        this.playerStats.accuracy = Math.floor((frame["MAIN-GAME,ALIEN-WAVE"].totalKills / this.playerStats.shots) * 100);

    },
    getCollisionPoints: function (offset) {
        var points = [];
        var y = this.y - 100;
        var levelX = frame.LEVEL.x;
        if (levelX > 0) {
            levelX = Math.floor(levelX);
            levelX = -levelX
        }
        else
            levelX = Math.floor(Math.abs(frame.LEVEL.x));


        points.push(frame.LEVEL.getData(this.x + levelX, y + 5, 1, 1, offset));
        points.push(frame.LEVEL.getData(this.x + levelX + this.collisionWidth, y + 5, 1, 1, offset));
        points.push(frame.LEVEL.getData(this.x + levelX + this.collisionWidth, y - 5 + this.collisionHeight, 1, 1, offset));
        points.push(frame.LEVEL.getData(this.x + levelX, y - 5 + this.collisionHeight, 1, 1, offset));
        return points;
    },
    timings: [{
        delay: 10,
        event: function (artifact) {
            if (artifact.playerFiring) {

                // See what powerups player has 
                switch (artifact.powerUp) {

                    default:
                        if (artifact.playerMode == "LEFT" || artifact.playerMode == "RIGHT") {
                            frame["MAIN-GAME,PLAYER-LASERS"].createProperty(artifact.x, artifact.y + 5);
                            frame["MAIN-GAME,PLAYER-LASERS"].createProperty(artifact.x, artifact.y + 36);
                        }
                }

                artifact.playerStats.shots += 2;

                if (artifact.powerUp != 0) {
                    artifact.powerUpTimer--;
                    if (artifact.powerUpTimer == 0) {
                        artifact.powerUp = 0;
                        artifact.powerUpTimer = 100;
                    }
                }

            }
        }
    }]
};

artifacts["MAIN-GAME"]["PLAYER-VAPOUR TRAIL"] = {
    initialise:function() {

    },
    reset:function() {

    },
    update:function() {
        var player = artifacts["MAIN-GAME"]["PLAYER"];
        if(Math.abs(player.speed) > 5){
            particles.push(new Particle({
                x: frameUtils.random(player.x+10,player.x+23,false),
                y: player.y+40,
                life: 100,
                xSpeed: -player.speed,
                ySpeed: frameUtils.random(-.1,.1,true),
                size: 1,
                startColours: [255, 255, 255],
                endColours: [0, 0, 0],
                wind: [0, 0]
            }));
            particles.push(new Particle({
                x: frameUtils.random(player.x+10,player.x+23,false),
                y: player.y+8,
                life: 100,
                xSpeed: -player.speed,
                ySpeed: frameUtils.random(-.1,.1,true),
                size: 1,
                startColours: [255, 255, 255],
                endColours: [0, 0, 0],
                wind: [0, 0]
            }));
        }
    }
};

artifacts["MAIN-GAME"]["PLAYER-LASERS"] = {

    playerLasers: [],
    speed: 0,
    collisionWidth: 2,
    collisionHeight: 4,
    initialise: function (artifact, fn) {
        this.playerLasers = [];
        this.speed = 0;
        this.collisionWidth = 2;
        this.collisionHeight = 4;
        fn(artifact);
    },
    createProperty: function (x, y, xTrajectory, yTrajectory) {
        //this.xTrajectory = xTrajectory ? xTrajectory : -8;
        //this.yTrajectory = yTrajectory ? yTrajectory : 0;
        var speed = frame.PLAYER.speed > 0 ? 16 : -16;
        x = speed > 0 ? x + 48 : x;
        this.playerLasers.push({
            x: x,
            y: y,
            dead: false,
            speed: speed,
            life: 70,
            width:8,
            height:2
        });
    },
    getCollisions: function () {
        return {
            imageArray: this.playerLasers,
            width: 2,
            height: 4
        }
    },
    reset: function () {
        this.playerLasers = [];
    },
    update: function () {

        for (playerLaser in this.playerLasers) {

            this.playerLasers[playerLaser].x += this.playerLasers[playerLaser].speed;

            var laser = this.playerLasers[playerLaser];
            laser.life--;
            if (laser.life == 0)
                laser.dead = true;

            if (laser.x < 0 || laser.x > width)
                laser.dead = true;

            if (laser.dead) {
                this.playerLasers.splice(playerLaser, 1);
            }
            else {

                var ctx = frame.DISPLAY.offScreenContext;
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.fillRect(laser.x, laser.y, 8, 2);
                ctx.fillStyle = "rgb(0,0,0)";
                //  Shadow
                ctx.globalAlpha = 0.5;
                ctx.fillRect(laser.x + 20, laser.y + 20, 8, 2);
                ctx.globalAlpha = 1;

                var levelX = frame.LEVEL.x;

                // Hit tezzalar
                for (var p in artifacts["MAIN-GAME"]["TEZZALARS"].tezzalars) {
                    var tezzalar = artifacts["MAIN-GAME"]["TEZZALARS"];
                    if (!tezzalar.tezzalars[p].destroyed) {
                        frameUtils.checkForCollision(tezzalar.image.width, tezzalar.image.height, tezzalar.tezzalars[p].x + levelX, tezzalar.tezzalars[p].y,
                            8, 2, laser.x, laser.y,
                            function () {
                                laser.dead = true;
                                tezzalar.tezzalars[p].power--;
                               // tezzalar.imageCtx.fillRect(0, 0, 120, 120);

                                frame.HUD.addScore(100);
                                minorExplosion(laser.x, laser.y);
                                frame["MAIN-GAME,ALIEN-WAVE"].totalKills++;
                            });
                    }
                }

                if (levelX > 0) {
                    levelX = Math.floor(levelX);
                    levelX = -levelX
                }
                else
                    levelX = Math.floor(Math.abs(frame.LEVEL.x));


                var lftRed = frame.LEVEL.getData(laser.x + 9 + levelX, laser.y - 100, 1, 1, 0);
                var lftGreen = frame.LEVEL.getData(laser.x + 9 + levelX, laser.y - 100, 1, 1, 1);
                var lftBlue = frame.LEVEL.getData(laser.x + 9 + levelX, laser.y - 100, 1, 1, 2);
                var rgtRed = frame.LEVEL.getData(laser.x - 1 + levelX, laser.y - 100, 1, 1, 0);
                var rgtGreen = frame.LEVEL.getData(laser.x - 1 + levelX, laser.y - 100, 1, 1, 1);
                var rgtBlue = frame.LEVEL.getData(laser.x - 1 + levelX, laser.y - 100, 1, 1, 2);

                /*
                 // Hit destroyable object
                 if(lftRed == 135 || rgtRed == 135){
                 for(var a = 0; a < 2 ; a++){
                 frame.LEVEL.damageAt(laser.x+levelX,laser.y,0);
                 particles.push(new Particle({
                 x:laser.x,
                 y:laser.y,
                 life:frameUtils.random(0,300),
                 xSpeed:frameUtils.random(-2,2),
                 ySpeed:frameUtils.random(-2,2),
                 size:3,
                 startColours:[255,frameUtils.random(0,255),0],
                 endColours:[1,1,1],wind:[0,0.1]}));
                 particles.push(new Particle({
                 x:laser.x,
                 y:laser.y,
                 life:frameUtils.random(0,500),
                 xSpeed:frameUtils.random(-4,4),
                 ySpeed:frameUtils.random(-4,4),
                 size:2,
                 startColours:[frameUtils.random(0,255),0,0],
                 endColours:[1,1,1]}));
                 }
                 laser.dead = true;
                 frame.HUD.addScore(10);
                 }
                 */
                // Hit hard level object
                if (lftRed == 33 && lftGreen == 39 && lftBlue == 46 || rgtRed == 33 && rgtGreen == 39 && rgtBlue == 46) {
                    laser.dead = true;
                }

                // Hit transmitter
                if (lftRed == 31 && lftGreen == 31 && lftBlue == 31 || rgtRed == 31 && rgtGreen == 31 && rgtBlue == 31) {
                    laser.dead = true;
                }

            }
        }
    }
};
