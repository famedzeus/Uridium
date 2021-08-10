artifacts["MAIN-GAME"]["LEVEL"] = {
    alias: "LEVEL",
    levelCanvas: document.createElement('canvas'),
    levelContext: null,
    x: -100,
    y: 100,
    levelData: {},
    opacity: 0,
    level: 0,
    newLevel: false,
    initialise: function (artifact,fn) {
        "use strict";

        this.levelCanvas = document.createElement('canvas');
        this.levelContext = this.levelCanvas.getContext("2d");
        this.levelCanvas.width = 4000;
        this.levelCanvas.height = 400;
        this.x = -100;
        this.y = 100;
        this.levelContext.drawImage(levelImages[level], 0, 0);
        this.levelData = this.levelContext.getImageData(0, 0, 4000, 400).data;
        this.opacity = 0;
        this.level = level;
        fn(artifact);
    },
    damageAt: function (x, y, speed, noParticles) {
        "use strict";

        this.levelContext.fillStyle = "rgb(" + frameUtils.random(0, 70) + "," + frameUtils.random(0, 70) + "," + frameUtils.random(0, 70) + ")";
        var r = frameUtils.random(0, 14);
        var x1 = x;
        for (var a = 0; a < 50; a++) {
            var cx = (Math.sin(a) * r) + x;
            var cy = (Math.cos(a) * r) + y - 100;
            var vx = -4 + frameUtils.random(0, 8);
            var vy = -4 + frameUtils.random(0, 8);

            var g = this.getData(Math.floor(cx + vx), Math.floor(cy + vy));
            if (g == 140)
                this.levelContext.fillRect(cx + vx, cy + vy, 2, 2);
            x1 += speed;
        }

        r = frameUtils.random(0, 22);
        x1 = x;
        for (var a = 0; a < 35; a++) {
            cx = (Math.sin(a) * r) + x1;
            cy = (Math.cos(a) * r) + y - 100;
            vx = frameUtils.random(-2, 2, true);
            vy = frameUtils.random(-2, 2, true);

            var g = this.getData(Math.floor(cx + vx), Math.floor(cy + vy), 1, 1, 0);
            if (g > 0)
                this.levelContext.fillRect(cx + vx, cy + vy, 1, 1);
            x1 += speed;
        }
        r = frameUtils.random(0, 30);
        x1 = x;
        for (var a = 0; a < 35; a++) {
            cx = (Math.sin(a) * r) + x1;
            cy = (Math.cos(a) * r) + y - 100;
            vx = frameUtils.random(-10, 10, true);
            vy = frameUtils.random(-4, 16, true);
            var g = this.getData(Math.floor(cx + vx), Math.floor(cy + vy), 1, 1, 0);
            if (g > 0)
                this.levelContext.fillRect(cx + vx, cy + vy, 1, 1);
            x1 += speed;
        }
        // Streaks outwards
        for (var a = 0; a < 15; a++) {
            var xd = frameUtils.random(-1, 2, true);
            var yd = frameUtils.random(-1, 2, true);
            x1 = x;
            var y1 = y - 100;
            var w = frameUtils.random(0, 50);
            for (var b = 0; b < w; b++) {
                if (frameUtils.random(0, 50) < 20) {
                    var g = this.getData(Math.floor(x1), Math.floor(y1), 1, 1, 0);
                    if (g > 0) {
                        this.levelContext.fillRect(x1, y1, 1, 1);
                    }
                }
                x1 += xd;
                y1 += yd;
            }
        }
        // Structure breaches
        for (var a = 0; a < 4; a++) {
            xd = frameUtils.random(-5, 5);
            yd = frameUtils.random(-10, 10);
            this.levelContext.clearRect(x + xd, y + yd - 100, frameUtils.random(0, 15), frameUtils.random(0, 5));
        }

        var levelX = frame.LEVEL.x;

        if (!noParticles) {
            for (var i = 0; i < 1; i++) {
                particles.push(new Particle({
                    x: levelX + x,
                    y: y,
                    life: frameUtils.random(0, 300),
                    xSpeed: frameUtils.random(-2, 2, true),
                    ySpeed: frameUtils.random(-2, 2, true),
                    size: 4,
                    startColours: [255, 255, 0],
                    endColours: [1, 1, 1],
                    wind: [0, 0.1]
                }));

                particles.push(new Particle({
                    x: levelX + x,
                    y: y,
                    life: frameUtils.random(0, 500),
                    xSpeed: frameUtils.random(-4, 4, true),
                    ySpeed: frameUtils.random(-4, 4, true),
                    size: 2,
                    startColours: [255, 0, 0],
                    endColours: [1, 1, 1]
                }));

                if (speed > 0)
                    speed -= 0.05;
                else
                    speed += 0.05;
            }
        }
    },
    spotAt: function (x, y) {
        "use strict";
        this.levelContext.clearRect(x, y - 100, 1, 1);
    },
    getData: function (x, y, w, h, offset) {
        "use strict";
        return this.levelData[(x * 4) + (y * 4000 * 4) + offset];
    },
    reset: function () {
        //this.initialise();
        "use strict";

        this.x = -200;
        this.y = 100;
        this.opacity = 1;
        if(this.newLevel) {
            this.levelContext.clearRect(0, 0, 4000, 400);
            this.levelContext.drawImage(levelImages[this.level], 0, 0);
            this.levelData = this.levelContext.getImageData(0, 0, 4000, 400).data;
            this.newLevel = false;
        }
        //this.levelContext.drawImage(this.image,0,0);

    },
    update: function () {
        "use strict";

        this.x -= frame.PLAYER.speed;
        frame["MAIN-GAME,STARS"].x -= frame.PLAYER.speed / 10;

        //this.x-= 1;
        //this.levelContext.drawImage(this.image,this.x,this.y);
        if (this.opacity < 1)
            this.opacity += 0.01;

        frame.DISPLAY.offScreenContext.globalAlpha = 1;
        //frame.DISPLAY.offScreenContext.globalAlpha = this.opacity;

        //frame.DISPLAY.offScreenContext.drawImage(this.levelCanvas,this.x,0,800,600,this.x,this.y,800,600);
        frame.DISPLAY.offScreenContext.drawImage(this.levelCanvas, this.x, this.y);
        frame.DISPLAY.offScreenContext.globalAlpha = 1;

        // Glint?
        // frame.DISPLAY.offScreenContext.globalAlpha = 0.07;
        //frame.DISPLAY.offScreenContext.fillStyle="rgb(255,255,255)";
        //frame.DISPLAY.offScreenContext.fillRect(width/2-100,100,frameUtils.random(95,105),400);
    }
};