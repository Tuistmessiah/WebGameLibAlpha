// ------------ VARS ------------
// Canvas
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    CWidth = canvas.width,
    CHeight = canvas.height,
    mouse = utils.captureMouse(canvas);
// Resources
var imgPolygon = new Image(),
    background = new Image(),
    sun = new Image(),
    coinSprite = new Image();
// (imgs, sound, etc)
// Engines
var engine = new DynamicEngine2D(false),
    engine2 = new DynamicEngine2D(false);
// Spawners
var spawner = new Spawner({});
// Scenes
var scenes = new SceneManager(),
    scene1 = new Scene('Scene1', ctx, {gridStyle: 'normal'}),
    scene2 = new Scene('Scene2', ctx, {gridStyle: 'extended'});
// Objects // ! Remove objects from here
var circleA = null,
    circlesB = [],
    triangleA = null,
    polygonA = null,
    fullTank = null,
    imgObjA = null;
// Controls
var controlScenes = new Controller(window);
// Composed Example
var fullTankScquematics = {
  parts: [
    {
      name: 'body',
      obj: new Circle(0, 0, ctx, {r:50, fillColor: '#66bbaa', lineColor: '#115522'})
    },
    {
      name: 'tankGun', 
      parts: [
        {
          name: 'cannon',
          obj: new Rectangle(35, 0, ctx, {width:70, height: 20, fillColor: '#115522', lineColor: '#228877', hasDirection: true})
        },
        {
          name: 'tip',
          obj: new Rectangle(70, 0, ctx, {width:10, height: 35, fillColor: '#115522', lineColor: '#66bbaa'})
        }
      ],
      coords: {
        x: 0,
        y: 0,
        angle: 0
      },
    },
  ]
};
// Custom Variables

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

  // ----- Load Resources
  background.src = 'assets/solarSystem/sky.png';
  imgPolygon.src = 'assets/solarSystem/jap-waves';
  sun.src = 'assets/solarSystem/sun.png';
  coinSprite.src = 'assets/coin-sprite-animation.png';

  // ----- Objects
  // --- Tank (Scene1)
  fullTank = new Composed(CWidth / 2, CHeight / 4, ctx, {name: 'fullTank'});
  fullTank.parseComposed(fullTankScquematics, ctx);
  // --- Objects (Scene2)
  circleA = new Circle(100, 300, ctx, {r:40, fillColor: '#ff0000', lineColor: '#ffffff', hasDirection:true, img: imgPolygon});
  squareA = new Square(0, 100, ctx, {r:40, fillColor: '#ff0045', lineColor: '#ffffff', hasDirection:true, img: imgPolygon});
  rectangleA = new Rectangle(1000, 200, ctx, {r:40, fillColor: '#ff6700', lineColor: '#ffffff', hasDirection:true, img: imgPolygon});
  for(let i = 0; i < 10; i++) {
    circlesB.push(new Circle(200, 400, ctx, {r:30, fillColor: '#55bb77', lineColor: '#ffffff', hasDirection:true}));
  }
  let triangleAInit = {r:20, fillColor:'#00dd00', lineColor:'#5555ff', angle:Math.PI/4, angleConst:Math.PI/4, isShipLike:true , img: imgPolygon};
  triangleA = new Triangle(200, 300, ctx, triangleAInit);
  polygonA = new Polygon(300, 300, ctx, 10, 
              {r:50, angle:Math.PI/10, lineColor: '#000000', hasDirection:true, img: imgPolygon });
  imgObjA = new ImageObj(100, 500, ctx, {img: sun});
  sprObjA = new SpriteObj(100, 600, ctx, {img: coinSprite});

  // ----- Engines
  engine.storeObject(fullTank, 'collNon');
  engine2.storeObject(circleA, 'collNon');
  engine2.storeObjects(circlesB, 'collNon');

  // ----- Spawners
  spawner.attachObjs(circlesB, 'collNon');

  // ----- Scenes
  scene1.attachEngine(engine);
  scene1.cameraType('lock', fullTank);

  scene2.attachSpawnerAndInt(spawner);
  scene2.attachEngine(engine2);
  scene2.attachObjs([triangleA, polygonA, squareA, rectangleA, imgObjA, sprObjA]);
  scene2.setBackground(background, {x: 0, y: 0, isRepeated: true});

  // ----- Scene Manager
  scenes.addScene(scene1);
  scenes.addScene(scene2);
  scenes.changeScene('Scene1');

  // ----- Set Callback

  // ----- Controller
  // Scene
  controlScenes.addKeyFunction('1', 'keydown', changeToScene, scenes, 'Scene1');
  controlScenes.addKeyFunction('2', 'keydown', changeToScene, scenes, 'Scene2');
  controlScenes.addDefaultController('Mouse-pan', scene2, {x:0,y:0, width:CWidth,height:CHeight});
  controlScenes.addDefaultController('Wheel-zoom', scene2, 0.1);
  controlScenes.addDefaultController('Wheel-zoom', scene1, 0.1);
  // Player
  controlScenes.addDefaultController('WASD-strafe', fullTank, 10);
  controlScenes.addDefaultController('Arrows-dir', fullTank, 3);
  controlScenes.addDefaultController('Mouse-look', fullTank, scene1);
  // ? Tests
  controlScenes.addKeyFunction('p', 'keydown', printSomething, sprObjA, scene2);
}

// ------------ DRAW ------------
function drawFrame() {
    animRequest = window.requestAnimationFrame(function() {
    drawFrame();
  }, canvas);
  ctx.clearRect(0, 0, CWidth, CHeight);

  // ----- Tests

  // ----- Draw
  // Can call SceneManager to draw eveything associated
  scenes.updateCurrentScene();
}

// ------------ FUNCTIONS ------------


// ------------ CONTROLS ------------
// Change Scene (1,2,3)
changeToScene = (obj, values) => {
  obj.changeScene(values);
};
// ? Tests
printSomething = (obj, values ) => {
  console.info('Print1: ', obj );
  console.info('Print2: ', values);
};

// ------------ BOOT POINT ------------
initialize();
drawFrame();


