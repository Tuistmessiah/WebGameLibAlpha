// -------------- Scene Manager ----------------
function SceneManager(init = {}) {
    this.scenes = init.scenes ? init.scenes : [];
    this.currentScene = null;
    this.isActive = true;
}
// Zoom
SceneManager.prototype.setAllScenesZoom = function(x, y, scale) {
    this.scenes.map( scene => { scene.setZoom(scale); scene.setPanning(x, y); });
}
SceneManager.prototype.resetAllScenesZoom = function() {
    this.scenes.map( (scene => scene.resetZoom() ));
}

// Update ONLY the Current Scene
SceneManager.prototype.updateCurrentScene = function () {
    let currentScene = this.findScene(this.currentScene);
    if(currentScene) { currentScene.updateScene(); }
}
// Update ALL Scenes in 'this.scenes'
SceneManager.prototype.updateScenes = function () {
    this.scenes.map( (scene => scene.updateScene() ));
}
SceneManager.prototype.addScene = function (newScene) {
    this.scenes.push(newScene);
    if(newScene.name === this.currentScene) { newScene.isActive = true; }
}
SceneManager.prototype.removeScene = function (eraseScene) {
    let exists = this.findScene(eraseScene);
    if(exists) {
        let removeIndex = this.scenes.indexOf(eraseScene); // ! Think its not working (havnet tried!)
        this.scenes = this.scenes.splice(removeIndex, 1);
    } else {
        throw('No such scene!');
    }
}
// Find a scene by its name
SceneManager.prototype.findScene = function (findSceneName) {
    return this.scenes.find( (scene) => scene.name === findSceneName );
}
// Change current Scene
SceneManager.prototype.changeScene = function(newSceneStr) {
    let newScene = this.findScene(newSceneStr);
    if(newScene) {
        let current = this.findScene(this.currentScene);
        current ? current.reset() : null;
        this.currentScene = newSceneStr;
        // Toggle flags
        this.scenes.map( (scene => scene.isActive = false ));
        newScene.resume();
    } else {
        throw('No such scene!');
    }
}
// ? (debugger) Print ALL values
SceneManager.prototype.print = function() {
    console.info(' -------> PRINT ALL <------- ', this);
    this.scenes.map( (scene => scene.print() ));
}
/*
    ****************************************************** //  *
    ****************************************************** //  *
    ****************************************************** //  *
    ****************************************************** //  *
    ****************************************************** //  *
    ****************************************************** //  *
    ****************************************************** //  *
*/
// -------------- Scene ----------------
function Scene(name, ctx, init = {}) {
    // Main
    this.name = name;
    this.ctx = ctx;
    this.gridStyle = init.gridStyle ? init.gridStyle : false; // Enum: (false, normal, extended)
    this.zoom = {
        x: CWidth/2,
        y: CHeight/2,
        scale: 1
    };

    // Coloring
    if(init.img) { this.setBackground(init.img, init); }

    this.cameraFocus = init.cameraFocus ? init.cameraFocus : false;
    // Objects/Engines
    this.objects = init.objects ? init.objects : [];
    this.engines = init.engines ? init.engines : [];
    if(init.engine) { this.engines.push(init.engine); }
    // Spawners
    this.spawners = [];
    // Flags
    this.isActive = false;
    this.isAnimated = true;
    // Errors
    if(!Array.isArray(this.engines)) {
        throw('Not Array: Scene Constructor')
    }
}
// Set camera focus
Scene.prototype.cameraType = function(type, focus) {
    if(type === 'lock') {
        this.cameraFocus = focus;
    }
}
// Execute Zoom in point (zX,zY) with 'scale'
Scene.prototype.zoomIn = function(zX, zY, scale) {
    // Zoom In/Out
    ctx.translate(zX, zY);
    ctx.scale(scale, scale);
    ctx.translate(-zX, -zY);
    // Pan
    ctx.translate(this.zoom.x, this.zoom.y);
}
// Change Zoom and Pan
Scene.prototype.setZoom = function(scale) {
    this.zoom.scale = scale;
}
Scene.prototype.setPanning = function(x, y) {
    this.zoom.x = x;
    this.zoom.y = y;
}
Scene.prototype.resetZoom = function() {
    this.setZoom(CWidth/2, CHeight/2, 1);
}
// Draw Grids
Scene.prototype.drawGrid = function(ctx) {
    // Vertical
    ctx.save();
    ctx.strokeStyle = '#000000';
    for(let i=0; i <= CWidth; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CHeight);
      ctx.stroke();
    }
    ctx.restore();
    // Horizontal
    ctx.save();
    ctx.strokeStyle = '#000000';
    for(let i=0; i <= CHeight; i += 100) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CWidth, i);
      ctx.stroke();
    }
    ctx.restore();
    // Crossings Numbers
    ctx.save();
    for(let i=0; i <= CWidth; i += 100) {
      for(let o=0; o <= CHeight; o += 100) {
        ctx.font = "8pt Arial";
        ctx.fillStyle = 'blue';
        ctx.fillText('(' + i + ', ' + o + ')', i - 25, o);
      }
    }
    ctx.restore();
}
Scene.prototype.drawExtendedGrid = function(ctx, extension) {
    this.drawGrid(ctx);
    let maxX = CWidth * extension;
    let maxY = CHeight * extension;

    // Vertical
    ctx.save();
    ctx.strokeStyle = '#224411';
    ctx.lineWidth = 1;
    for(let i = -maxX; i < 0; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, -maxY);
        ctx.lineTo(i, maxY);
        ctx.stroke();
    }
    for(let i = 0; i < CWidth; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, -maxY);
        ctx.lineTo(i, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i, CHeight);
        ctx.lineTo(i, maxY);
        ctx.stroke();
    }
    for(let i = CWidth; i < maxX; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, -maxY);
        ctx.lineTo(i, maxY);
        ctx.stroke();
    }
    ctx.restore();

    // Horizontal
    ctx.save();
    ctx.strokeStyle = '#224411';
    ctx.lineWidth = 1;
    for(let i = -maxY; i < 0; i += 100) {
        ctx.beginPath();
        ctx.moveTo(-maxX, i);
        ctx.lineTo(maxX, i);
        ctx.stroke();
    }
    for(let i = 0; i < CHeight; i += 100) {
        ctx.beginPath();
        ctx.moveTo(-maxX, i);
        ctx.lineTo(0, i);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CWidth, i);
        ctx.lineTo(maxX, i);
        ctx.stroke();
    }
    for(let i = CHeight; i < maxY; i += 100) {
        ctx.beginPath();
        ctx.moveTo(-maxX, i);
        ctx.lineTo(maxX, i);
        ctx.stroke();
    }
    ctx.restore();

    // Crossings Numbers
    ctx.save();
    for(let i = -maxX; i <= maxX; i += 100) {
      for(let o = -maxY; o <= maxY; o += 100) {
          if(!(i >= 0 && i <= CWidth && o >= 0 && o <= CHeight)) {
            ctx.font = "8pt Arial";
            ctx.fillStyle = 'red';
            ctx.fillText('(' + i + ', ' + o + ')', i - 25, o);
          }
      }
    }
    ctx.restore();
}
// Background
Scene.prototype.translateRefresh = function () {
    if(this.isAnimated) { 
        this.bgConf.scrollPos.x += this.bgConf.scrollDir.dx;
        this.bgConf.scrollPos.y += this.bgConf.scrollDir.dy;
    }
    ctx.translate(this.bgConf.scrollPos.x, this.bgConf.scrollPos.y);
}
// init: mode, isRepeated, x, y, xX, xY
Scene.prototype.setBackground = function (img, init) {
    // Coloring
    let imgClone = img.cloneNode(true);
    let thisCtx = this;
    imgClone.onload = function() { 
        thisCtx.pattern = ctx.createPattern(imgClone, init.isRepeated ? 'repeat' : 'no-repeat'); 
        thisCtx.img = {
            width: imgClone.width,
            height: imgClone.height
        };
    }
    this.bgConf = {
        x: init.x,
        y: init.y,
        repeat: {
            x: 3,
            y: 3
        },
        mode: init.mode ? init.mode : null, // Enum: 'scroll', 'static' // TODO: More, explore 'patterns' (stretch)
        scrollDir: {
            dx: init.dx !== undefined ? init.dx : 0,
            dy: init.dy !== undefined ? init.dy : -1,
        },
        scrollPos: {
            x: 0,
            y: 0
        },
    };
}
// Update Coords and Draw objects
/* Arguments:
    useSceneCtx: boolean -> use this.ctx in engines and objects
*/
Scene.prototype.updateScene = function (useSceneCtx, ctx = this.ctx) {
    this.isActive = true;
    ctx.save();
    // Camera
    if(this.cameraFocus) {
        this.setPanning(-this.cameraFocus.x + (CWidth/2), -this.cameraFocus.y + (CHeight/2));
    }
    this.zoomIn((CWidth/2), (CHeight/2), this.zoom.scale);
    // Draw Background
    if(this.pattern) {
        ctx.save();
        // Horizontal / Vertical displacement
        this.translateRefresh();
        ctx.fillStyle = this.pattern;         
        let xM = -this.bgConf.scrollPos.x;
        let yM = -this.bgConf.scrollPos.y;
        if(xM >= this.img.width) { this.bgConf.scrollPos.x = 0; }
        if(yM >= this.img.height) { this.bgConf.scrollPos.y = 0; }
        if(!this.isAnimated) {  }
        ctx.fillRect(xM, yM, CWidth, CHeight);
        ctx.restore();
    }
    // Draw Engines/Objects
    if(useSceneCtx) {
        if(this.gridStyle) {
            this.gridStyle === 'normal' ? this.drawGrid(ctx) : this.drawExtendedGrid(ctx, 2); // TODO: Make this '2' changeable
        }
        this.engines.map( (engine) => engine.updateAllCoordsAndDraw(this.isAnimated, ctx) ); 
        this.objects.map( (obj) => obj.draw(ctx) );
    }
    else {
        if(this.gridStyle) {
            this.gridStyle === 'normal' ? this.drawGrid(ctx) : this.drawExtendedGrid(ctx, 2); // TODO: Make this '2' changeable
        }
        this.engines.map( (engine) => engine.updateAllCoordsAndDraw(this.isAnimated) ); 
        this.objects.map( (obj) => obj.draw() );
    }
    ctx.restore();
}
// Reset (close scene)
Scene.prototype.reset = function (isHardReset) {
    // Reset callbacks
    this.spawners.map( spawner => iCB.clear(spawner, 'respawn', spawner.refreshRate) ); 
    // // Reset ALL objects
    // // this.engines.map( engine => engine.reset(isHardReset) ); 
    // // this.objects.map( obj => obj.reset(isHardReset) );
}
// Resume (close scene)
Scene.prototype.resume = function () {
    this.isActive = true; 
    // Resume callbacks
    this.spawners.map(spawner => iCB.insert(spawner, 'respawn', spawner.refreshRate) );
    this.spawners.map( (obj) => obj.resetObjs() );
    // // Resume ALL objects
    // // this.engines.map( (engine) => engine.resume() ); 
    // // this.objects.map( (obj) => obj.resume() );
}
// Objects and Engines
Scene.prototype.attachEngine = function (newEngine) {
    this.engines.push(newEngine);
}
Scene.prototype.attachEngines = function (newEngines) {
    this.engines.push(...newEngines);
}
Scene.prototype.attachObj = function (newObject) {
    this.objects.push(newObject);
}
Scene.prototype.attachObjs = function (newObjects) {
    this.objects.push(...newObjects);
}
// Spawners
Scene.prototype.attachSpawnerAndInt = function (newSpawner) {
    this.spawners.push(newSpawner);
}
// ? (debugger) Print ALL values
Scene.prototype.print = function() {
    console.info(this.name + ': ', this);
    this.engines.map( (engine => engine.print(this.name) ));
    this.objects.map( (object => object.print() ));
}
