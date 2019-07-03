// -------------- Scene Manager ----------------
function SceneManager(init = {}) {
    this.scenes = init.scenes ? init.scenes : [];
    this.currentScene = init.currentScene ? init.currentScene : null;
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
        let removeIndex = this.scenes.indexOf(eraseScene);
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
SceneManager.prototype.changeScene = function(newScene) {
    let exists = this.findScene(newScene);
    if(exists) {
        this.currentScene = newScene;
        // Toggle flags
        this.scenes.map( (scene => scene.isActive = false ));
        exists.isActive = true;
    } else {
        throw('No such scene!');
    }
}
// ? (debugger) Print ALL values
SceneManager.prototype.print = function() {
    console.log(' -------> PRINT ALL <------- ', this);
    this.scenes.map( (scene => scene.print() ));
}

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
    this.background = {
        img: init.img ? init.init : null,
        repeat: {
            x: 3,
            y: 3
        },
        mode: init.mode ? init.mode : null, // Enum: 'scroll', 'static' // TODO: More, explore 'patterns' (stretch)
        scrollDir: {
            dx: -10,
            dy: 0
        },
        scrollPos: {
            x: 0,
            y: 0
        },
    };
    this.cameraFocus = init.cameraFocus ? init.cameraFocus : false;
    this.objects = init.objects ? init.objects : [];
    this.engines = init.engines ? init.engines : [];
    if(init.engine) { this.engines.push(init.engine); }
    // Flags
    this.isActive = false;
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
    this.background.scrollPos.x += this.background.scrollDir.dx;
    this.background.scrollPos.y += this.background.scrollDir.dy;
    if(Math.abs(this.background.scrollPos.x) > this.background.img.width) {this.background.scrollPos.x = 0}
    if(this.background.scrollPos.y > this.background.img.height) {this.background.scrollPos.y = 0}
    // ctx.translate(this.background.scrollPos.x, this.background.scrollPos.y);
}
Scene.prototype.setBackground = function (img) {
    this.background.img = img;
    // ! Asynchrony problem: image onload! img.width = 0 -> Cria infinity
    let ratioX = CWidth / img.width;
    let ratioY = CHeight / img.height;
    
    this.background.repeat.x = ratioX * 3;
    this.background.repeat.y = ratioY * 3;
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
    if(this.background.img) {
        ctx.save();
        this.translateRefresh();
        pattern = ctx.createPattern(background, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(-this.background.img.width, -this.background.img.height, 
                        this.background.img.width*this.background.repeat.x, this.background.img.height*this.background.repeat.y);
        ctx.restore();
    }
    // Draw Engines/Objects
    if(useSceneCtx) {
        if(this.gridStyle) {
            this.gridStyle === 'normal' ? this.drawGrid(ctx) : this.drawExtendedGrid(ctx, 2); // TODO: Make this '2' changeable
        }
        this.engines.map( (engine) => engine.updateAllCoordsAndDraw(ctx) ); 
        this.objects.map( (obj) => obj.draw(ctx) );
    }
    else {
        if(this.gridStyle) {
            this.gridStyle === 'normal' ? this.drawGrid(ctx) : this.drawExtendedGrid(ctx, 2); // TODO: Make this '2' changeable
        }
        this.engines.map( (engine) => engine.updateAllCoordsAndDraw() ); 
        this.objects.map( (obj) => obj.draw() );
    }
    ctx.restore();
}
// Reset
Scene.prototype.reset = function (isHardReset) {
    this.engines.map( (engine) => engine.reset(isHardReset) ); 
    this.objects.map( (obj) => obj.reset(isHardReset) );
}
// Objects and Engines
Scene.prototype.attachEngine = function (newEngine) {
    this.engines.push(newEngine);
}
Scene.prototype.attachEngines = function (newEngines) {
    this.engines.push([...newEngines]);
}
Scene.prototype.attachObj = function (newObject) {
    this.objects.push(newObject);
}
Scene.prototype.attachObjs = function (newObjects) {
    this.objects.push(...newObjects);
}
// ? (debugger) Print ALL values
Scene.prototype.print = function() {
    console.log(this.name + ': ', this);
    this.engines.map( (engine => engine.print(this.name) ));
    this.objects.map( (object => object.print() ));
}
