function Controller (environment) {
    this.env = environment;
    this.flags = { // TODO: Organize how to detect all flag changes
        isDownM1: false,
        isDownM2: false,
    },
    this.globalVars = {
        // For panning
        temZoomX: 0,
        temZoomY: 0,
        panningVectorInit: {
            x: 0,
            y: 0
        },
        // For zoom
        zoomMin: 0.1,
        zoomMax: 10
    },
    this.collection = [];
    // * Hardcoded codes
    this.keysCode = {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
        space: 32,
        w: 87,
        a: 65,
        s: 83,
        d: 68,
        q: 81,
        e: 69,
        r: 82,
        f: 70,
        z: 90,
        x: 88,
        c: 67,
        v: 86,
        p: 80,
        enter: 13,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 52,
        shiftLeft: 16,
        ctrlLeft: 17,
        tab: 9,
        backquote: 220,
        t: 84,
        g: 71,
        b: 66,
    };
    this.defaultCallbacks = {
        // Key Move
        yUP: function(varMap, values) { varMap.vy = -values; },
        yDOWN: function(varMap, values) { varMap.vy = values; },
        xRIGHT: function(varMap, values) { varMap.vx = values; },
        xLEFT: function(varMap, values) { varMap.vx = -values; },
        // Key Up
        OUTyUP: function(varMap) { if(varMap.vy > 0){} else { varMap.vy = 0; } },
        OUTyDOWN: function(varMap) { if(varMap.vy < 0){} else { varMap.vy = 0; } },
        OUTxRIGHT: function(varMap) { if(varMap.vx < 0){} else { varMap.vx = 0; } },
        OUTxLEFT: function(varMap) { if(varMap.vx > 0){} else { varMap.vx = 0; } },
        // Thust
        thrust: function(varMap, values) { 
            varMap.ax = -values * Math.cos(varMap.angle);
            varMap.ay = -values * Math.sin(varMap.angle);
        },
        thrustOUT: function(varMap) { varMap.ax = 0; varMap.ay = 0; },
        // Key Rotate
        rotateobj: function(varMap, values) {
            varMap.vr = values;
        },
        // Mouse Click and Pan
        focusTarget: function(varMap) {
            this.globalVars.panningVectorInit = {x: mouse.x, y: mouse.y};
            this.globalVars.temZoomX = varMap.zoom.x;
            this.globalVars.temZoomY = varMap.zoom.y;
        },
        moveTarget: function(varMap) {
            if(this.flags.isDownM1) {
              let zdx = (mouse.x - this.globalVars.panningVectorInit.x) * 1/varMap.zoom.scale;
              let zdy = (mouse.y - this.globalVars.panningVectorInit.y) * 1/varMap.zoom.scale;
              varMap.setPanning(this.globalVars.temZoomX + zdx, this.globalVars.temZoomY + zdy, 1);
            }
        },
        // Mouse Scroll
        scrollZoom: function(varMap, values, scrollDir) {
            if(varMap.isActive) {
                let newScale = varMap.zoom.scale - values * scrollDir;
                if(newScale < this.globalVars.zoomMin) { newScale = this.globalVars.zoomMin; }
                if(newScale > this.globalVars.zoomMax) { newScale = this.globalVars.zoomMax; }
                varMap.setZoom(newScale);
            }
        },
        lookToMouse: function(varMap, values) {
            let trueMouseX = mouse.x - values.zoom.x;
            let trueMouseY = mouse.y - values.zoom.y;
            let dx = trueMouseX - varMap.x;
            let dy = trueMouseY - varMap.y; 
            let angleN = Math.atan(dy / dx);
            if(dx < 0) { angleN += Math.PI; }
            varMap.angle = angleN;
        },
    };
}

// Set Global Vars
Controller.prototype.setValues = function (zoomMin) {
    this.globalVars.zoomMin = zoomMin;
    // (...)
}

// * Enums
/* Default modes: 
    'WASD-strafe', 'WASD-dir', 'Arrows-strafe', 'Arrows-dir'
    'Mouse-move', 'Mouse-dir', 'Mouse-pan'

   Events:
    'keydown', 'keyup', 'mousemove', 'click'
*/
Controller.prototype.addDefaultController = function (defaultType, varMap, values) {
    switch(defaultType) {
        case 'WASD-strafe':
            // Key Down
            this.addKeyFunction('w', 'keydown', this.defaultCallbacks.yUP, varMap, values);
            this.addKeyFunction('s', 'keydown', this.defaultCallbacks.yDOWN, varMap, values);
            this.addKeyFunction('a', 'keydown', this.defaultCallbacks.xLEFT, varMap, values);
            this.addKeyFunction('d', 'keydown', this.defaultCallbacks.xRIGHT, varMap, values);
            // Key Up
            this.addKeyFunction('w', 'keyup', this.defaultCallbacks.OUTyUP, varMap);
            this.addKeyFunction('s', 'keyup', this.defaultCallbacks.OUTyDOWN, varMap);
            this.addKeyFunction('a', 'keyup', this.defaultCallbacks.OUTxLEFT, varMap);
            this.addKeyFunction('d', 'keyup', this.defaultCallbacks.OUTxRIGHT, varMap);
            break;
        case 'WASD-thrust':
            // Key Down
            this.addKeyFunction('w', 'keydown', this.defaultCallbacks.thrust, varMap, -values);
            this.addKeyFunction('s', 'keydown', this.defaultCallbacks.thrust, varMap, values);
            // Key Up
            this.addKeyFunction('w', 'keyup', this.defaultCallbacks.thrustOUT, varMap);
            this.addKeyFunction('s', 'keyup', this.defaultCallbacks.thrustOUT, varMap);           
            break;
        case 'WASD-dir': // TODO: the rest of these
            // Key Down
            this.addKeyFunction('a', 'keydown', this.defaultCallbacks.rotateobj, varMap, -values);
            this.addKeyFunction('d', 'keydown', this.defaultCallbacks.rotateobj, varMap, values);
            // Key Up
            this.addKeyFunction('a', 'keyup', this.defaultCallbacks.rotateobj, varMap, 0);
            this.addKeyFunction('d', 'keyup', this.defaultCallbacks.rotateobj, varMap, 0);
            break;
        case 'Arrows-strafe':
            // Key Down
            this.addKeyFunction('up', 'keydown', this.defaultCallbacks.yUP, varMap, values);
            this.addKeyFunction('down', 'keydown', this.defaultCallbacks.yDOWN, varMap, values);
            this.addKeyFunction('left', 'keydown', this.defaultCallbacks.xLEFT, varMap, values);
            this.addKeyFunction('right', 'keydown', this.defaultCallbacks.xRIGHT, varMap, values);
            // Key Up
            this.addKeyFunction('up', 'keyup', this.defaultCallbacks.OUTyUP, varMap);
            this.addKeyFunction('down', 'keyup', this.defaultCallbacks.OUTyDOWN, varMap);
            this.addKeyFunction('left', 'keyup', this.defaultCallbacks.OUTxLEFT, varMap);
            this.addKeyFunction('right', 'keyup', this.defaultCallbacks.OUTxRIGHT, varMap);
            break;
        case 'Arrows-dir':
            // Key Down
            this.addKeyFunction('left', 'keydown', this.defaultCallbacks.rotateobj, varMap, -values);
            this.addKeyFunction('right', 'keydown', this.defaultCallbacks.rotateobj, varMap, values);
            // Key Up
            this.addKeyFunction('left', 'keyup', this.defaultCallbacks.rotateobj, varMap, 0);
            this.addKeyFunction('right', 'keyup', this.defaultCallbacks.rotateobj, varMap, 0);
            break;
        case 'Mouse-move':
            break;
        case 'Mouse-dir':
            break;
        case 'Mouse-look':
            this.addMouseFunction({x:0, y: 0, width: CWidth, height: CHeight}, 'mousemove', this.defaultCallbacks.lookToMouse, varMap, values);
            break;
        case 'Mouse-clicklook':
            this.addMouseFunction({x:0, y: 0, width: CWidth, height: CHeight}, 'mousedown', this.defaultCallbacks.lookToMouse, varMap, values);
            break;
        case 'Mouse-pan':
            // Bound functions for them to access 'this.globalVars'
            this.defaultCallbacks.focusTarget = this.defaultCallbacks.focusTarget.bind(this);
            this.addMouseFunction({x:0, y: 0, width: CWidth, height: CHeight}, 'mousedown', this.defaultCallbacks.focusTarget, varMap, values);
            this.defaultCallbacks.moveTarget = this.defaultCallbacks.moveTarget.bind(this);
            this.addMouseFunction({x:0, y: 0, width: CWidth, height: CHeight}, 'mousemove', this.defaultCallbacks.moveTarget, varMap, values);       
            break;
        case 'Wheel-zoom':
            this.defaultCallbacks.scrollZoom = this.defaultCallbacks.scrollZoom.bind(this);
            this.addMouseFunction({x:0, y: 0, width: CWidth, height: CHeight}, 'wheel', this.defaultCallbacks.scrollZoom, varMap, values);
            break;
        }
}
// * Add any 'key' for any purpose
/* Arguments:
    keyName: the name of the key as listed in 'this.keysCode';
    eventName: the event name used by JS events listeners;
    func: the function we want to run: func(object, values);
    object: the object that will be changed;
    values: any values that we want to pass to that function;
*/
Controller.prototype.addKeyFunction = function (keyName, eventName, func, object, values, env = this.env) {
    // Just attach a reference to the eventListener
    this.attachVarMaps(keyName, eventName, object);
    // Function being passed to eventListener
    let eventF = function (event) {
        if (event.keyCode === this.keysCode[keyName]) { func(object, values); }
    };
    eventF = eventF.bind(this);
    // Event Listener
    env.addEventListener(eventName, eventF, false);
}
Controller.prototype.attachVarMaps = function (keyName, eventName, object) {
    this.collection.push({id: keyName + ' ' + eventName, obj: object });
}
// * Add a 'mouse' purpose
/* Arguments:
    clickArea: the area where mouse actions occur (Ex: {x:0, y:0, width:CWidth, height:CHeight});
    Rest of arguments the same as above in 'addKeyFunction';
*/
// TODO: Mouse TEST (too long) -> more abstract
Controller.prototype.addMouseFunction = function (clickArea, eventName, func, object, values, env = this.env) {
    let eventF = null;
    this.attachVarMaps(func.name, eventName, object);

    switch(eventName) {
        case 'mousedown':
            eventF = function (event) {
                this.flags.isDownM1 = true;
                if (utils.containsPoint(clickArea, event.x, event.y)) { func(object, values); }
            };
            // Turn flag Off
            eventOut = function () {
                this.flags.isDownM1 = false;
            };
            eventF = eventF.bind(this);
            eventOut = eventOut.bind(this);
            env.addEventListener(eventName, eventF, false);
            env.addEventListener('mouseup', eventOut, false);
        break;
        case 'mouseup':
            eventF = function (event) {
                this.flags.isDownM1 = false;
                if (utils.containsPoint(clickArea, event.x, event.y)) { func(object, values); }
            };
            eventF = eventF.bind(this); 
            env.addEventListener(eventName, eventF, false);
        break;
        case 'wheel':
            eventF = function (event) {
                let scrollDir = event.deltaY < 0 ? -1 : 1;
                if (utils.containsPoint(clickArea, event.x, event.y)) { func(object, values, scrollDir); }
            };
            eventF = eventF.bind(this); 
            env.addEventListener(eventName, eventF, false);
        break;
        default:
            eventF = function (event) {
                if (utils.containsPoint(clickArea, event.x, event.y)) { func(object, values); }
            };
            eventF = eventF.bind(this); 
            env.addEventListener(eventName, eventF, false);
    }
}
