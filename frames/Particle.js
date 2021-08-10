
var particles;

document.addEventListener('DOMContentLoaded', function () {

    'use strict';
    particles = [];

});

// Config:
// {x:0,y:0,life:5,velocity:2,startColors:[0,0,0],endColours:[0,0,0],colour:[0,0,0],glowFactor:4}
var Particle = function (config) {

    this.xSpeed = config.xSpeed;
    this.ySpeed = config.ySpeed;
    this.life = config.life;
    this.x = config.x;
    this.y = config.y;
    this.wind = config.wind;

    this.context = config.ctx || artifacts.CANVAS.SCREEN.offScreenContext;

    this.colour = [0, 0, 0];
    this.size = config.size;

    this.dropRate = -3;
    this.glowFactor = config.glowFactor;
    this.endColours = config.endColours;
    this.startColours = config.startColours;
    this.colour = config.colour;
    this.glareFactor = config.glareFactor;

    if (this.startColours && this.endColours) {
        this.red = this.startColours[0];
        this.green = this.startColours[1];
        this.blue = this.startColours[2];
    } else if (this.colour) {
        this.red = this.colour[0];
        this.green = this.colour[1];
        this.blue = this.colour[2];
    }

    this.update = function (index) {

        var levelX = frame.LEVEL.x;

        this.lastX = this.x;
        this.lastY = this.y;

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.wind) {
            this.x += this.wind[0];
            this.y += this.wind[1];
        }

        if (this.x > 0 && this.x < width && this.y > 0 && this.y < height) {

            //this.y += this.dropRate;
            this.dropRate += 0.05;

            r = Math.floor(frameUtils.random(0, 255));

            //this.xSpeed -= 0.01;
            //this.ySpeed -= 0.01;

            if (this.startColours && this.endColours) {
                if (this.endColours[0] > this.red)
                    this.red++;
                else
                    this.red--;
                if (this.endColours[1] > this.green)
                    this.green++;
                else
                    this.green--;
                if (this.endColours[2] > this.blue)
                    this.blue++;
                else
                    this.blue--;
            }

            var fillStyle;
            if (this.glowFactor > 0) {
                i = frameUtils.random() * Math.floor(this.glowFactor);
                fillStyle = "rgba(" + (this.red + i) + "," + (this.green + i) + "," + (this.blue + i) + "," + this.life / 10 + ")";
            } else {
                fillStyle = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.life / 10 + ")";
            }
            this.context.fillStyle = fillStyle;
            this.context.fillRect(Math.floor(this.x), Math.floor(this.y), (this.size*2), (this.size*2));
            this.size -= 0.01;
        }
        //this.size -= 0.01;

        this.life -= 1;
        if (this.life <= 0)
            particles.splice(index, 1);

    };

};