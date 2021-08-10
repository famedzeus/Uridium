artifacts["MAIN-GAME"]["TEZZALARS"] = {

    tezzalars:[],
    clearTezzalars:false,
    numberOftezzalars:0,
    image:document.createElement("IMG"),
    imageDestroyed:document.createElement("IMG"),
    imageCanvas:null,
    imageCtx:null,
    shadowCanvas:null,
    shadowCtx:null,
    shadowImage:document.createElement("IMG"),
    initialise:function(artifact,fn) {
        
        this.tezzalars = [];
        this.clearTezzalars = false;
        this.numberOftezzalars = 0;

        frameUtils.createCanvasImage('./images/power-ship.png',100, this, function(obj){
            obj.artifact.image = obj.image;
            obj.artifact.imageCtx = obj.context;
            obj.artifact.imageCanvas = obj.canvas;


        });
        frameUtils.createCanvasImage('./images/power-ship-shadow.png',100, this, function(obj){
            obj.artifact.shadowImage = obj.image;
            obj.artifact.shadowCtx = obj.context;
            obj.artifact.shadowCanvas = obj.canvas;
            fn(artifact);
        });

        var levelData = frame.LEVEL.levelData;

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,230,0,230,function(x,y){
            frame["MAIN-GAME,TEZZALARS"].tezzalars.push({x:x,y:y,power:50,destroyed:false,energyField:50});
            frame["MAIN-GAME,TEZZALARS"].numberOftezzalars++;
        });

    },
    reset:function() {
        if(this.clearTezzalars) {
            this.initialising = false;
            this.initialised = false;
        }
    },
    update:function() {

        if(this.shadowCanvas) {
            var levelX = frame.LEVEL.x;
            var ctx = frame.DISPLAY.offScreenContext;

            for (p in this.tezzalars) {

                var tezzalar = this.tezzalars[p];

                // Energy field
                if (!tezzalar.destroyed) {
                    for (var a = 0; a < 35; a++) {

                        ctx.fillStyle = "rgb(255," + frameUtils.random(0, 255) + ",0)";
                        var rad = frameUtils.random(0, 360);
                        var x = (Math.sin(rad) * tezzalar.energyField) + 50 + tezzalar.x + levelX;
                        var y = (Math.cos(rad) * tezzalar.energyField) + 50 + tezzalar.y

                        ctx.fillRect(x, y, 4,4);
                        if (frameUtils.random(0, 1000) == 1) {
                           frame.LEVEL.damageAt(x - levelX, y, 100);
                        }

                    }
                    tezzalar.energyField += 0.01;
                }

                if (!tezzalar.destroyed && this.imageCanvas) {
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(this.shadowCanvas, tezzalar.x + 50 + levelX, tezzalar.y + 50);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(this.imageCanvas, tezzalar.x + levelX, tezzalar.y);
                }

                //powerUp.x -= 0.1;
                frameUtils.rotate(this.imageCtx, this.image, -0.04);
                frameUtils.rotate(this.shadowCtx, this.shadowImage, -0.04);

                if (tezzalar.destroyed) {
                    ctx.globalAlpha = 0.7;
                    // ctx.drawImage(this.imageDestroyed,powerUp.x+levelX,powerUp.y);
                    ctx.globalAlpha = 1;
                }

                // Random electrical spikes
                //if(frameUtils.random(0,500) < 100) {
                var pointX = tezzalar.x + 50;
                var pointY = tezzalar.y + 50;

                if (frameUtils.random(0, 100) < tezzalar.power) {

                    ctx.strokeStyle = "rgb(255,255,255)";
                    ctx.lineWidth = 2;
                    var dirX = frameUtils.random(-2, 3);
                    var dirY = frameUtils.random(-2, 3);

                    ctx.beginPath();
                    ctx.moveTo(tezzalar.x + levelX + 50, tezzalar.y + 50);

                    for (var a = 0; a < 50; a++) {
                        pointX += frameUtils.random(dirX - 2, dirX + 3);
                        pointY += frameUtils.random(dirY - 2, dirY + 3);
                        ctx.lineTo(pointX + levelX, pointY);
                    }

                    ctx.stroke();

                }

                if (tezzalar.power <= 0 && !tezzalar.destroyed) {
                    // Explode
                    tezzalar.destroyed = true;
                    tezzalar.power = -1;
                    for (var a = 0; a < 100; a++) {
                        particles.push(new Particle({
                            x: frameUtils.random(tezzalar.x + levelX, tezzalar.x + levelX + 100),
                            y: frameUtils.random(tezzalar.y, tezzalar.y + 100),
                            life: frameUtils.random(0, 300),
                            xSpeed: frameUtils.random(-2, 2, true),
                            ySpeed: frameUtils.random(-2, 2, true),
                            size: 3,
                            startColours: [frameUtils.random(0, 255), 0, 0],
                            endColours: [255, 255, 255]
                        }));
                        frame.LEVEL.damageAt(tezzalar.x + 50, tezzalar.y + 50, 0);
                    }
                    frame.HUD.addScore(5000);


                    this.numberOftezzalars--;
                    if (this.numberOftezzalars == 0) {
                        frame.HUD.countdown = 10;
                    }
                }
            }
        }
    },
    timings:[
        {
            delay:2000,
            event:function(artifact) {
            }
        }
    ]
};
