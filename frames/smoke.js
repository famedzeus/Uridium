artifacts["MAIN-GAME"]["SMOKE"] = {

    smoke:[],
    clouds:[],
    smokeImage:null,
    initialise:function(artifact,fn) {
        this.smokeImage = document.createElement("IMG");
        this.smokeImage.src = "./images/smoke.png";
        this.redSmokeImage = null;
        this.greenSmokeImage = null;
        this.smokeImage.onload = function(){
            frame["MAIN-GAME,SMOKE"].redSmokeImage = frameUtils.colorizeImage(frame["MAIN-GAME,SMOKE"].smokeImage,255,0,0);
            frame["MAIN-GAME,SMOKE"].greenSmokeImage = frameUtils.colorizeImage(frame["MAIN-GAME,SMOKE"].smokeImage,0,255,0);
            fn(artifact);
        };
    },
    update: function() {
        var levelX = frame.LEVEL.x;
        for(var sm in this.smoke){
            this.smoke[sm].delay++;
            if(this.smoke[sm].delay >= frameUtils.random(10,25)){
                this.smoke[sm].delay = 0;
                //frameUtils.rotate(this.smokeContext,this.smokeImage,frameUtils.random(0,360));
                this.createCloud(sm,this.smoke[sm].colour);
            }
        }
        for(var cl in this.clouds) {
            frame.DISPLAY.offScreenContext.globalAlpha = this.clouds[cl].life;
            frame.DISPLAY.offScreenContext.drawImage(this.clouds[cl].canvas, 0,0, this.smokeImage.width, this.smokeImage.width, this.clouds[cl].x + levelX, this.clouds[cl].y, this.clouds[cl].size, this.clouds[cl].size);
            this.clouds[cl].x += this.clouds[cl].windX;
            this.clouds[cl].y += this.clouds[cl].windY;
            this.clouds[cl].size += frameUtils.random(0.01,1,true);
            this.clouds[cl].life -= 0.003;
            if(this.clouds[cl].life <= 0) {
                this.clouds.splice(cl, 1);
            }
            frame.DISPLAY.offScreenContext.globalAlpha = 1;
        }
    },
    reset:function() {
        this.smoke = [];
        this.clouds = [];
    },
    createCloud:function(sm,red,green,blue){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.width = this.smokeImage.width;
        canvas.height = this.smokeImage.height;
        ctx.drawImage(this.smokeImage,0,0);
        //frameUtils.rotate(ctx,this.smokeImage,frameUtils.random(0,1,true));
        var params = {x:this.smoke[sm].x,y:this.smoke[sm].y,size:0,
                      life:frameUtils.random(0.1,1,true),
                      windX:frameUtils.random(-0.1,0.1,true),windY:frameUtils.random(-0.1,0.1,true),
                      canvas:canvas,ctx:ctx};
        this.clouds.push(params);

    }

};