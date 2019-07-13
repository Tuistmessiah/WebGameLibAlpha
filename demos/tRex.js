// ------------ VARS ------------
// Canvas
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    CWidth = canvas.width,
    CHeight = canvas.height,
    mouse = utils.captureMouse(canvas);
// Resources
var bg = new Image(),
    cactus_normal = new Image(),
    tREx_normal = new Image(),
    bird_spr_fly = new Image(),
    bird_big = new Image(),
    cactus_group = new Image();
// Engines
var engine = new DynamicEngine2D(false);
var engineReal = new DynamicEngine2D(true, {gravPull: 0.8, bDown: 690});
// Spawners
var spawner = new Spawner({
                vxP: -4,
                vyP: 0,
                x: CWidth + 10,
                y: 685,
                width: 1,
                height: 1,
                bRight: CWidth + 30
              }),
  spawner_Birds = new Spawner({
                vxP: -7,
                vyP: 0,
                x: CWidth + 10,
                y: 580,
                width: 1,
                height: 80,
                bRight: CWidth + 30
              });
// Scenes
var scenes = new SceneManager({currentScene: 'Scene1'}),
    scene1 = new Scene('Scene1', ctx);
// Objects
var tRex = null,
    cactusN = null,
    cactusS = null,
    cactusB = null,
    cactusG = null,
    bird = null,
    birdB = null;
// Controls
var controlScenes = new Controller(window);
// JSON structures

// Custom Variables
var gameWon = false,
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
  bg.src = 'assets/tRexGame/tRex_bg.png';
  cactus_normal.src = 'assets/tRexGame/tRex_cactus.png';
  tREx_normal.src = 'assets/tRexGame/tRex_spr_run.png';
  cactus_group.src = 'assets/tRexGame/tRex_trees.png';
  bird_spr_fly.src = 'assets/tRexGame/tRex_bird.png';
  bird_big.src = 'assets/tRexGame/tRex_birdBig.jpeg';
  // ----- Objects
  cactusN = new ImageObj(0, 0, ctx, {img: cactus_normal, isClipped: true, width: 20, name: 'cactusN'});
  cactusS = new ImageObj(0, 0, ctx, {img: cactus_normal, isClipped: true, width: 10, height: 25, name: 'cactusS'});
  cactusB = new ImageObj(0, 0, ctx, {img: cactus_normal, isClipped: true, width: 25, height: 50, name: 'cactusB'});
  cactusG = new ImageObj(0, 0, ctx, {img: cactus_group, isClipped: true, width: 50, height: 60, name: 'cactusG'});
  bird = new SpriteObj(0, 0, ctx, {img: bird_spr_fly, numberOfFrames: 2, width: 120, height: 100, name: 'Bird'});
  birdB = new ImageObj(0, 0, ctx, {img: bird_big, isClipped: true, width: 50, height: 60, name: 'BirdB'});
  tRex = new SpriteObj(100, 650, ctx, {img: tREx_normal, numberOfFrames: 2, name: 'T-Rex'});
  // ----- Engines
  engine.storeObjects([cactusN, cactusS, cactusB, cactusG, bird, birdB], 'collNon');
  engineReal.storeObject(tRex, 'collNon');
  // ----- Spawners
  spawner.attachObjs([cactusN, cactusS, cactusB, cactusG], 'collNon', {});
  spawner_Birds.attachObjs([bird, birdB], 'collNon', {});
  // ----- Scenes
  scene1.attachEngines([engine, engineReal]);
  scene1.setBackground(bg, {x: 0, y: 0, isRepeated: true, dx: -4, dy: 0});
  scene1.cameraType('lock', {x: CWidth/2, y: CHeight/2});
  scene1.attachSpawnerAndInt(spawner);
  scene1.attachSpawnerAndInt(spawner_Birds);
  // ----- Scene Manager
  scenes.addScene(scene1);
  scenes.changeScene('Scene1');
  // ----- Controller
  // Player
  controlScenes.addKeyFunction('space', 'keydown', jump, tRex, -20);
  // ? Tests
  controlScenes.addKeyFunction('p', 'keydown', printSomething, null, null);
  // ----- Custom Changes
  iCB.insert(this, 'scoreF', 1000);
  tRex.isJumping = false;
  tRex.isDJumpAvail = false;
}

// ------------ DRAW ------------
function drawFrame() {
    animRequest = window.requestAnimationFrame(function() {
    drawFrame();
  }, canvas);
  ctx.clearRect(0, 0, CWidth, CHeight);

  // ----- Check Collisions
  engine.checkCollExt(tRex, 'collNon', lose, null, this);

  // ----- Draw
  scenes.updateCurrentScene();

  // ----- Custom
  if(tRex.vy == 0 && tRex.y > 675 ) {
    tRex.isJumping = false;
  }

  // ----- Messages
  if(gameWon) {
    ctx.font = '30px Arial';
    ctx.fillText('You lose... looser!', CWidth/2 - 150, CHeight/2 - 50);
  }
  ctx.font = "15px Arial";
  ctx.fillText('Score: ' + score, CWidth - 150, CHeight - 120);
}

// ------------ FUNCTIONS ------------
// Player
var lose = () => {
  scene1.isAnimated = false;
  gameWon = true;
  iCB.clear(this, 'scoreF', 1000);
};
// Score
var scoreF = () => {
  score++;
};
// ------------ CONTROLS ------------
// Player
jump = (obj, values) => { 
  // Jump
  if(!obj.isJumping) {
    obj.isJumping = true;
    obj.vy = values;
    setTimeout(() => {
      obj.isDJumpAvail = true;
    }, 500);
  };
  // DJump
  if(obj.isDJumpAvail) {
    obj.vy = values;
    obj.isDJumpAvail = false;
  }
};
// ? Tests
printSomething = (obj) => {
  console.info('Print: ', obj);
};

// ------------ BOOT POINT ------------
initialize();
drawFrame();


