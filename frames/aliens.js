artifacts["MAIN-GAME"]["ALIEN-WAVE"] = {
    waveStats: {},
    lastSeed: 0,
    killAverage: 0,
    accuracy: 0,
    numberOfWaves: 0,
    level: 0,
    alienType: 0,
    alienWaveId: 0,
    alienWave: {},
    totalWaveKills: 0,
    totalKills: 0,
    alienImages: [],
    addImage:function (images, file) {
        var img = document.createElement("IMG");
        img.src = file;
        img.onload = function(im){
            img.collisionWidth = img.width;
            img.collisionHeight = img.height;
            images.push(img);
        };
    },
    initialise: function (artifact,fn) {
        this.tankAlienRight = document.createElement("IMG");
        this.tankAlienRight.src="./images/ship1.png";
        this.waveStats = {};
        this.lastSeed = 0;
        this.killAverage = 0;
        this.accuracy = 0;
        this.numberOfWaves = 0;
        this.level = level;
        this.alienType = 0;

        this.alienWaveId = 0;
        this.alienWave = {};
        this.totalWaveKills = 0;
        this.totalKills = 0;

        this.tankAliensRight = [];

        fn(artifact);
    },
    update: function () {

    },
    reset: function () {
        //        for(waveStat in this.waveStats) {
        //           delete this.waveStats[waveStat];
        //      }
        //this.numberOfWaves = 0;
        frame["MAIN-GAME,MESSAGE"].message = "LEVEL " + this.level;
        frame["MAIN-GAME,ALIEN-WAVE"].totalKills = 0;
    },
    timings: [
        {
        delay: 2000,
        start: 1900,
        event: function (artifact) {

            // LEVEL 1 -------------------------------------------------------------------------------------------------------
            // Straight right
            /*
            frameUtils.createImagesArray("./images/ship1.png",10,function(images){
                frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight = images;
                var a = 0;
                do {
                    var alien = frame["MAIN-GAME,ALIENS"].createAlien(frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight[a], 'alien-right');
                    frameUtils.spriteMovementManager.createSpriteMoves('alien-right', alien, frameUtils.random(-900,-1000), 100 + (a*40), 5, 60, [3], 18);
                    a++;
                } while(a<10)
            });
            // Straight left
            frameUtils.createImagesArray("./images/ship1-lft.png",10,function(images){
                frame["MAIN-GAME,ALIEN-WAVE"].tankAliensLeft = images;
                var a = 0;
                do {
                    var alien = frame["MAIN-GAME,ALIENS"].createAlien(frame["MAIN-GAME,ALIEN-WAVE"].tankAliensLeft[a], 'alien-left');
                    frameUtils.spriteMovementManager.createSpriteMoves('alien-left', alien,  frameUtils.random(4800,5000), 100 + (a * 40), 5, 60, [7], 18);
                    a++;
                } while(a<10)
            });
            */
            // LEVEL 2 -------------------------------------------------------------------------------------------------------
            // In-turn down then up
            frameUtils.createImagesArray("./images/ship1.png",10,function(images){
                frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight = images;
                var a = 0;
                var pattern = [3,4,2,3,2,4];
                do {
                    var alien = frame["MAIN-GAME,ALIENS"].createAlien(frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight[a], 'alien-right');
                    frameUtils.spriteMovementManager.createSpriteMoves('alien-right', alien, -500 - (a*50), 130, 5, 60, pattern, 9);
                    pattern = [3].concat(pattern);
                    a++;
                } while(a<10)
            });
		
            frameUtils.createImagesArray("./images/ship1-lft.png",10,function(images){
                frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight = images;
                var a = 0;
                var pattern = [3,2,4,3,4,2];
                do {
                    var alien = frame["MAIN-GAME,ALIENS"].createAlien(frame["MAIN-GAME,ALIEN-WAVE"].tankAliensRight[a], 'alien-right');
                    frameUtils.spriteMovementManager.createSpriteMoves('alien-right', alien, -500 - (a*50), 330, 5, 60, pattern, 9);
                    pattern = [3].concat(pattern);
                    a++;
                } while(a<10)
            });

        }
    }, {
        delay: 2000,
        event: function (artifact) {
            // Specialist aliens
            //var attack = function() { return [{x:-1,y:2,times:10},{x:1,y:2,times:10},{x:-1,y:1,times:40},{x:1,y:1,times:40}]; };
            //frame["MAIN-GAME,ALIENS"].createProperty(frame.PLAYER.x,-Math.floor(Math.frameUtils.random()*100),attack(),0);
        }
    }
    ]
};

artifacts["MAIN-GAME"]["ALIENS"] = {

    aliens: [],
    alien1:null,
    alien2:null,
    animationCount: 1,
    initialise: function (artifact,fn) {
        fn(artifact);
    },
    createAlien: function (img, id) {
        var alien = {
            img: img,
            fireRate: frameUtils.random(800, 1600),
            fireCount: 0,
            exploding: false,
            remove: false,
            removeStage: 20,
            id: id
        };
        this.aliens.push(alien);
        return alien;
    },
    reset: function () {
        //this.aliens = [];
    },
    isEndOfLife: function () {
        return false;
    },
    destroy: function (alien, index, speed) {

        var levelX = frame.LEVEL.x;

        frame["MAIN-GAME,ALIEN-WAVE"].alienWave[alien.id]++;
        if (frame["MAIN-GAME,ALIEN-WAVE"].alienWave[alien.id] == 6) {
            frame["MAIN-GAME,ALIEN-WAVE"].totalWaveKills++;
            delete frame["MAIN-GAME,ALIEN-WAVE"].alienWave[alien.id];
        }

        frame["MAIN-GAME,ALIEN-WAVE"].totalKills++;

        for (var i = 0; i < 10; i++) {
            particles.push(new Particle({
                x: levelX + alien.x + (alien.img.width / 2) + alien.xSpeed,
                y: alien.y + (alien.img.height / 2),
                life: frameUtils.random(0, 300),
                xSpeed: frameUtils.random(-2, 2, true),
                ySpeed: frameUtils.random(-2, 2, true),
                size: 4,
                startColours: [255, 255, 0],
                endColours: [1, 1, 1],
                wind: [0, 0.1]
            }));
            particles.push(new Particle({
                x: levelX + alien.x + (alien.img.width / 2) + alien.xSpeed,
                y: alien.y + (alien.img.height / 2),
                life: frameUtils.random(0, 500),
                xSpeed: frameUtils.random(-4, 4, true),
                ySpeed: frameUtils.random(-4, 4, true),
                size: 2,
                startColours: [255, 0, 0],
                endColours: [1, 1, 1]
            }));

            //artifacts["MAIN-GAME"]["FIRES"].create(levelX + alien.x,alien.y,1000);

            if (alien.xSpeed > 0)
                alien.xSpeed -= 0.05;
            else
                alien.xSpeed += 0.05;
        }
        frame.LEVEL.damageAt(alien.x + (alien.img.width / 2), alien.y + (alien.img.height / 2), alien.xSpeed);
        //frame.SMOKE.create({x:alien.x, y:alien.y, xSpeed:frameUtils.random(0,2,true), ySpeed:frameUtils.random(0,2,true), life:1});
        //this.aliens.splice(index, 1);
    },
    update: function () {

        var levelX = frame.LEVEL.x;

        for(var alien in this.aliens){
            // Alien firing
            var d = this.aliens[alien].id == "alien-right" ? 8 : -8;
            if (frameUtils.random(0, 4000) < 2) {
                frame["MAIN-GAME,ENEMY-BULLETS"].createProperty(this.aliens[alien].x, this.aliens[alien].y + 20, d, 0, 300, 8, 2);
            }
            // Check for collisions with player bullets
            for(var obj in frame["MAIN-GAME,PLAYER-LASERS"].playerLasers){
                var laser = frame["MAIN-GAME,PLAYER-LASERS"].playerLasers[obj];
                frameUtils.checkForCollision(laser.width,laser.height,laser.x,laser.y,
                    this.aliens[alien].img.width,this.aliens[alien].img.height,this.aliens[alien].x + levelX,this.aliens[alien].y,function(){
                        frame["MAIN-GAME,ALIENS"].destroy(frame["MAIN-GAME,ALIENS"].aliens[alien], 0, frame["MAIN-GAME,ALIENS"].aliens[alien].xSpeed);
                        frame["MAIN-GAME,ALIENS"].aliens[alien].patternEnded = true;
                        frame.HUD.addScore(100);
                        frame["MAIN-GAME,PLAYER-LASERS"].playerLasers.splice(laser,1);
                    });
            }
            // Move alien
            frameUtils.spriteMovementManager.move(this.aliens[alien]);
            // Draw alien
            frame.DISPLAY.offScreenContext.drawImage(this.aliens[alien].img, this.aliens[alien].x + levelX, this.aliens[alien].y);
            // Alien at end of route?
            if(this.aliens[alien].patternEnded){
                this.aliens.splice(alien,1);
            }
        }
    },
    timings: [{
        delay: 20,
        event: function (artifact) {
        }
    }

    ]

}; // END "ALIENS"

// Generic bullets artifact
artifacts["MAIN-GAME"]["ENEMY-BULLETS"] = {

    bullets: [],
    initialise: function (artifact,fn) {
        this.bullets = [];
        fn(artifact);
    },
    createProperty: function (x, y, xDirection, yDirection, life, w, h) {
        this.bullets.push({
            x: x,
            y: y,
            xDirection: xDirection,
            yDirection: yDirection,
            life: life
        });
        this.collisionWidth = w;
        this.collisionHeight = h;
    },
    update: function () {

        var levelX = frame.LEVEL.x;

        for (var b in this.bullets) {

            var bullet = this.bullets[b];

            // Movement
            bullet.x += bullet.xDirection;
            bullet.y += bullet.yDirection;

            bullet.life--;
            if (bullet.life == 0)
                bullet.dead = true;

            if (bullet.dead) {
                this.bullets.splice(b, 1);
            }
            else {

                frame.DISPLAY.offScreenContext.fillStyle = "rgb(255,255,255)";
                frame.DISPLAY.offScreenContext.fillRect(bullet.x + levelX, bullet.y, this.collisionWidth, this.collisionHeight);
                frame.DISPLAY.offScreenContext.fillStyle = "rgb(0,0,0)";
                frame.DISPLAY.offScreenContext.fillRect(bullet.x + levelX, bullet.y + 5, this.collisionWidth, this.collisionHeight);

                // Player collision
                var player = frame.PLAYER;
                //var alienLasers = artifacts["MAIN-GAME"]["ALIEN-LASERS"].alienLasers;

                for (bullet in this.bullets) {

                    frameUtils.checkForCollision(48, 46, player.x, player.y,
                        this.collisionWidth, this.collisionHeight, this.bullets[bullet].x + levelX, this.bullets[bullet].y,
                        function () {
                            player.playerExploding = true;
                            bullet.dead = true;
                        });
                }
            }
        }
    },
    reset: function () {
        this.bullets = [];
    },
    setCollisionBounds: function (w, h) {
        this.collisionWidth = w;
        this.collisionHeight = h;
    },
    timings: [{
        delay: 1000,
        event: function (artifact) {

        }
    }]
};