artifacts["MAIN-GAME"]["LEVEL-FURNITURE"] = {

    items: [],
    itemImages: [],
    initialise: function (artifact,fn) {

        this.items = [];
        this.itemImages = [];

        var levelData = frame.LEVEL.levelData;

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,255,0,255,function(x,y) {
            var smallFanImage = frame["MAIN-GAME,LEVEL-FURNITURE"].createItemImage("./images/small-fan.png", 24);
            frame["MAIN-GAME,LEVEL-FURNITURE"].items.push({
                type: "FAN",
                image: smallFanImage.image,
                x: x,
                y: y,
                rad: 0,
                offset: 12,
                context: smallFanImage.context,
                canvas: smallFanImage.canvas
            });
        });

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,250,0,250,function(x,y) {
            var largeFanImage = frame["MAIN-GAME,LEVEL-FURNITURE"].createItemImage("./images/large-fan.png", 70);
            frame["MAIN-GAME,LEVEL-FURNITURE"].items.push({
                type: "FAN",
                image: largeFanImage.image,
                x: x,
                y: y,
                rad: 0,
                offset: 35,
                context: largeFanImage.context,
                canvas: largeFanImage.canvas
            });
        });

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,240,0,240,function(x,y) {
            var starImage = frame["MAIN-GAME,LEVEL-FURNITURE"].createItemImage("./images/star.png", 50);
            frame["MAIN-GAME,LEVEL-FURNITURE"].items.push({
                type: "LIGHT",
                image: starImage.image,
                x: x,
                y: y,
                rad: 0,
                offset: 20,
                context: starImage.context,
                canvas: starImage.canvas
            });
        });

        frameUtils.findDataRGBMarker(frame.LEVEL.levelData,4000,400,222,0,222,function(x,y) {
            frame["MAIN-GAME,SMOKE"].smoke.push({x:x,y:y+100,delay:0});
        });

        fn(artifact);
    },
    createItemImage: function (im, size) {
        var image = new Image();
        image.src = im;
        image.onload = function () {
            console.log("Loaded " + im);
            context.drawImage(image, 0, 0);
        };
        var canvas = document.createElement('canvas');
        var context = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        context.drawImage(image, 0, 0);
        return {image: image, canvas: canvas, context: context}
    },
    reset: function () {
        this.initialised = false;
        this.initialising = false;
    },
    update: function () {

        var levelX = frame.LEVEL.x;
        for (var fan in this.items) {

            // Fan rotation
            if (this.items[fan].type == "FAN") {
                frameUtils.rotate(this.items[fan].context,this.items[fan].image,0.15);
                frame.DISPLAY.offScreenContext.drawImage(this.items[fan].canvas,
                    this.items[fan].x - this.items[fan].offset + levelX,
                    this.items[fan].y + 100 - this.items[fan].offset);
            }

            // Light glare
            // Lights will get brighter the closer they are to center
            if (this.items[fan].type == "LIGHT") {

                //frame.DISPLAY.offScreenContext.globalAlpha = 0.3;
                //frame.DISPLAY.offScreenContext.drawImage(this.items[fan].canvas,
                //    this.items[fan].x - this.items[fan].offset + levelX,
                //    this.items[fan].y + 100 - this.items[fan].offset);

                var diff = Math.round(Math.abs((width / 2) - (this.items[fan].x + levelX)));
                frame.DISPLAY.offScreenContext.globalAlpha = frameUtils.random(0.7,1,true);
                frame.DISPLAY.offScreenContext.drawImage(this.items[fan].canvas,
                    this.items[fan].x - this.items[fan].offset + levelX,
                    this.items[fan].y + 100 - this.items[fan].offset);
                frame.DISPLAY.offScreenContext.globalAlpha = 1;
            }
        }
    }
};
