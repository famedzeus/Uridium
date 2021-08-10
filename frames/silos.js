/* global random,artifacts */
artifacts["MAIN-GAME"]["SILOS"] = {
    
    silos:[],
    animationFrame:0,
    animationDelay:0,
    siloImages:[],
    initialise:function(artifact,fn) {
        frameUtils.createAnimationImagesArray("./images/silo.png",40,40,function(a) {
            artifacts["MAIN-GAME"]["SILOS"].siloImages = a;
        });
        this.silos = [];
        var silos = this.silos;

        var levelData = frame.LEVEL.levelData;

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,220,0,220,function(x,y){
            silos.push({x:x,y:y,mode:"INACTIVE"});
        });
        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,217,0,217,function(x,y){
            silos.push({x:x,y:y,mode:"INACTIVE"});
        });

        fn(artifact);
    },
    createProperty:function() {
        
    },
    update:function() {

        var levelX = frame.LEVEL.x;
        var ctx = frame.DISPLAY.offScreenContext;
        var siloImages = this.siloImages;

        for(var s in this.silos) {
        
            var silo = this.silos[s];
            
            // Open door, release mine, close door
            if(frameUtils.random(0,1000) < 2 && silo.x+levelX > 0 && silo.x+levelX < width && silo.mode == "INACTIVE") {
                silo.mode = "OPENING";
                frameUtils.animationManager.addAnimation("SILO-DOOR"+s, {
                    mode: 'OPENING', delay: 40, startFrame: 4, endFrame: 0, silo:silo
                }, function (anim) {
                    ctx.drawImage(siloImages[anim.frameCount],anim.silo.x-20+frame.LEVEL.x,anim.silo.y+100-20);
                }, function (anim) {
                });
                artifacts["MAIN-GAME"]["SILO-MINES"].createProperty(silo.x-20,silo.y-20);
                frameUtils.animationManager.addAnimation("SILO-DOOR"+s, {
                    mode: 'CLOSING', delay: 40, startFrame: 0, endFrame: 4, silo:silo
                }, function (anim) {
                    ctx.drawImage(siloImages[anim.frameCount],anim.silo.x-20+frame.LEVEL.x,anim.silo.y+100-20);
                }, function (anim) {
                    anim.silo.mode = "INACTIVE";
                });
            }
            if(silo.mode == "INACTIVE") {
                if(this.siloImages.length > 0) {
                    ctx.drawImage(this.siloImages[4], silo.x - 20 + levelX, silo.y + 100 - 20);
                }
            }
        }
    },
    reset:function() {
        this.initialised = false;
        this.initialising = false;
    },
    timings:[
        {
            delay: 1000,
            event: function(artifact) {
                
            }
         }
    ]
};

artifacts["MAIN-GAME"]["SILO-MINES"] = {
    
    initialise:function(artifact, fn) {
        this.mines = [];
		this.image = document.createElement("IMG");
		this.image.src="./images/mine.png";
        fn(artifact);
    },
    createProperty:function(x, y) {
        this.mines.push({x:x,y:y+100,xSpeed:0,ySpeed:0,life:500});
    },
    reset:function() {
        this.mines = [];
    },
    update:function() {
        var levelX = frame.LEVEL.x;
        var ctx = frame.DISPLAY.offScreenContext;

        for(var m in this.mines) {
        
            var mine = this.mines[m];
            
            // Move toward player ship
            var player = frame.PLAYER;
            
            if(player.x < mine.x+levelX)
                mine.xSpeed -= 0.06;
            else
                mine.xSpeed += 0.06;
                
            if(player.y < mine.y)
                mine.ySpeed -= 0.06;
            else
                mine.ySpeed += 0.06;

            mine.x += mine.xSpeed;
            mine.y += mine.ySpeed;
            
            mine.life--;
            
            // Draw
            ctx.drawImage(this.image,mine.x+levelX,mine.y);
            
            // hit player?
            frameUtils.checkForCollision(48,46,player.x,player.y,
              4,4,mine.x+levelX,mine.y,function() {
                player.playerExploding = true;
                mine.life = 0;
            });
            
            if(mine.life == 0) {
                bigExplosion(mine.x+levelX,mine.y);
                this.mines.splice(m,1);
            }
        }
    },
    timings:[
        {
            delay: 1000,
            event: function(artifact) {
                    
            }
         }
    ]
};