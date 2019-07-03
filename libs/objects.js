// ------------------------ Father Structure ------------------------
// Arguments:
// init: {x, y, r, angle, , ctx, name, group, img (ImageV2), fillColor, lineColor, lineWidth} (all optional)
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
    this.vx = init.vx ? init.vx : 0;
    this.vy = init.vy ? init.vy : 0;
    this.vr = init.vr ? init.vr : 0;
    this.spawner = init.spawner ? init.spawner : null;

    // Identifiers
    this.ctx = init.ctx ? init.ctx : ctx;
    this.name = init.name ? init.name : 'N/A';
    this.group = init.group ? init.group : '0';
    this.collisionGroup = init.cGroup ? init.cGroup : '0';
    this.rBounds = init.rBounds ? init.rBounds : this.r * 1.5;
    this.lnWidthBounds = init.lnWidthBounds ? init.lnWidthBounds : Math.ceil(this.r / 50);
    this.lnColorBounds = init.lnColorBounds ? init.lnColorBounds : '#ff2222';

    // Coloring
    this.img = init.img;
    this.fillColor = init.fillColor ? init.fillColor : '#ffffff';
    this.lineColor = init.lineColor ? init.lineColor : '#999999';
    this.lineWidth = init.lineWidth ? init.lineWidth : 2;

    // Flags
    this.isSelected = false;
    this.isActive = true;
    this.isAnimated = true;
}

// Reset
Structure.prototype.reset = function (isHardReset) {
    if(isHardReset) { Structure.call(this, 0, 0, this.ctx); }
    else { this.endDisplay(); }
}
// End
Structure.prototype.endDisplay = function () {
    // Position
    this.x = 0;
    this.y = 0;
    this.angle = 0;

    // Dynamic
    this.vx = 0;
    this.vy = 0;

    // Flags
    this.isSelected = false;
    this.isActive = false;
    this.isAnimated = false;
}
// Start
Structure.prototype.startDisplay = function (x, y, init = {}) {
    // Position
    this.x = x;
    this.y = y;
    this.angle = init.angle ? init.angle : 0;

    // Dynamic
    this.vx = init.vx ? init.vx : 0;
    this.vy = init.vy ? init.vy : 0;

    // Flags
    this.isSelected = false;
    this.isActive = true;
    this.isAnimated = true;
}
// Draw Bounds
Structure.prototype.drawBounds = function (ctx = this.ctx) {
    if(!ctx) {
        throw(': No context found for Structure Bounds');
        return;
    }

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
    let infoDisplay = this.name && this.name !== 'N/A' ? this.name : 'Obj';
    console.log(infoDisplay + infoDisplay1, this);
}

// ------------------------ Circle ------------------------

function Circle(x, y, ctx, init = {}) {
    this.hasDirection = !!init.hasDirection;
    Structure.call(this, x, y, ctx, init);
}
Circle.prototype = new Structure;

Circle.prototype.zoom = function () {
    ctx.translate(100, 300);
    ctx.scale(2, 2);
    ctx.translate(-100, -300);
}

// Draw
Circle.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) {
        throw(': No context found for Structure');
        return;
    }
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // this.zoom();

    // Image
    if(this.img) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        this.img.drawImage(new Vector2(0, 0), new Vector2(this.r*2, this.r*2));
    // Simple Color
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2, false);
        if(this.hasDirection) { ctx.lineTo(0, 0); }
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = this.lineWidth;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    
    ctx.restore();
    
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
    
}

// ------------------------ Square ------------------------

function Square(x, y, ctx, init = {}) {
    Structure.call(this, x, y, ctx, init);
}
Square.prototype = new Structure;

// Draw
Square.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) {
        throw(': No context found for Structure');
        return;
    }
    
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Image
    if(this.img) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        this.img.drawImage(new Vector2(this.x, this.y), new Vector2(this.r*2, this.r*2));
    // Simple Color
    } else {    
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        ctx.beginPath();
        ctx.rect( -this.r / 2, -this.r / 2, this.r, this.r);
        ctx.closePath();
        ctx.fill();
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
    ctx.restore();
    
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
    
}

// ------------------------ Rectangle ------------------------
// Arguments:
// init: { width , height }
function Rectangle(x, y, ctx, init = {}) {
    this.width = this.width = init.width ? init.width : 10;
    this.height = this.height = init.height ? init.height : 10;
    Structure.call(this, x, y, ctx, init);
}
Rectangle.prototype = new Structure;

// Draw
Rectangle.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) {
        throw(': No context found for Structure');
        return;
    }
    
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Image
    if(this.img) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        this.img.drawImage(new Vector2(this.x, this.y), new Vector2(this.r*2, this.r*2));
    // Simple Color
    } else {    
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        ctx.beginPath();
        ctx.rect( -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.closePath();
        ctx.fill();
        if (this.lineWidth > 0) {
            ctx.stroke();
        }
    }
    ctx.restore();
    
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
    
}

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
Triangle.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) {
        throw(': No context found for Structure');
        return;
    }
    
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Image
    if(this.img) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        this.img.drawImage(new Vector2(this.x, this.y), new Vector2(this.r*2, this.r*2));
    // Simple Color
    } else {      
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        ctx.fillStyle = this.fillColor;
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
    }
    ctx.restore();
    
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
}

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
Polygon.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    if(!ctx) {
        throw(': No context found for Structure');
        return;
    }
    
    ctx.save();

    // Transforms
    if(customTransf) {
        ctx.translate(customTransf.x, customTransf.y);
        ctx.rotate(customTransf.angle);
    }
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Image
    if(this.img) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        this.img.drawImage(new Vector2(this.x, this.y), new Vector2(this.r*2, this.r*2));
    // Simple Color
    } else {      
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        ctx.fillStyle = this.fillColor;
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
    }
    ctx.restore();
    
    // Draw Bound
    if(this.isSelected) {
        this.drawBounds();
    }
}

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
Composed.prototype.draw = function (ctx = this.ctx, customTransf = {}) {
    // Loop All objects
    Object.keys(this.primitives).forEach( (key) => {
        // console.log('key: ', key, this.name);
        // Draw
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx ? this.primitives[key].draw(ctx) : this.primitives[key].draw(undefined);
        ctx.restore();
    });
}

