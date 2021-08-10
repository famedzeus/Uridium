artifacts["BONUS-GAME"] = {

    "USE1":{
        frame:"MAIN-GAME",
        name:"PLAYER"
    },
    "USE2":{
        frame:"MAIN-GAME",
        name:"MESSAGE"
    },
    "USE3":{
        frame:"MAIN-GAME",
        name:"SCOREBOARD"
    },
    "ASTEROIDS":{
        initialise:function() {
            this.asteroids = [];
            this.speed = 0.5;
        },
        createProperty:function() {
            this.asteroids.push({x:Math.floor(Math.frameUtils.random()*width),y:-10});
        },
        reset:function() {
            this.asteroids = [];
            this.speed = 0.5;
            
        },
        update:function() {
            for(asteroid in this.asteroids) {
                offScreenContext.fillStyle = "rgb(255,255,255)";    
                offScreenContext.fillRect(this.asteroids[asteroid].x,this.asteroids[asteroid].y,3,3);
                this.asteroids[asteroid].y+=this.speed;

                this.speed += 0.0001;
                
                if(this.asteroids[asteroid].y > height) {
                    this.asteroids.splice(asteroid,1);
                }
                
                var player = frame.PLAYER;
                frameUtils.checkForCollision(3,3,this.asteroids[asteroid].x,this.asteroids[asteroid].y,
                                  player.playerImage.width,player.playerImage.height,player.x,player.y,function() {
                    for(var i = 0; i < 200; i++) {
                        particles.push(new Particle({
                            x:player.x,
                            y:player.y,
                            life:Math.frameUtils.random()*300,
                            xSpeed:-2+Math.frameUtils.random()*4,
                            ySpeed:-2+Math.frameUtils.random()*4,
                            size:2+Math.floor(Math.frameUtils.random()*4),
                            startColours:[255,Math.floor(Math.frameUtils.random()*255),0],
                            endColours:[0,0,0],wind:[0,0.1]}));
                    }                  

                    frame.gotoMode("MAIN-GAME");
                });
                frame.HUD.score+=0.1;
            }
            
            if(Math.frameUtils.random()*100 < 20)
                this.asteroids.push({x:Math.floor(Math.frameUtils.random()*width),y:-10});
        }
    }
};