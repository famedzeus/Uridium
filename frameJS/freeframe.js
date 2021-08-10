/*
 freeframe pseudo language
* */

var FREEFRAME = function() {

    var currentGame = "";
    var currentMode = "";
    var currentFrame = "";
    var inFor = false;

    var defaultFrame = {

        groups:[],
        initialise:function() {
        },
        update:function() {
            for(var group in this.groups) {
                for(var item in this.groups[group].items){
                    this.groups[group].methods.update(this.groups[group].items[item]);
                    if(this.groups[group].items[item].kill == true){
                        delete this.groups[group].items[item];
                    }
                }
            }
        },
        reset:function() {

        },
        timings:[
            {
                delay: 1000,
                event: function(artifact) {

                }
            }
        ]
    };

    var defaultCanvasMode = {
        "SCREEN": {
            alias: "DISPLAY",
            screenCanvas: null,
            screenContext: null,
            offScreenCanvas: null,
            offScreenContext: null,
            frameCount: 0,
            lastFrameCount: 0,
            frameTimer: null,
            initialise: function (artifact, fn) {

                this.screenCanvas = document.getElementById('screenCanvas');
                this.screenContext = this.screenCanvas.getContext("2d");
                this.screenCanvas.width = width;
                this.screenCanvas.height = height;

                this.offScreenCanvas = document.createElement('canvas');
                this.offScreenContext = this.offScreenCanvas.getContext("2d");
                this.offScreenCanvas.width = width;
                this.offScreenCanvas.height = height;
                this.offScreenContext.font = "25px Verdana";

                frameUtils.animationManager.start(this.offScreenContext);

                fn(artifact);
            },
            update: function () {
                if (!this.frameTimer) {
                    this.frameTimer = setInterval(function () {
                        frame.DISPLAY.lastFrameCount = frame.DISPLAY.frameCount;
                        frame.DISPLAY.frameCount = 0;
                    }, 1000);
                }
                if (!frame.updatingArtifacts) {

                    this.processing = true;
                    for (particle in particles) {
                        particles[particle].update(particle);
                    }

                    this.offScreenContext.globalAlpha = frame.getOpacity();

                    this.screenContext.drawImage(this.offScreenCanvas, 0, 0);
                    this.processing = false;

                    this.frameCount++;
                }
            }
        }
    };

    var newGame = function(game){
        FREEFRAME[game] = {};
        // Add default canvas mode
        if(!FREEFRAME[game][defaultCanvasMode]){
            FREEFRAME[game]["CANVAS"] = defaultCanvasMode;
        }
    };

    var addMode = function(game,mode){
        validateFields(game);
        FREEFRAME[game][mode] = [];
    };

    var addFrame = function(game,mode,frame){
        validateFields(game,mode);
        FREEFRAME[game][mode][frame] = defaultFrame;
    };

    // Groups (arrays) - usually for repeating objects
    var addGroup = function(groupName,group) {
        if (!inFor){
            throw("addGroup method for group '" + groupName + "' must be in forFrame block.");
        }
        FREEFRAME[FREEFRAME.currentGame][FREEFRAME.currentMode][FREEFRAME.currentFrame].groups[groupName] = [];
        if(!group.items || !group.methods) {
            throw("Group '" + groupName + "' must contain items array and methods array.");
        }
    };

    var addItemToGroup = function(game,mode,frame,groupName,obj){
        validateFields(game,mode,frame,groupName);
        obj.kill = false;
        FREEFRAME[game][mode][frame].groups[groupName].items.push(obj);
    };

    var killItem = function(item) {
        if (!item || !item.kill){
            throw("Kill Item : Item does not exist or is not part of a Mode and Frame.");
        }
        item.kill = true;
    };

    // Creates game,mode and frame if they don't exist as well as shorthand code block
    var forFrame = function(game,mode,frame,fn){
        inFor = true;
        // Create, if not exist
        if (!FREEFRAME[game]) {
            this.newGame(game);
        }
        if(!FREEFRAME[game][mode]) {
            this.addMode(game, mode);
        }
        if(!FREEFRAME[game][mode][frame]) {
            this.addFrame(game,mode,frame);
        }
        validateFields(game,mode,frame);
        FREEFRAME.currentGame = game;
        FREEFRAME.currentMode = mode;
        FREEFRAME.currentFrame = frame;
        fn();
        inFor = false;
    };

    var alias = function(game,mode,frame,alias){
        validateFields(game,mode,frame);
        FREEFRAME[alias] = FREEFRAME[game][mode][frame];
    };

    var validateFields = function(game,mode,frame,groupName){
        if(!inFor){
            throw("Error not in forFrame function.");
        }
        if (game && !FREEFRAME[game]) {
            throw("Game not found : " + game);
        }
        if (mode && !FREEFRAME[game][mode]) {
            throw("Mode not found in : " + game);
        }
        if (frame && !FREEFRAME[game][mode][frame]) {
            throw("Frame " + frame + " not found in : " + game + "," + mode);
        }
        if (groupName && !FREEFRAME[game][mode][frame].groups[groupName]) {
            throw("Group " + groupName + " name not found in : " + game + "," + mode);
        }
    };

    return {
        newGame:newGame,
        addMode:addMode,
        addFrame:addFrame,
        addGroup:addGroup,
        addItemToGroup:addItemToGroup,
        killItem:killItem,
        // FreeFrame Programming abstractions
        forFrame:forFrame,
        alias:alias
    }

}();

var ff = FREEFRAME;
var free = FREEFRAME;