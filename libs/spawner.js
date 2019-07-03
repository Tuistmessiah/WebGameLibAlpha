// ------------------------ Spawner ------------------------
function Spawner(init) {
    // Position & Speeds
    this.spawnRect = {
        x: init.x ? init.x : 0,
        y = init.y ? init.y : -20,
        width: init.width ? init.width : CWidth,
        height = init.height ? init.height : 10,
    };
    if(init.isAngleRand) { this.angle = null; } 
    else { this.angle = init.angle ? init.angle : 0; }

    // Dynamic
    this.isSpeedRand = !!init.isSpeedRand;
    this.speedConfigs = {
        x: init.vxP ? init.vxP : 1,
        y: init.vyP ? init.vyP : 1,
        v: init.speed ? init.speed : 1,
    };

    // Spawn Conditions
    this.bLeft = init.bLeft ? init.bLeft : null;
    this.bRight = init.bRight ? init.bRight : null;
    this.bUp = init.bUp ? init.bUp : null;
    this.bDown = init.bDown ? init.bDown : null;
    this.prob = init.prob ? init.prob : 50;
    this.probMax = init.probMax ? init.probMax : 50;
}

Spawner.prototype.check = function (x, y) {
    return (x < this.bLeft || x > this.bRight || y < this.bUp || y > this.bDown);
}

Spawner.prototype.check = function (x, y) {
    return (x < this.bLeft || x > this.bRight || y < this.bUp || y > this.bDown);
}

Spawner.prototype.check = function (x, y) {
    return (x < this.bLeft || x > this.bRight || y < this.bUp || y > this.bDown);
}