// Arguments:
// isReal (boolean to know if it is a grav simulation)
// init: { gravPull, gravOrient (Vector2),  }
function DynamicEngine2D(isReal, init = {}) {
  // Forces
  this.gravPull = isReal ? (init.gravPull ? init.gravPull : 9.8) : 0;
  this.gravOrient = init.gravOrient ? init.gravOrient : new Vector2(0, 1);
  this.airDrag = init.airDrag ? init.airDrag : 0;
  this.bounceDrag = init.bounceDrag ? init.bounceDrag : 0;

  // Identifier
  this.name = init.name ? init.name : 'none';

  // Physical Dimensions
  this.ownAccel = init.ownAccel ? init.ownAccel : false;

  // Object objList / Collision Groups
  this.objList = {
    collNon: [],
    collAll: []
  };

  // Collision Group Physics
  this.objListPh = { // TODO: %12
    collNon: null,
    collAll: null
  }

  // Boundaries
  if(init.isBounded || init.bLeft || init.bRight || init.bUp || init.bDown) {
    this.bLeft = init.bLeft ? init.bLeft : 0;
    this.bRight = init.bRight ? init.bRight : CWidth;
    this.bUp = init.bUp ? init.bUp : 0;
    this.bDown = init.bDown ? init.bDown : CHeight;
    this.isBounded = true;
  }
}

// Object Management
// Arguments:
// listName: (enum: 'collNon', 'collAll')
DynamicEngine2D.prototype.storeObject = function(obj, listName) {
  if(this.objList[listName] === undefined) { this.objList[listName] = []; }
  this.objList[listName].push(obj);
}
DynamicEngine2D.prototype.storeObjects = function(objList, listName) {
  if(Array.isArray(objList)) { this.objList[listName].push(...objList); }
  else { throw('Error: "DynamicEngine2D" while "storeObjects", not an Array'); }
}
DynamicEngine2D.prototype.reset = function(isHardReset, reset) {
  Object.keys(this.objList).forEach( (key) => {
    this.objList[key].forEach( (obj) => {
      obj.reset(isHardReset, reset);
    })
  });
}
DynamicEngine2D.prototype.resume = function() {
  Object.keys(this.objList).forEach( (key) => {
    this.objList[key].forEach( (obj) => {
      obj.resume();
    })
  });
}
// ? (debugger) Print ALL values
DynamicEngine2D.prototype.print = function(info) {
  let infoDisplay = info ? 'Engine w/ ' + info : 'Engine';
  console.info(infoDisplay, this);
  Object.keys(this.objList).forEach( (key) => {
    this.objList[key].forEach( (obj) => {
      obj.print(info);
    })
  });
}

// Physics Groups Management
// Aruments:
// physicsConfigs: (enum: 'default', '')
/*  Vars: elasticity (0-1), randomFactor (0-1), mass (bool)
  default: 
  elastic: default
  inelastic:
  perfect inelastic:
  magnetic: ?
*/
DynamicEngine2D.prototype.addCollisionPhysics = function(physicsConfigs, listName) { // TODO: Check what physical variables apply %12
  switch(physicsConfigs) {
    case 'default':
      this.objListPh[listName] = { elasticity: 1, randomFactor: 0, mass: false };
      break;
    case 'elastic':
      this.objListPh[listName] = { elasticity: 1, randomFactor: 0, mass: true };
      break;
    case 'inelastic80':
      this.objListPh[listName] = { elasticity: 0.8, randomFactor: 0.2, mass: true };
      break;
    default:
      this.objListPh[listName] = physicsConfigs;
      break;
  }
}
// Update one Object
DynamicEngine2D.prototype.updateObjCoords = function(obj, ax, ay) {
  if(obj.primitives) {
    Object.keys(obj.primitives).forEach( (key) => {
      this.updateObjCoords(obj.primitives[key], ax, ay);
    }); 
  }
  if(obj.name === 'die2') {
    // console.log(obj);
    // console.log(obj.vy);
  }
  // Update Speed
  obj.vx += ax + obj.ax;
  obj.vy += ay + obj.ay;

  //Update Position
  if(obj.vx != 0 && obj.vy != 0) {
    obj.x += obj.vx * Math.cos(Math.PI/4);
    obj.y += obj.vy * Math.sin(Math.PI/4);
  } else {
    obj.x += obj.vx;
    obj.y += obj.vy;
  }
  obj.angle += obj.vr * Math.PI / 180;

  // Bounded Condition
  if(this.isBounded) {
    let dispX = obj.r ? obj.r : obj.width;
    let dispY = obj.r ? obj.r : obj.height;
    
    if(obj.x - dispX < this.bLeft)  { obj.x = this.bLeft  + dispX; obj.vx = 0; }
    if(obj.x + dispX > this.bRight) { obj.x = this.bRight - dispX; obj.vx = 0; }
    if(obj.y - dispY < this.bUp)    { obj.y = this.bUp    + dispY; obj.vy = 0; }
    if(obj.y + dispY > this.bDown)  { obj.y = this.bDown  - dispY; obj.vy = 0; }
  }
}
// Draw ALL
DynamicEngine2D.prototype.drawAll = function(ctx) {
  // Loop All objects
  Object.keys(this.objList).forEach( (key) => {
    this.objList[key].forEach( (obj) => {
      // Draw
      ctx ? obj.draw(ctx) : obj.draw(undefined);
    })
  });
}
// Update and Draw ALL
DynamicEngine2D.prototype.updateAllCoordsAndDraw = function(isAnimated = true, ctx, andDraw = true) {
  let ax = 0,
      ay = 0;

  // Gravity
  if(this.gravPull) {
    let transfAngle = Math.atan(this.gravOrient.y / this.gravOrient.x);
    ax += this.gravPull * Math.cos(transfAngle);
    ay += this.gravPull * Math.sin(transfAngle);
  }

  // Other Forces
  // (...)

  // Loop All objects & Collision Group
  Object.keys(this.objList).forEach( (key) => {
    this.objList[key].forEach( (obj) => {
      // Update Coords
      if(isAnimated) this.updateObjCoords(obj, ax, ay);

      // Check Collision
      this.applyCollision(key, obj);

      // Draw
      if(andDraw) {
        ctx ? obj.draw(ctx) : obj.draw(undefined);
      }
    })
  });
}
// Check Collisions with Exterior Obj
// Apply func
DynamicEngine2D.prototype.checkCollExt = function (obj, groupName, func, values, thisCtx = this) {
  this.objList[groupName].map(objLocal => {
    // Objects Intersect
    if(this.circle2Intersect(objLocal, obj)) {
      func(obj, values, objLocal, thisCtx);
    }
  });
}
// Return obj
DynamicEngine2D.prototype.ifCollExt = function (obj, groupName) {
  return this.objList[groupName].find(objLocal => this.circle2Intersect(objLocal, obj) );
}
DynamicEngine2D.prototype.ifCollExtCustomR = function (obj, groupName, customR) {
  return this.objList[groupName].find(objLocal => this.circle2Intersect(objLocal, {x:obj.x, y:obj.y, r:customR}) );
}

// TODO: Solve this collisions mess!

DynamicEngine2D.prototype.calcV = function(vx, vy) {
  return Math.sqrt( Math.pow(vx, 2) + Math.pow(vy, 2) );
}

DynamicEngine2D.prototype.changeCoords = function(x, y, theta) {
  let magnitude = this.calcV(x, y);
  let newX = magnitude * Math.cos(theta);
  let newY = magnitude * Math.sin(theta);
  return { x: newX, y: newY };
}

DynamicEngine2D.prototype.calcVtp = function(obj, obj2) {
  let v1 = this.calcV(obj.vx, obj.vy);
  let alpha = Math.atan(obj.vy / obj.vx);
  if(obj.vx < 0) { alpha += Math.PI; }
  
  let delta = Math.atan( (obj.y - obj2.y) / (obj.x - obj2.x) );
  
  if(obj2.y < obj.y) { delta += Math.PI; }
  let theta = alpha - delta;

  // let v1 = this.calcV(obj.vx, obj.vy);
  // let alpha = this.getTrigAngle(obj.vx, obj.vy);
  // let delta = Math.atan( (obj2.y - obj.y) / (obj2.x - obj.x) );
  // if(obj2.y < obj.y) { delta += Math.PI; }
  // // let delta = this.getTrigAngle( (obj.y - obj2.y), (obj.x - obj2.x) );
  // let delta = Math.atan( (obj2.y - obj.y) / (obj2.x - obj.x) );
  // if(obj2.y < obj.y) { delta += Math.PI; }
  // let theta = alpha - delta;

  return {
    t: v1 * Math.cos(theta),
    p: v1 * Math.sin(theta)
  };
}

DynamicEngine2D.prototype.getTrigAngle = function(x, y) {
  let beta = Math.atan(y / x);
  if(x < 0) { beta += Math.PI; }
  return beta;
}

// TODO: Real Collisions
DynamicEngine2D.prototype.calcCollisionResult = function(obj, obj2) {
  // Calculate 'v' in tangent and perp. coords
  
  let v1tp = this.calcVtp(obj, obj2);
  let v2tp = this.calcVtp(obj2, obj);

  // Mass calculation
  // TODO: different cases %12
  let m1 = obj.r;
  let m2 = obj2.r;
  // Calculate final tangential speeds
  // TODO: These are defaulted calculations to 'Elastic' %12
  let v1tFinal = (m1-m2) / (m1+m2) * v1tp.t + 2*m2 / (m1+m2) * v2tp.t;
  let v2tFinal = (m2-m1) / (m1+m2) * v2tp.t + 2*m1 / (m1+m2) * v1tp.t; 
  let v1Ftp = {
    t: v1tFinal,
    p: v1tp.p
  };
  let v2Ftp = {
    t: v2tFinal,
    p: v2tp.p
  };

  // Transfer to XY coordinates
  let beta = this.getTrigAngle(v1Ftp.t, v1Ftp.p);
  beta += this.getTrigAngle( (obj.y - obj2.y), (obj.x - obj2.x) );
  let v1 = this.calcV(obj.vx, obj.vy);
  let v1F = {
    x: v1 * Math.cos(beta),
    y: v1 * Math.sin(beta)
  };
  beta = this.getTrigAngle(v2Ftp.t, v2Ftp.p);
  beta += this.getTrigAngle( (obj2.y - obj.y), (obj2.x - obj.x) );
  let v2 = this.calcV(obj2.vx, obj2.vy);
  let v2F = {
    x: v2 * Math.cos(beta),
    y: v2 * Math.sin(beta)
  };

  return {
    v1F: v1F,
    v2F: v2F
  };
}

// Apply collision of obj in group 'key'
DynamicEngine2D.prototype.applyCollision = function(key, obj) {
  // Check Collision
  if(key !== 'collNon') {
    this.objList[key].forEach( (obj2) => {
      if(obj !== obj2 && this.circle2Intersect(obj, obj2)) { // TODO: %12
        // Collided
        // let angleBetween = Math.atan(Math.abs(obj.y - obj2.y) / Math.abs(obj.x - obj2.x));
        // let v1tp= this.changeCoords(obj.vx, obj.vy, angleBetween);
        // // // let vObj = this.calcV(obj.vx, obj.vy);
        // // // let v1p = vObj * Math.sin(angleBetween);
        // // // let v1t = vObj * Math.cos(angleBetween);
        // let v2tp = this.changeCoords(obj2.vx, obj2.vy, angleBetween);
        // // // let vObj2 = this.calcV(obj2.vx, obj2.vy);
        // // // let v2p = vObj2 * Math.sin(angleBetween);
        // // // let v2t = vObj2 * Math.cos(angleBetween);
        // // Mass calculation
        // // TODO: different cases %12
        // let m1 = obj.r;
        // let m2 = obj2.r;
        // // Calculate final tangential speeds
        // // TODO: These are defaulted calculations to 'Elastic' %12
        // let v1tFinal = (m1-m2) / (m1+m2) * v1tp.x + 2*m2 / (m1+m2) * v2tp.x;
        // let v2tFinal = (m2-m1) / (m1+m2) * v2tp.x + 2*m1 / (m1+m2) * v1tp.x;
        // // Turn v1 Final and v2 Final into x and y coordinates
        // let alpha = Math.atan(Math.abs(v1tp.y) / Math.abs(v1tFinal));
        // let v1Final = this.changeCoords(v1tFinal, v1tp.y, angleBetween + alpha);
        // alpha = Math.atan(Math.abs(v2tp.y) / Math.abs(v2tFinal));
        // let v2Final = this.changeCoords(v2tFinal, v2tp.y, angleBetween + alpha);

        // let vF = this.calcCollisionResult(obj, obj2);
        // let elast = this.objListPh[key] ? ( this.objListPh[key].elasticity ): 1;
        // let randomF = this.objListPh[key] ? Math.random() * this.objListPh[key].randomFactor: 0;
        // obj.vx = vF.v1F.x;
        // obj.vy = vF.v1F.y;
        // obj2.vx = vF.v2F.x;
        // obj2.vy = vF.v2F.y;

        let objTemp = { vx: obj.vx, vy: obj.vy };
        let elast = this.objListPh[key] ? ( this.objListPh[key].elasticity ): 1;
        let randomF = this.objListPh[key] ? Math.random() * this.objListPh[key].randomFactor: 0;
        obj.vx = obj2.vx * (elast + randomF);
        obj.vy = obj2.vy * (elast + randomF);
        obj2.vx = objTemp.vx * (elast + randomF);
        obj2.vy = objTemp.vy * (elast + randomF);
      }
    });
  }
}

// Collision Calculator
// Arguments:
// intersectType: (enum: 'sph', 'rect')
// listName: (name of collision group, e.g: 'collAll')
// TODO: Make a function that searchs a CollisionGroup for a collision with a given external object %13
DynamicEngine2D.prototype.detectExternalCollisions = function(intersectType, listName) {

  // Loop a Collision Group
  this.objList[key].forEach( (obj, index) => {
    // TODO: Incomplete %13
    // Spherical Collision
    if(type === 'sph') {

      // Rectangular Collision
      } else if (type === 'rect'){
    
      } else {
        throw('Error in "type", in "detectCollisions", "DynamicEngine2D", not enumerated value!');
      }
    });
}

// Circle Intersections
DynamicEngine2D.prototype.circle2Intersect = function (circleA, circleB) {
  let d = Math.sqrt( Math.pow(circleA.x - circleB.x, 2) + Math.pow(circleA.y - circleB.y, 2));
  return (d < circleA.r + circleB.r);
};
DynamicEngine2D.prototype.circlePointIntersect = function (circle, point) {
  let d = Math.sqrt( Math.pow(circle.x - point.x, 2) + Math.pow(circle.y - point.y, 2));
  return (d < circle.r);
};
// Rectangular Intersections
// DynamicEngine2D.prototype.circleRectIntersect = function (circle, rectangle) {
//   // clamp(value, min, max) - limits value to the range min..max

//   // Find the closest point to the circle within the rectangle
//   let closestX = this.clamp(circle.x, rectangle.Left, rectangle.Right);
//   let closestY = this.clamp(circle.y, rectangle.Top, rectangle.Bottom);

//   // Calculate the distance between the circle's center and this closest point
//   let distanceX = circle.X - closestX;
//   let distanceY = circle.Y - closestY;

//   // If the distance is less than the circle's radius, an intersection occurs
//   let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
//   return distanceSquared < (circle.Radius * circle.Radius);
// };

DynamicEngine2D.prototype.clamp  = function (val, min, max) {
  return Math.min(Math.max(min, val), max);
}


