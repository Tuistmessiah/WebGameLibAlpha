// ------------------------ Spawner ------------------------
function Spawner(init) {
    this.name = init.name ? init.name : 'spawner-default';

    // Position & Speeds
    this.spawnRect = {
        x: init.x ? init.x : 0,
        y: init.y ? init.y : -20,
        width: init.width ? init.width : CWidth,
        height: init.height ? init.height : 10,
    };
    if(init.isAngleRand) { this.angle = null; } 
    else { this.angle = init.angle ? init.angle : Math.PI/2; }

    // Dynamic
    this.isSpeedRand = !!init.isSpeedRand; // ! Deprecated
    this.isSpeedRandX = !!init.isSpeedRandX;
    this.isSpeedRandY = !!init.isSpeedRandY;
    this.speedConfigs = {
        x: init.vxP !== undefined ? init.vxP : 0,
        y: init.vyP !== undefined ? init.vyP : 1,
        v: init.speed ? init.speed : 1,
    };

    // Spawn Conditions
    this.bLeft = init.bLeft ? init.bLeft : -10;
    this.bRight = init.bRight ? init.bRight : CWidth + 10;
    this.bUp = init.bUp ? init.bUp : -30;
    this.bDown = init.bDown ? init.bDown : CHeight + 10;
    this.prob = init.prob ? init.prob : 50;
    this.respawnType = init.respawnType ? respawnType : 'normal'; // Enum: 'normal', 'timed', 'toggle', 'none'
    if(this.respawnType === 'normal') {
        this.inField = 0;
        this.maxInField = init.maxInField ? init.maxInField : 10;
    }
    this.refreshRate = init.refreshRate ? init.refreshRate : 1000;

    // Objects
    this.objects = [];

    // Flags
    if(init.isReady !== undefined) {
        this.fScore = init.fScore ? init.fScore : 10;
        this.cScore = 0;
        this.isReady = !!init.isReady
    };
}
// Attach Objects 
Spawner.prototype.attachObjs = function (newObjects) {
    newObjects.map(obj => {
        obj.resetCoords();
        obj.endDisplay()
    });
    this.objects.push(...newObjects);
}
Spawner.prototype.attachObj = function (newObject) {
    newObject.resetCoords();
    newObject.endDisplay();
    this.objects.push(newObject);
}
// Reset Obj Coords
Spawner.prototype.resetObjs = function () {
    this.objects.map(obj => {
        obj.resetCoords({x: this.bLeft - 1, y: this.bUp - 1});
        obj.endDisplay()
    });
}
// Check for Despawn
Spawner.prototype.checkAllElim = function () {
    // Win Condition
    if(this.isReady !== undefined && this.cScore >= this.fScore) { this.isReady = true }
    // Check if outside
    this.objects.map( (obj) => {
        // Despawn
        if(this.check(obj.x, obj.y)) {
            this.despawn(obj);
            // obj.resetCoords();
            // obj.endDisplay();
            // this.inField--;
            // // Case: score when object despawns
            // if(this.isReady !== undefined && this.respawnType === 'none') { this.cScore++; }
        }
    });
}
// Despawn
Spawner.prototype.despawn = function (obj, reset = {}) {
    obj.resetCoords(reset);
    obj.endDisplay();
    this.inField--;
    // Case: score when object despawns
    if(this.isReady !== undefined && this.respawnType === 'none') { this.cScore++; }
}
// Spawning Coords
Spawner.prototype.spawnCoords = function (obj) {
    obj.x = Math.random() * this.spawnRect.width + this.spawnRect.x;
    obj.y = Math.random() * this.spawnRect.height + this.spawnRect.y;
    obj.angle = this.angle ? this.angle : Math.random() * 2*Math.PI;
    let speedContrX = this.isSpeedRandX ? Math.random() * 2 - 1 : 1;
    let speedContrY = this.isSpeedRandY ? Math.random() * 2 - 1 : 1;
    obj.vx = this.speedConfigs.x * this.speedConfigs.v * speedContrX;
    obj.vy = this.speedConfigs.y * this.speedConfigs.v * speedContrY;
}
// Check to Respawn
Spawner.prototype.respawn = function () {
    switch(this.respawnType) {
        case 'normal':
            if(this.inField < this.maxInField) {
                let chance = Math.random() * 100 + 1;
                // Check spawn prob
                if(chance > this.prob) {
                    let activateObj = this.objects.find( (obj) => !(obj.isActive) );
                    if(activateObj) {
                        // Spawn
                        activateObj.isActive = true;
                        activateObj.startDisplay();
                        this.spawnCoords(activateObj);
                        this.inField++;
                    }
                }
            }
            break;
        case 'timed':

            break;
        case 'toggle':

            break; 
        case 'none':
            
            break; 
        default:
            console.error('No valid respawnType given!');
    }

    this.checkAllElim();
}
// Check Boudaries
Spawner.prototype.check = function (x, y) {
    return (x < this.bLeft || x > this.bRight || y < this.bUp || y > this.bDown);
}