/* frameJS utils */

/**
 *
 * @type {{animationManager: {animationQueue: Array, animationInterval: null, animationCount: number, currentAnimation: number, ctx: null, start: frameUtils.animationManager.start, stop: frameUtils.animationManager.stop, killAnimation: frameUtils.animationManager.killAnimation, addAnimation: frameUtils.animationManager.addAnimation, animate: frameUtils.animationManager.animate}, createAnimationImagesArray: frameUtils.createAnimationImagesArray, strobeColour: {getStrobe}, centreText: frameUtils.centreText, getFormattedScore: frameUtils.getFormattedScore, checkForCollision: frameUtils.checkForCollision, random: frameUtils.random, rotate: frameUtils.rotate, createCanvasImage: frameUtils.createCanvasImage, findDataRGBMarker: frameUtils.findDataRGBMarker}}
 */
var frameUtils = {
    // Handles multiple animation tracking
    // Animations can be grouped by 'groupKey' and will run in order they are added.
    // Animations can be set to run indefinitely or a set number of times
    animationManager: {

        animationQueue: [],
        animationInterval: null,
        animationCount: 0,
        currentAnimation: 0,
        ctx: null,
        start: function (ctx) {
            frameUtils.animationManager.ctx = ctx;
            frameUtils.animationManager.animationInterval = setInterval(frameUtils.animationManager.animate, 1);
        },
        stop: function () {
            clearInterval(frameUtils.animationManager.animationInterval);
        },
        killAnimation: function (groupKey) {
            if (frameUtils.animationManager.animationQueue[groupKey]) {
                delete frameUtils.animationManager.animationQueue[groupKey]; //.splice(0,animQueue.length);    	    
            }
        },
        addAnimation: function (groupKey, anim, drawCallback, finishCallback) {
            anim.drawCallback = drawCallback;
            anim.finishCallback = finishCallback;
            anim.frameCount = anim.startFrame;
            anim.frameDelay = 0;
            anim.ctx = this.ctx;
            if (!frameUtils.animationManager.animationQueue[groupKey])
                frameUtils.animationManager.animationQueue[groupKey] = [];
            frameUtils.animationManager.animationQueue[groupKey].push(anim);
        },
        animate: function () {
            for (var a in frameUtils.animationManager.animationQueue) {
                if (frameUtils.animationManager.animationQueue[a].length > 0) {
                    var anim = frameUtils.animationManager.animationQueue[a][0];

                    anim.drawCallback(anim);
                    anim.frameDelay++;
                    if (anim.frameDelay == anim.delay) {
                        anim.frameDelay = 0;

                        if (anim.endFrame > anim.startFrame)
                            anim.frameCount++;
                        if (anim.endFrame < anim.startFrame)
                            anim.frameCount--;

                        if (anim.frameCount == anim.endFrame) {
                            if (anim.finishCallback)
                                anim.finishCallback(anim);
                            frameUtils.animationManager.animationQueue[a].splice(0, 1);
                        }
                    }
                    if (anim.killAnimation) {
                        delete frameUtils.animationManager.animationQueue[a];
                    }
                }
            }
        }
    },

    /**
     * Compass move shortcuts
     *      1
     *   8  |  2
     * 7 ---+--- 3
     *   6  |  4
     *      5
     */
    compass:{
        N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315
    },
    /**
     * Sprite movement Manager - controls movement of a sprite  e.g. alien
     *
     */
    spriteMovementManager:{
        sprites:[],
        collisions:{},
        movementShapes:{
            square:[3,7,5,1,7,3,1,5],
            left:[7],
            right:[3]
        },
        createSpriteMoves:function(name, sprite, startX, startY, maxSpeed, quantization, pattern, repeatPattern){
            sprite.name = name;
            sprite.repeatPattern = !repeatPattern ? 1 : repeatPattern;
            sprite.patternCount = 0;
            sprite.x = startX;
            sprite.y = startY;
            sprite.xSpeed = 0;
            sprite.ySpeed = 0;
            sprite.acceleration = 0.1;
            sprite.maxSpeed = maxSpeed;
            sprite.quantization = quantization;
            sprite.spaceCount = 0;
            sprite.pattern = pattern;
        },
        move:function(sprite) {

            this.moveBackToZero = function(val) {
                if(Math.abs(val) <= sprite.acceleration)
                    val = 0;
                if(val > 0)
                    val-=sprite.acceleration;
                if(val < 0)
                    val+=sprite.acceleration;
                return val;
            };

            var move = sprite.pattern[sprite.patternCount];

            switch(move){

                case 1:
                    sprite.xSpeed = this.moveBackToZero(sprite.xSpeed);
                    sprite.ySpeed-=sprite.acceleration;
                    break;
                case 2:
                    sprite.xSpeed+=sprite.acceleration;
                    sprite.ySpeed-=sprite.acceleration;
                    break;
                case 3:
                    sprite.xSpeed+=sprite.acceleration;
                    sprite.ySpeed = this.moveBackToZero(sprite.ySpeed);
                    break;
                case 4:
                    sprite.xSpeed+=sprite.acceleration;
                    sprite.ySpeed+=sprite.acceleration;
                    break;
                case 5:
                    sprite.xSpeed = this.moveBackToZero(sprite.xSpeed);
                    sprite.ySpeed+=sprite.acceleration;
                    break;
                case 6:
                    sprite.xSpeed-=sprite.acceleration;
                    sprite.ySpeed+=sprite.acceleration;
                    break;
                case 7:
                    sprite.xSpeed-=sprite.acceleration;
                    sprite.ySpeed = this.moveBackToZero(sprite.ySpeed);
                    break;
                case 8:
                    sprite.xSpeed-=sprite.acceleration;
                    sprite.ySpeed-=sprite.acceleration;
                    break;
            };

            if(sprite.xSpeed > sprite.maxSpeed)
                sprite.xSpeed = sprite.maxSpeed;
            if(sprite.ySpeed > sprite.maxSpeed)
                sprite.ySpeed = sprite.maxSpeed;
            if(sprite.xSpeed < -sprite.maxSpeed)
                sprite.xSpeed = -sprite.maxSpeed;
            if(sprite.ySpeed < -sprite.maxSpeed)
                sprite.ySpeed = -sprite.maxSpeed;

            sprite.x += sprite.xSpeed;
            sprite.y += sprite.ySpeed;

            //console.log(sprite.x);
            sprite.spaceCount++;
            if(sprite.spaceCount == sprite.quantization){
                sprite.patternCount++;
                sprite.spaceCount = 0;
            }
            if (sprite.patternCount == sprite.pattern.length) {
                sprite.repeatPattern--;
                if(sprite.repeatPattern == 0) {
                    sprite.patternEnded = true;
                } else {
                    sprite.patternCount = 0;
                }
            }
        }
    },
    /**
     * Helper to create an array of the same images
     * @param imagesURL
     * @param Number of images to create
     * @param callbackFn
     */
    createImagesArray:function(imagesURL,number,callbackFn){
        var imagesArray = [];
        var image = document.createElement("IMG");
        image.src = imagesURL;
        image.onload = function() {
            var a = 0;
            do {
                var im = image.cloneNode(true);
                imagesArray.push(im);
                a++;
            } while(a < number);
            callbackFn(imagesArray);
        };

    },
    /**
     * Helper to create an images array by slicing up an animation image
     * @param imagesURL Image URL - will be a single image containing a series of animated images
     * @param frameWidth Width of a single frame of the animation
     * @param frameHeight Height of a single frame of the animation
     * @param callbackFn Returns an array of images of each frame in the animation
     */
    createAnimationImagesArray:function(imagesURL,frameWidth,frameHeight,callbackFn){
        var items = [];
        var imagesArray = [];
        var image = document.createElement("IMG");
        image.src = imagesURL;
        image.onload = function() {
            // Split up
            var imageWidth = image.width;
            var imageHeight = image.height;
            if(imageWidth % frameWidth !=0 || imageHeight % frameHeight != 0){
                console.log("Warning: Can't evenly split animation image '" + imagesURL + "' into widths and/or heights specified. Image is " + imageWidth + " x " + imageHeight)
            }
            for(var h = 0; h < imageHeight/frameHeight ;h++) {
                for (var w = 0; w < imageWidth/frameWidth ; w++) {
                    var iCanvas = document.createElement('canvas');
                    var iContext = iCanvas.getContext("2d");
                    iCanvas.width = frameWidth;
                    iCanvas.height = frameHeight;
                    iContext.drawImage(image, w*frameWidth, h*frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                    imagesArray.push(iCanvas);
                }
            }
            callbackFn(imagesArray);
        };
    },
    /**
     *
     */
    strobeColour: function () {
        var strobeDirection = 4;
        var strobe = 0;

        setInterval(function () {
            strobe += strobeDirection;
            if (strobe > 255 || strobe < 0) {
                strobeDirection = -strobeDirection;
            }
        }, 1);

        return {
            getStrobe: function () {
                return strobe;
            }
        }
    }(),

    /**
     * Centres text on context
     * @param ctx
     * @param text
     * @param y
     */
    centreText: function (ctx, text, y) {
        var length = ctx.measureText(text).width;
        ctx.fillText(text, (width / 2) - (length / 2), y);
    },

    /**
     * Formats score for gaming display
     * @param score
     * @returns {string}
     */
    getFormattedScore: function (score) {
        var formattedScore = "";
        if (score < 10)
            formattedScore = "00000" + score;
        if (score > 9 && score < 100)
            formattedScore = "0000" + score;
        if (score > 99 && score < 1000)
            formattedScore = "000" + score;
        if (score > 999 && score < 10000)
            formattedScore = "00" + score;
        if (score > 9999 && score < 100000)
            formattedScore = "00" + score;
        if (score > 99999 && score < 1000000)
            formattedScore = "0" + score;

        return formattedScore;
    },

    /**
     *
     * @param srcWidth
     * @param srcHeight
     * @param srcX
     * @param srcY
     * @param destWidth
     * @param destHeight
     * @param destX
     * @param destY
     * @param event
     */
    checkForCollision: function (srcWidth, srcHeight, srcX, srcY, destWidth, destHeight, destX, destY, event) {

        var offset = 0;
        var xDiff = Math.abs((srcX + (srcWidth / 2)) - (destX + (destWidth / 2))) + offset;
        var yDiff = Math.abs((srcY + (srcHeight / 2)) - (destY + (destHeight / 2))) + offset;

        if (xDiff < ((srcWidth / 2) + (destWidth / 2)) && yDiff < ((srcHeight / 2) + (destHeight / 2))) {
            event();
        }

    },

    /**
     *
     * @param start
     * @param end
     * @param preserveFloat
     * @returns {number}
     */
    random: function (start, end, preserveFloat) {

        var range = end - start;
        var result = 0;
        if (preserveFloat)
            result = start + Math.random() * range;
        else
            result = start + Math.floor(Math.random() * range);

        return result;
    },

    /**
     * Colorizes image, changing all pixels to new colour provided.
     * @param image Image to change colour of
     * @param red Red colour amount
     * @param green Green colour amount
     * @param blue Blue colour amount
     * @returns Image as canvas
     */
    colorizeImage:function(image,red,green,blue){

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image,0,0);
        var imageData = ctx.getImageData(0, 0, image.width, image.height);

        for(var y = 0 ; y < canvas.height ; y++) {
            for (x = 0; x < canvas.width; x++) {
                var r = imageData.data[(x * 4) + (y * canvas.width * 4)];
                var g = imageData.data[(x * 4) + (y * canvas.width * 4) + 1];
                var b = imageData.data[(x * 4) + (y * canvas.width * 4) + 2];
                if(r > 0 || g > 0 || b > 0){
                    imageData.data[(x * 4) + (y * canvas.width * 4)] = red;
                    imageData.data[(x * 4) + (y * canvas.width * 4) + 1] = green;
                    imageData.data[(x * 4) + (y * canvas.width * 4) + 2] = blue;
                }
            }
        }
        ctx.putImageData(imageData,0,0);
        return canvas;
    },

    /**
     * Rotates image by amount
     * @param ctx Canvas context of image
     * @param image Image object
     * @param amount Amount in declidean?? degrees
     */
    rotate: function(ctx,image,amount) {
        ctx.clearRect(0, 0, image.width, image.height);
        ctx.translate(image.width/2, image.height/2);
        ctx.rotate(amount);
        ctx.translate(-image.width/2, -image.height/2);
        ctx.drawImage(image, 0, 0);
    },

    /**
     *
     * @param im Image url
     * @param size Size of canvas image
     * @param artifact Pass back artifact that called this method
     * @param callBackFn Callback with new image
     */
    createCanvasImage: function (im, size, artifact, callBackFn) {
        // TODO : Do we need callback and artifact as params?
        var image = new Image();
        image.src = im;
        image.onload = function () {
            console.log("Loaded " + im);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext("2d");
            canvas.width = size || image.width;
            canvas.height = size || image.height;
            context.drawImage(image, 0, 0);
            callBackFn({image: image, canvas: canvas, context: context, artifact:artifact});
        };
    },

    /**
     * Looks for RGB pixel in image data - useful to place sprites or other objects at a
     * specific location
     * @param data Image data to search for target RGB pixel
     * @param width Width of image data
     * @param height Height of image data
     * @param redCondition Red colour to check for
     * @param greenCondition Green colour to check for
     * @param blueCondition Blue colour to check for
     * @param fn Callback function when target RGB pixel is found
     */
    findDataRGBMarker: function(data,width,height,redCondition,greenCondition,blueCondition,fn){
        // find positions on level
        for(var y = 0 ; y < height ; y++) {
            for(x = 0; x < width ; x++) {

                var r = data[(x * 4) + (y * width * 4)];
                var g = data[(x * 4) + (y * width * 4) + 1];
                var b = data[(x * 4) + (y * width * 4) + 2];

                var r2 = data[(x * 4) + (y * width * 4) + 4];
                var g2 = data[(x * 4) + (y * width * 4) + 1 + 4];
                var b2 = data[(x * 4) + (y * width * 4) + 2 + 4];

                if (r == redCondition && g == greenCondition && b == blueCondition) {
                    fn(x, y);
                }
            }
        }
    }
};

