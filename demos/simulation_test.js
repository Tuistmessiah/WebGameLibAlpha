// ------------ VARS ------------
// Canvas
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    CWidth = canvas.width,
    CHeight = canvas.height,
    mouse = utils.captureMouse(canvas);
// Resources

// Engines
var engine = new DynamicEngine2D(false);
// Scenes
var scenes = new SceneManager({currentScene: 'Scene1'}),
    scene1 = new Scene('Scene1', ctx, {gridStyle: 'normal'});
// Objects
var circleA = null;
// Controls
var controlScenes = new Controller(window);
// Composed Example

// Custom Variables
let background = null;

// ------------ INITIALIZE ------------
initialize = function () {
  console.log('Initialize!');

  // ----- Load Images

  // ----- Objects

  // ----- Engines

  // ? Tests
  controlScenes.addKeyFunction('p', 'keydown', printSomething, null, null);
}

// ------------ DRAW ------------
function drawFrame() {
    animRequest = window.requestAnimationFrame(function() {
    drawFrame();
  }, canvas);
  ctx.clearRect(0, 0, CWidth, CHeight);

  // ----- Draw

}

// ------------ FUNCTIONS ------------


// ------------ CONTROLS ------------
// ? Tests
printSomething = (obj) => {
  console.log('Print: ', obj);
};

// ------------ BOOT POINT ------------
initialize();
drawFrame();


