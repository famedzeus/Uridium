var frame = function () {

    var frameMode = '';
    var artifacts = {};
    var changeToFrame = "";
    var changeToFrameCount = 0;
    var fadeMode = 99;
    var opacity = 1;
    var fadeDelay = 100;
    var updatingArtifacts = false;
    var onInitialiseFn = null;
    var onChangeModeFn = null;
    var onResetArtifactFn = null;
    var paused = false;

    var updateArtifacts = function () {

        if (!updatingArtifacts) {


            // Set flag to indicating update is in progress
            updatingArtifacts = true;

            // Are we changing to a different frame?
            if (changeToFrame != "") {

                // Elegant frame change delay
                if (changeToFrameCount > 0) {
                    changeToFrameCount--;
                }

                if (changeToFrameCount == 0) {

                    /*********************
                     * Frame change
                     *********************/

                    // Change to a different frame
                    frameMode = changeToFrame;

                    // add a USE of the mandatory CANVAS,SCREEN artifact if this artifact does not have it
                    /*
                    if(frameMode != "CANVAS" && !artifacts[frameMode]["AAAAA_USECANVAS"]){
                        artifacts[frameMode]["AAAAA_USECANVAS"] = { frame: "CANVAS", name: "SCREEN" };
                    }
                    */

                    // Loop through artifacts in new frame and execute resets if not 'USE' artifacts
                    for (var artifact in artifacts[frameMode]) {
                        if (artifact.indexOf("USE") == -1) {
                            artifactObject = artifacts[frameMode][artifact];
                            if (artifactObject.reset && artifactObject.initialised) {
                                artifactObject.reset();
                                if (onResetArtifactFn) {
                                    onResetArtifactFn(frameMode, artifact);
                                    console.log("Reset " + frameMode + "," + artifact);
                                }
                            }
                        }
                        else {
                            // 'USE' artifact
                            artifactObject = artifacts[artifacts[frameMode][artifact].frame][artifacts[frameMode][artifact].name];
                        }
                    }
                    changeToFrame = "";

                    // Issue change callback, if supplied
                    if (onChangeModeFn) {
                        onChangeModeFn(frameMode);
                        console.log("Mode changed to : " + frameMode);
                    }

                }
            }

            // Loop through artifacts
            for (artifact in artifacts[frameMode]) {

                // Is frame a 'USE' frame?
                if (artifact.indexOf("USE") == -1)
                    artifactObject = artifacts[frameMode][artifact];
                else
                    artifactObject = artifacts[artifacts[frameMode][artifact].frame][artifacts[frameMode][artifact].name];

                if (artifactObject == undefined) {
                    throw("frameJS Error : Frame is invalid:" + frameMode + " : " + artifact);
                }

                /*********************
                 * Frame initialise
                 *********************/
                if (!artifactObject.initialised && !artifactObject.initialising) {

                    artifactObject.initialising = true;

                    artifactObject.frameMode = frameMode;
                    artifactObject.artifact = artifact;

                    artifactObject.initialise(artifactObject,function(obj) {

                        if (onInitialiseFn) {
                            onInitialiseFn(obj.frameMode, obj.artifact);
                        }

                        console.log("Initialised " + obj.frameMode + "," + obj.artifact);
                        obj.initialised = true;
                        //changeToFrame = "";

                        if (obj.timings) {
                            obj.timingCounts = [];
                            for (timing in obj.timings) {
                                obj.timingCounts[timing] = obj.timings[timing].start || 0;
                            }
                        }
                    });

                } else {

                    /*********************
                     * Frame update
                     *********************/

                    condition = true;
                    if (artifactObject.conditions) {
                        condition = artifactObject.conditions();
                    }

                    if (condition) {

                        // Observe priority
                        if(artifactObject.lowerPriority){
                            if(!artifactObject.priorityCount) {
                                artifactObject.priorityCount = 0;
                            }
                            artifactObject.priorityCount += 1;
                            if(artifactObject.priorityCount < artifactObject.lowerPriority) {
                                continue;
                            }else {
                                artifactObject.priorityCount = 0;
                                // let it fall through to update
                            }
                        }

                        artifactObject.update();

                        // Timings
                        if (artifactObject.timings && artifactObject.timingCounts) {
                            for (timing in artifactObject.timings) {
                                artifactObject.timingCounts[timing]++;
                                if (artifactObject.timingCounts[timing] == artifactObject.timings[timing].delay) {
                                    artifactObject.timings[timing].event(artifactObject);
                                    artifactObject.timingCounts[timing] = 0;
                                }
                            }
                        }

                        // Destroy
                        if (artifactObject.isEndOfLife) {
                            if (artifactObject.isEndOfLife()) {
                                if (artifactObject.destroy) {
                                    artifactObject.destroy(artifactObject);
                                }
                            }
                        }
                    }
                }
            }
            updatingArtifacts = false;
        }

    };

    var update = function () {

        var fps = 60;
        requestAnimationFrame(update);
        if(!paused) {
            updateArtifacts();
        }
    };

    //setInterval(update,10);

    return {

        // Interface

        addArtifacts: function (modes) {
            if(!modes["CANVAS"]){
                throw("Error no mandatory CANVAS artifact defined. You must declare an artifact of mode CANVAS and frame SCREEN");
            }
            if(!modes["CANVAS"]["SCREEN"]){
                throw("Error no mandatory SCREEN mode defined. You must declare an artifact of mode CANVAS and frame SCREEN");
            }
            for (mode in modes) {
                artifacts[mode] = {};
                for (artifact in modes[mode]) {
                    if (!artifacts[mode][artifact]) {
                        artifacts[mode][artifact] = modes[mode][artifact];
                        // Alias provided for easier reference in frames javascript?
                        if (artifacts[mode][artifact].alias) {
                            if (!frame[artifacts[mode][artifact].alias]) {
                                frame[artifacts[mode][artifact].alias] = artifacts[mode][artifact];
                            } else {
                                throw("frameJS error: Alias '" + artifacts[mode][artifact].alias + "' in " + mode + "," + artifact + " is defined elsewhere.");
                            }
                        } else {
                            // If no alias, provide shorthand object.
                            frame[mode + "," + artifact] = artifacts[mode][artifact];
                        }
                    } else {
                        throw("frameJS error:Duplicated artifact! " + mode + "," + artifact);
                    }
                }
            }
        },
        /**
         * Change to new frame mode
         * @param md Frame mode name to change to.
         * @param pause A value to count to which constitutes a pause before changing to the new frame.
         */
        gotoMode: function (mode, pause) {
            fadeMode = 0;
            changeToFrame = mode;
            if (pause)
                changeToFrameCount = pause;
        },
        getMode: function() {
            return frameMode;
        },
        getArtifactProperty: function (frame, name, property) {
            return artifacts[frame][name][property];
        },
        resetArtifact: function (mode, artifact) {
            artifacts[mode][artifact].initialised = false;
        },
        resetAll: function (modes) {
            for (mode in modes) {
                for (artifact in modes[mode]) {
                    artifacts[mode][artifact].initialised = false;
                    artifacts[mode][artifact].initialising = false;
                }
            }
        },
        getOpacity: function () {
            return opacity;
        },
        /**
         * Fire provided function when an artifact is initialised
         * frameJS will pass the frame mode name and artifact name as parameters in the function
         * @param fn Function to fire
         */
        onInitialiseArtifact: function (fn) {
            onInitialiseFn = fn;
        },
        /**
         * Fire provided function when mode is changed.
         * @param fn Function to fire
         */
        onChangeMode: function (fn) {
            onChangeModeFn = fn;
        },
        /**
         * Fire provided function when artifact within mode is reset.
         * @param fn Function to fire
         */
        onResetArtifact: function (fn) {
            onResetArtifactFn = fn;
        },
        update: update,
        updatingArtifacts: updatingArtifacts,
        togglePause: function(){
            paused = !paused;
        }

    };

}();