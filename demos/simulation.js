// ------------ VARS ------------
// Canvas
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    CWidth = canvas.width,
    CHeight = canvas.height,
    mouse = utils.captureMouse(canvas);
// Resources
// (imgs, sound, etc)
// Engines
var engine = new DynamicEngine2D(false),
    engine2 = new DynamicEngine2D(false);
// Scenes
var scenes = new SceneManager({currentScene: 'Scene1'}),
    scene1 = new Scene('Scene1', ctx, {gridStyle: 'normal'}),
    scene2 = new Scene('Scene2', ctx, {gridStyle: 'extended'});
// Objects // ! Remove objects from here
var circleA = null,
    triangleA = null,
    polygonA = null,
    fullTank = null;
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
let background = null;

// ------------ INITIALIZE ------------
initialize = function () {
  console.log('Initialize!');

  // ----- Load Resources
	background = new Image();
	background.src = 'assets/solarSystem/notAvailable.png';

  // ----- Objects
  // --- Tank (Scene1)
  fullTank = new Composed(CWidth / 2, CHeight / 4, ctx, {name: 'fullTank', vx: 1});
  fullTank.parseComposed(fullTankScquematics, ctx);

  // Static objects (Scene2)
  circleA = new Circle(100, 300, ctx, {r:40, fillColor: '#ff0000', lineColor: '#ffffff', hasDirection:true});
  let triangleAInit = {r:20, fillColor:'#00dd00', lineColor:'#5555ff', angle:Math.PI/4, angleConst:Math.PI/4, isShipLike:true};
  triangleA = new Triangle(200, 300, ctx, triangleAInit);
  polygonA = new Polygon(300, 300, ctx, 10, {r:50, angle:Math.PI/10, lineColor: '#000000', hasDirection:true});
  // ----- Engines
  engine.storeObject(fullTank, 'collNon');
  engine2.storeObject(circleA, 'collNon');
  // ----- Scenes
  scene1.attachEngine(engine);
  scene2.attachEngine(engine2);
  // scene1.background.img = background; // !
  scene1.cameraType('lock', fullTank);
  scene2.attachObjs([triangleA, polygonA]);
  // scene2.setBackground(background);
  // scene2.background.img = background; // !
  // ----- Scene Manager
  scenes.addScene(scene1);
  scenes.addScene(scene2);
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
  controlScenes.addKeyFunction('p', 'keydown', printSomething, scene1, scene2);
}

// ------------ DRAW ------------
function drawFrame() {
    animRequest = window.requestAnimationFrame(function() {
    drawFrame();
  }, canvas);
  ctx.clearRect(0, 0, CWidth, CHeight);

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
  console.log('Print1: ', obj);
  console.log('Print2: ', values);
};

// ------------ BOOT POINT ------------
initialize();
drawFrame();


