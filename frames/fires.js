/**
 * Created by u777336 on 03/02/2016.
 */

artifacts["MAIN-GAME"]["FIRES"] = {
    alias:"SMOKE",
    delay: 0,
    image:document.createElement("IMG"),
    imageCanvas:null,
    imageCtx:null,
    fires:[],
    initialise: function (artifact,fn) {
        this.fires = [];
        //frameUtils.createCanvasImage("./images/smoke.png",40,this,function(obj){
        //    obj.artifact.image = obj.image;
        //    obj.artifact.imageCtx = obj.context;
        //    obj.artifact.imageCanvas = obj.canvas;
        //    fn(artifact);
        //});
        this.image.src = "./images/smoke.png";
        fn(artifact);
    },
    create:function(p){
        this.fires.push({x: p.x,y: p.y,life: p.life,particles:[]})
    },
    reset: function () {
        this.fires = [];
    },
    update: function (artifact) {
//                this.create({x:this.fireX,y:this.fireY,life:this.fireLife});
        var levelX = frame.LEVEL.x;
        var ctx = frame.DISPLAY.offScreenContext;

        for(var f in this.fires) {
            var fire = this.fires[f];
            fire.life -= .001;
            if(fire.life <= 0) {
                this.fires.splice(f,1);
                console.log("Splice fire");
            } else {
                if(frameUtils.random(0,100) < 10) {
                    fire.particles.push({life:fire.life,x:fire.x,y:fire.y,xSpeed:frameUtils.random(0,2,true),ySpeed:frameUtils.random(0,2,true)});
                }
                for(var p in fire.particles) {
                    var particle = fire.particles[p];
                    ctx.globalAlpha = fire.life;
                    ctx.fillStyle = "rgb(" + frameUtils.random(0,255) + "," + frameUtils.random(0,255) + ",0)";
                    ctx.fillRect(particle.x + levelX, particle.y,5,5);
                    //ctx.drawImage(this.image,particle.x + levelX, particle.y)
                    particle.x += particle.xSpeed;
                    particle.y += particle.ySpeed;
                    particle.life-=.1;
                    if(particle.life <= 0){
                        fire.particles.splice(p,1);
                        console.log("Splice particle");
                    }
                }
            }
        }
    }
};
