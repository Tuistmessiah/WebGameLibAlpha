// ------------ VARS ------------
// Canvas
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    CWidth = canvas.width,
    CHeight = canvas.height,
    mouse = utils.captureMouse(canvas),
    game = {};
// Engines
var engine = new DynamicEngine2D(false);
// Spawners
var spawner = 
    new Spawner({
        isSpeedRandX: true,
        vxP: 8,
        vyP: -12,
        x: 200,
        y: 700,
        width: CWidth - 400,
        height: 1,
    });
// Scenes
var scenes = new SceneManager(),
    menuScene = new Scene('Menu', ctx);
    scene1 = new Scene('Scene1', ctx);
// Controls
var controlScenes = new Controller(window);
// JSON structures

// Custom Variables
var gameWon = false,
    munitions = 10,
    timeElapsed = 0,
    score = 0;

// ------------ Intervals/Callbacks ------------
var iCB = {
  '1000': {callback: [], interval: null},   // 1 sec
  '5000': {callback: [], interval: null},   // 5 secs
  '20000': {callback: [], interval: null},  // 20 secs
  '60000': {callback: [], interval: null},  // 1 min
  '300000': {callback: [], interval: null}, // 5 mins
  /* Args:
    obj: CB context
    fName: CB name as a string
    timeMili: time in miliseconds
  */
  insert: function(obj, fName, timeMili) {
    this[timeMili].callback.push({obj: obj, fName: fName});
  },
  clear: function(obj, fName, timeMili) {
    this[timeMili].callback.forEach((cb, i) => {
      if(cb.obj.name === obj.name && cb.fName === fName) {
        this[timeMili].callback.splice(i, 1);
      }
    });
  }
};

// ------------ INITIALIZE ------------
initialize = function () {
  console.info('Initialize!');

  // ----- Set Intervals
  Object.keys(iCB).forEach( (key) => {
    let timeMili = parseInt(key);
    if(key[0] === 'i' || key[0] === 'c') { return; } // ! Meter aqui logica melhor, talvez fazer do interval uma classe
    iCB[key].interval = setInterval( () => {
      iCB[key].callback.map( callb => callb.obj[callb.fName]() )
    }, timeMili);
  });

  // ----- Load Images
  let menu_bg = this.loadImage('assets/duckShooter/Background.png');
  let menu_title = this.loadImage('assets/duckShooter/Title.png');
  let menu_singleP = this.loadImage('assets/duckShooter/Single.png');
  let game_backB = this.loadImage('assets/duckShooter/Back.png');
  let game_Cursor = this.loadImage('assets/duckShooter/Cursor.png');
  let game_bg = this.loadImage('assets/duckShooter/BackgroundGame.png');
  let game_duckFly = this.loadImage('assets/duckShooter/Duck_Flying.png');
  let game_duckDie = this.loadImage('assets/duckShooter/Die.png');
  let game_duckDie2 = this.loadImage('assets/duckShooter/Falling.png');
  // ----- Objects
  // Menu
  let menuBG = new ImageObj(CWidth/2, CHeight/2, ctx, {img: menu_bg});
  let menuTitle = new ImageObj(CWidth/4, CHeight/4, ctx, {img: menu_title});
  let menuSingleP = new ImageObj(CWidth*(5/8), CHeight/3, ctx, {img: menu_singleP});
  // Game
  let gameBG = new ImageObj(CWidth/2, CHeight/2 + 100, ctx, {img: game_bg});
  let gameCursor = new ImageObj(CWidth*(1/2), CHeight*(1/2), ctx, {img: game_Cursor});
  let duckDie = new ImageObj(CWidth*(1/2), CHeight*(1/2), ctx, {img: game_duckDie, isActive: false, name: 'die'});
  let duckDie2 = new SpriteObj(CWidth*(1/2), CHeight*(1/2), ctx, {img: game_duckDie2, numberOfFrames: 2, isActive: false, vy: 2, name: 'die2'});
  let duck = [];
  duck.push(
        new SpriteObj(0, 0, ctx, {img: game_duckFly, numberOfFrames: 3, name: 'SpriteDuck1'}),
        // new SpriteObj(0, 0, ctx, {img: game_duckFly, numberOfFrames: 3, name: 'SpriteDuck2'}),
        // new SpriteObj(0, 0, ctx, {img: game_duckFly, numberOfFrames: 3, name: 'SpriteDuck3'}),
    );
  let gameBackB = new ImageObj(CWidth*(15/16), CHeight*(15/16), ctx, {img: game_backB});
  // ----- Engines
  engine.storeObjects(duck, 'collNon');
  engine.storeObject(gameCursor, 'player');
  engine.storeObject(duckDie, 'animations');
  engine.storeObject(duckDie2, 'animations');
  // ----- Spawners
  spawner.attachObjs(duck);
  // ----- Scenes
  menuScene.attachObjs([menuBG, menuTitle, menuSingleP]);
  menuScene.cameraType('lock', {x: CWidth/2, y: CHeight/2});
  scene1.attachObjs([gameBG, gameBackB]);
  scene1.attachEngines([engine]);
  scene1.cameraType('lock', {x: CWidth/2, y: CHeight/2});
  scene1.attachSpawnerAndInt(spawner);
  // ----- Scene Manager
  scenes.addScene(scene1);
  scenes.addScene(menuScene);
  scenes.changeScene('Menu');
  // ----- Controller
  // Menu Buttons
  let menuSinglePSize = {w: 263, h: 38}; // ! Had to check manually
  controlScenes.addMouseFunction(
    {x:menuSingleP.x-menuSinglePSize.w/2, y:menuSingleP.y-menuSinglePSize.h/2, width:menuSinglePSize.w, height: menuSinglePSize.h}, 
    'click', changeScene, scenes, 'Scene1', this
  );
  // Target
  controlScenes.addMouseFunction({x:0, y:0, width:CWidth, height:CHeight}, 'mousemove', moveTarget, gameCursor, null, this);
  controlScenes.addMouseFunction({x:0, y:0, width:CWidth, height:CHeight}, 'mousedown', fireWeapon, 
                      {gameCursor: gameCursor, spawner: spawner}, {duckDie: duckDie, duckDie2: duckDie2}, this);
  // Back Button
  let gameBackBSize = {w: 93, h: 42}; // ! Had to check manually
  controlScenes.addMouseFunction(
    {x:gameBackB.x-gameBackBSize.w/2, y:gameBackB.y-gameBackBSize.h/2, width:gameBackBSize.w, height:gameBackBSize.h}, 
    'click', changeScene, scenes, 'Menu', this
  );

  // ? Tests
  controlScenes.addKeyFunction('p', 'keydown', printSomething, null, null);
  // ----- Custom Changes
  iCB.insert(this, 'elapsedTime', 1000);
}

// ------------ DRAW ------------
function drawFrame() {
    animRequest = window.requestAnimationFrame(function() {
    drawFrame();
  }, canvas);
  ctx.clearRect(0, 0, CWidth, CHeight);

  // ----- Check Collisions

  // ----- Draw
  scenes.updateCurrentScene();

  // ----- Custom

  // ----- Messages
  if(scenes.currentScene === 'Scene1') {
    ctx.font = "25px Arial";
    ctx.fillText('Munition: ' + munitions, CWidth*(14/16), CHeight*(1/16));
    !gameWon ? ctx.fillText('Time: ' + (20 - timeElapsed), CWidth*(14/16), CHeight*(2/16)) : null;
    ctx.fillText('Score: ' + (score), CWidth*(1/16), CHeight*(1/16));
  }
  if(gameWon) {
    ctx.font = '30px Arial';
    ctx.fillText(gameWon, CWidth/2 - 150, CHeight/2 - 50);
    score >= 5 ? ctx.fillText('+ (time score): ' + (20 - timeElapsed), CWidth*(1/16), CHeight*(2/16)) : null;
  }

}

// ------------ FUNCTIONS ------------
// Player
var endGame = () => {
  gameWon = score >= 5 ? 'You Win! Good for you!' : 'You Lose! Loooooooser!';
  scene1.isAnimated = false;
};
// Score
var elapsedTime = () => {
  if(!gameWon) {
    timeElapsed++;
    if(timeElapsed >= 20) { timeElapsed = 20; }
  }
};

var loadImage = function(src) {
  let newImage = new Image();
  newImage.src = src;
  return newImage;
}

// ------------ CONTROLS ------------
// Move Target
var changeScene = (target, values) => {
  if(gameWon) {
    gameWon = false;
    munitions = 10;
    timeElapsed = 0;
    score = 0;
  }
  scene1.isAnimated = true;
  if(target.currentScene.name !== values) {
    target.changeScene(values);
  }
};
// Move Target{x: obj.x, y: obj.y}
var moveTarget = (target) => {
    target.x = mouse.x;
    target.y = mouse.y;
};
// Fire Weapon
var fireWeapon = (target, values) => {
  if(gameWon) { return; }

  // Collide Effect
  let collidedWith = engine.ifCollExtCustomR(target.gameCursor, 'collNon', 10);
  if(collidedWith) { // TODO: Dar um 'r' mais realista as imagens e sprites, ou calcular colisoes de outra forma!
    score++;
    let x = collidedWith.x;
    let y = collidedWith.y;
    // Start Duck Die
    values.duckDie.isActive = true;
    values.duckDie.x = x;
    values.duckDie.y = y
    values.duckDie2.isActive = false;
    values.duckDie2.x = x;
    values.duckDie2.y = y;
    // Eliminate Flying Duck
    target.spawner.despawn(collidedWith, {x: -10, y: -10});
    setTimeout(() => {
      // Start Falling Duck
      values.duckDie.isActive = false;
      values.duckDie2.isActive = true;
      setTimeout(() => {
        // End falling Duck
        if(values.duckDie2.y > CHeight) { values.duckDie2.isActive = false; }
      }, 8000);
    }, 1000);
  }
  // Status updates
  munitions--;
  if(munitions < 0) { munitions = 0; }
  if(munitions == 0 || score == 5 || (20 - timeElapsed) <= 0) { this.endGame(); }
};
// ? Tests
printSomething = (obj) => {
  console.info('Print: ', obj);
};

// ------------ BOOT POINT ------------
initialize();
drawFrame();


