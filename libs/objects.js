// ------------------------ Father Structure ------------------------
// Arguments:
// x, y: are mandatory; position center of object
// init: {r, angle, , ctx, name, group, img (ImageV2), fillColor, lineColor, lineWidth} (all optional)
// ctx (should be mandatory if not provided in 'init')
function Structure(x, y, ctx, init = {}) {
    // Position
    this.x = x,
    this.y = y
    this.r = init.r ? init.r : 10;
    this.angle = init.angle ? init.angle : 0;

    // Dynamic
    this.ax = init.ax ? init.ax : 0;
    this.ay = init.ay ? init.ay : 0;
    this.vx = init.vx !== undefined ? init.vx : 0;
    this.vy = init.vy !== undefined ? init.vy : 0;
    this.vr = init.vr ? init.vr : 0;
    this.spawner = init.spawner ? init.spawner : null;

    // Identifiers
    this.ctx = ctx;
    this.name = init.name ? init.name : 'none';
    this.group = init.group ? init.group : '0';
    this.collisionGroup = init.cGroup ? init.cGroup : '0';
    this.rBounds = init.rBounds ? init.rBounds : this.r * (init.rbRatio ? init.rbRatio : 1.5);
    this.lnWidthBounds = init.lnWidthBounds ? init.lnWidthBounds : Math.ceil(this.r / 50);
    this.lnColorBounds = init.lnColorBounds ? init.lnColorBounds : '#ff2222';

    // Coloring
    if(init.img) {
        let imgClone = init.img.cloneNode(true);
        this.img = imgClone;
        let thisCtx = this;
        imgClone.onload = function() {         
            if(!thisCtx.isClipped) {
                // In case is Sprite, display image has different Width than whole sprite
                let nOfFrames = thisCtx instanceof SpriteObj ? thisCtx.numberOfFrames : 1;
                thisCtx.width = imgClone.width / nOfFrames;
                thisCtx.height = imgClone.height;
                // thisCtx.r = Math.max(sthisCtx.width / 2, thisCtx.height / 2);
                thisCtx.r = (thisCtx.width/2 + thisCtx.height/2) / 2;
            }
            thisCtx.pattern = ctx.createPattern(imgClone, "repeat"); 
        }
    }
    this.fillColor = init.fillColor ? init.fillColor : '#ffffff';
    this.lineColor = init.lineColor ? init.lineColor : '#999999';
    this.lineWidth = init.lineWidth ? init.lineWidth : 2;

    // Flags
    this.isSelected = init.isSelected === undefined ? false : init.isSelected;  // Controls if is highlighted
    this.isActive = init.isActive === undefined ? true : init.isActive;         // Controls if it is active on the scene
    this.isAnimated = init.isAnimated === undefined ? true : init.isAnimated;   // Controls if its coords are updated (moving)
}
// Reset
Structure.prototype.reset = function (isHardReset, reset) {
    if(isHardReset) { Structure.call(this, 0, 0, this.ctx); }
    else { 
        this.resetCoords(reset);
        this.endDisplay();
    }
}
// Resume
Structure.prototype.resume = function () {
    this.startDisplay();
}
// Set Coord
Structure.prototype.resetCoords = function (reset = {}) { 
    // Position
    this.x =        reset.x !== undefined ? reset.x : this.x;
    this.y =        reset.y !== undefined ? reset.y : this.y;
    this.angle =    reset.angle !== undefined ? reset.angle : this.angle;

    // Dynamic
    this.vx = reset.vx !== undefined ? reset.vx : this.vx;
    this.vy = reset.vy !== undefined ? reset.vy : this.vy;
    this.vr = reset.vr !== undefined ? reset.vr : this.vr;
}
// End
Structure.prototype.endDisplay = function () {
    // Flags
    this.isSelected = false;
    this.isActive = false;
    this.isAnimated = false;
}
// Start
Structure.prototype.startDisplay = function () {
    // Flags
    this.isSelected = false;
    this.isActive = true;
    this.isAnimated = true;
}
// Draw
// Calls 'DrawC' of each specific case
Structure.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) { throw(': No context found for Structure'); }
    if(!this.isActive) { return; }
    // Draw
    this.drawC(ctx, customTransf);
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
}
// Draw Bounds
Structure.prototype.drawBounds = function (ctx = this.ctx) {
    if(!ctx) { throw(': No context found for Structure Bounds'); }

    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.rBounds, 0, Math.PI * 2, false);
    ctx.strokeStyle = this.lnColorBounds;
    ctx.lineWidth = this.lnWidthBounds;
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}
// Get Square Bounds
// Based on 'r' with a minimum threshold
Structure.prototype.getBounds = function (rThresholdMin) {
    if(rThresholdMin && rThresholdMin > this.r) {
        return {
        x: this.x - rThresholdMin,
        y: this.y - rThresholdMin,
        width: rThresholdMin * 2,
        height: rThresholdMin * 2
    };
    } else {
        return {
        x: this.x - this.r,
        y: this.y - this.r,
        width: this.r * 2,
        height: this.r * 2
    };
    }
};
// Gets & Sets
Structure.prototype.getPosVec   = function () { return new Vector2(this.x, this.y); }
Structure.prototype.getSpeedVec = function () { return new Vector2(this.vx, this.vy); }
// ? (debugger) Print ALL values
Structure.prototype.print = function(info) {
    let infoDisplay1 = info ? ' (' + info + ')'  : ''
    let infoDisplay = this.name && this.name !== 'none' ? this.name : 'Obj';
    console.info(infoDisplay + infoDisplay1, this);
}

/*
    ****************************************************** //     ****
    ****************************************************** //   ********
    ****************************************************** //  **********
    ****************************************************** // ************
    ****************************************************** //  **********
    ****************************************************** //   ********
    ****************************************************** //     ****
*/

// ------------------------ Circle ------------------------

function Circle(x, y, ctx, init = {}) {
    this.hasDirection = !!init.hasDirection;
    Structure.call(this, x, y, ctx, init);
}
Circle.prototype = new Structure;

// Draw
Circle.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Object draw
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2, false);
    if(this.hasDirection) { ctx.lineTo(0, 0); }
    ctx.fillStyle = this.pattern ? this.pattern : this.fillColor;
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    
    ctx.restore();    
}

/*
    ****************************************************** //     ******
    ****************************************************** //    **
    ****************************************************** //     ***
    ****************************************************** //       ***
    ****************************************************** //         **
    ****************************************************** //    ******
*/
// ------------------------ Square ------------------------

function Square(x, y, ctx, init = {}) {
    if(!init.r) {
        init.r = init.length ? init.length : 10;
    }
    Structure.call(this, x, y, ctx, init);
}
Square.prototype = new Structure;

// Draw
Square.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw Object
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.pattern ? this.pattern : this.fillColor;
    ctx.strokeStyle = this.lineColor;
    ctx.beginPath();
    ctx.rect( -this.r / 2, -this.r / 2, this.r, this.r);
    ctx.closePath();
    ctx.fill();
    if (this.lineWidth > 0) {
        ctx.stroke();
    }

    ctx.restore();    
}

/*
    ****************************************************** //    ******
    ****************************************************** //    **   **
    ****************************************************** //    **   **
    ****************************************************** //    ******
    ****************************************************** //    ** **
    ****************************************************** //    **  **
*/
// ------------------------ Rectangle ------------------------
// Arguments:
// init: { width , height }
function Rectangle(x, y, ctx, init = {}) {
    this.widthR = this.width = init.width ? init.width : 10;
    this.heightR = this.height = init.height ? init.height : 20;
    if(!init.r) { init.r = Math.max(this.widthR/2, this.heightR/2); }
    Structure.call(this, x, y, ctx, init);
}
Rectangle.prototype = new Structure;

// Draw
Rectangle.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
  
    // Object Draw
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.pattern ? this.pattern : this.fillColor;
    ctx.strokeStyle = this.lineColor;
    ctx.beginPath();
    ctx.rect( -this.widthR / 2, -this.heightR / 2, this.widthR, this.heightR);
    ctx.closePath();
    ctx.fill();
    if (this.lineWidth > 0) {
        ctx.stroke();
    }

    ctx.restore();
}

/*
    ****************************************************** //   ********
    ****************************************************** //   ********
    ****************************************************** //      **
    ****************************************************** //      **
    ****************************************************** //      **
    ****************************************************** //      **
*/
// ------------------------ Triangle ------------------------
// Arguments:
// init: { isShipLike (flag, true/false), angleConst: (Interior Angle [0, PI/2[) }
function Triangle(x, y, ctx, init = {}) {
    Structure.call(this, x, y, ctx, init);
    this.angleConst = init.angleConst ? init.angleConst : Math.PI;
    this.isShipLike = init.isShipLike;
}
Triangle.prototype = new Structure;

// Draw
Triangle.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Object Draw 
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.lineColor;
    ctx.fillStyle = this.pattern ? this.pattern : this.fillColor;
    ctx.beginPath();
    ctx.moveTo(this.r, 0);
    let x2ndPoint = this.r * Math.cos(this.angleConst + Math.PI/2),
        y2ndPoint = this.r * Math.sin(this.angleConst + Math.PI/2);
    ctx.lineTo(x2ndPoint, y2ndPoint);
    if(this.isShipLike) {
        ctx.lineTo(0, 0);
    }
    ctx.lineTo(x2ndPoint, -y2ndPoint);
    ctx.lineTo(this.r, 0);
    ctx.fill();
    if (this.lineWidth > 0) {
        ctx.stroke();
    }

    ctx.restore();
}

/*
    ****************************************************** //    ******
    ****************************************************** //    **   **
    ****************************************************** //    **   **
    ****************************************************** //    ******
    ****************************************************** //    **
    ****************************************************** //    **
*/
// ------------------------ Polygon ------------------------
// Arguments:
// init: { hasDirection (flag, true/false): to paint direction line }
// sides: minimum value should be 3
function Polygon(x, y, ctx, sides, init = {}) {
    Structure.call(this, x, y, ctx, init);
    this.hasDirection = !!init.hasDirection;
    this.sides = sides < 3 ? sides = 3 : sides;
}
Polygon.prototype = new Structure;

// Draw
Polygon.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Object Draw
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.lineColor;
    ctx.fillStyle = this.pattern ? this.pattern : this.fillColor;
    ctx.beginPath();
    ctx.moveTo(this.r, 0);
    let incAngle = 2*Math.PI / this.sides;
    for(let i = 0; i < this.sides; i++) {
        ctx.lineTo(this.r * Math.cos(incAngle*i), this.r * Math.sin(incAngle*i));
    }
    ctx.lineTo(this.r, 0);
    if(this.hasDirection) { ctx.lineTo(0, 0); }
    ctx.fill();
    if (this.lineWidth > 0) {
        ctx.stroke();
    }

    ctx.restore();
}
/*
    ****************************************************** //    *****
    ****************************************************** //   **   ***
    ****************************************************** //  **
    ****************************************************** //  **
    ****************************************************** //   **   ***
    ****************************************************** //    *****
*/
// ------------------------ Composed Object ------------------------
function Composed(x, y, ctx, init = {}) {
    Structure.call(this, x, y, ctx, init);
    this.primitives = {};
}
Composed.prototype = new Structure;

// Build Composed
Composed.prototype.addPrimitive = function(name, newPrimitive) {
    this.primitives[name] = newPrimitive;
}
// Recursive Build // TODO: coords.angle is not being considered
Composed.prototype.parseComposed = function(fileJSON, ctx) {
    // Start of recursion
    if(fileJSON.parts) {
        fileJSON.parts.map(part => {
            let newPart = this.cycleFile(part, ctx);
            this.addPrimitive(newPart.name, newPart.obj);
        });
    }
}
Composed.prototype.cycleFile = function(subJSON, ctx) {
    // Recursive function
    if(subJSON.obj) {
        return { name: subJSON.name, obj: subJSON.obj }; 
    } else {
        let subComposed = new Composed(subJSON.coords.x, subJSON.coords.y, ctx);
        subJSON.parts.map(part => {
            let newPart = this.cycleFile(part, ctx);
            subComposed.addPrimitive(newPart.name, newPart.obj);
        });
        return { name: subJSON.name, obj: subComposed};
    }
}
// Draw
Composed.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    // Loop All objects
    Object.keys(this.primitives).forEach( (key) => {
        // Draw
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx ? this.primitives[key].draw(ctx) : this.primitives[key].draw(undefined);

        ctx.restore();
    });
}

/*
    ****************************************************** //    ******
    ****************************************************** //      **
    ****************************************************** //      **
    ****************************************************** //      **
    ****************************************************** //      **
    ****************************************************** //    ******
*/
// ------------------------ Image Object ------------------------
function ImageObj(x, y, ctx, init = {}) {
    this.isClipped = !!init.isClipped;
    this.img = init.img;
    if(init.isClipped) {
        this.width = init.width ? init.width : 40;
        this.height = init.height ? init.height : 40;
        this.r = Math.max(this.width / 2, this.height / 2);
    } else {
        this.width = 10;
        this.height = 10;
    } 
    if(!init.img) { throw(': No img found for ImageObj'); }
    if(!init.r) { init.r = Math.max(this.width, this.height); }

    Structure.call(this, x, y, ctx, init);
}
ImageObj.prototype = new Structure;

// Draw
ImageObj.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    ctx.drawImage(this.img, this.x - this.width/2, this.y - this.height/2, this.width, this.height);

    ctx.restore();
}

/*
    ****************************************************** //    ******      ******
    ****************************************************** //      **       **
    ****************************************************** //      **        ***
    ****************************************************** //      **          *** 
    ****************************************************** //      **            ** 
    ****************************************************** //    ****** *   ******
*/
// ------------------------ Sprite Object ------------------------
function SpriteObj(x, y, ctx, init = {}) {
    if(!init.img) { throw(': No img found for SpriteObj'); }
    // Sprite vars
    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = init.ticksPerFrame ? init.ticksPerFrame : 1,
    this.numberOfFrames = init.numberOfFrames ? init.numberOfFrames : 1;
    iCB.insert(this, 'update', this.ticksPerFrame * 1000);

    // Image vars
    this.isClipped = !!init.isClipped;
    this.img = init.img;
    if(init.isClipped) {
        this.width = init.width ? init.width : 40;
        this.height = init.height ? init.height : 40;
        this.r = Math.max(this.width / this.numberOfFrames / 2, this.height / 2);
    } else {
        this.width = 0;
        this.height = 0;
    } 

    Structure.call(this, x, y, ctx, init);
}
SpriteObj.prototype = new Structure;

// Draw
SpriteObj.prototype.drawC = function (ctx = this.ctx, customTransf = {}) {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.drawImage(
        this.img,
        this.frameIndex * this.width,
        0,
        this.width,
        this.height,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
    );

    ctx.restore();
}
// Update Sprite Frame
SpriteObj.prototype.update = function () {
    if (this.frameIndex < this.numberOfFrames - 1) {	
        this.frameIndex += 1;
    } else {
        this.frameIndex = 0;
    }
};