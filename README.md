### Run

- Just a .html local file to open. Simple examples in 'demos'. Change the script in the index.html for one of the other examples (under the 'Simulations' commentary).

### Why?

- Simple project to learn WebGaming at a low level using ES5. No documentation, parts of code still incomplete and many features to add.

### Documentation:

- 'controller.js': adds addEventListeners for game controls in a more practical way. Also has some default controls;
- 'dynamicEngine2D.js': store game objects in an instance of this kind to simulate movement and physics. These engines can be configured to have gravity or any other effects (incomplete);
- 'objects.js': Basic classes (JS prototypes) to build basic shapes. Also objects composed of many shapes are possible (new Compose);
- 'sceneManager.js': Allows to create Scene and attach engines and objects to it. This way, just by calling one method 'updateScene' will automatically draw every object/engine objects attach to it;

### Demo Instructions:

- duckHunter.js: Use mouse to hunt down ducks.
- tRex.js: Use 'space' bar to jump over obstacles. You can double jump.
- simulation.js: Press 'WASD' and move mouse to control Tank. Use '1' and '2' to switch scenes. In Scene 2, you can pan and zoom with mouse click and wheel;

### Version:

- WebGameLib2.1_package
- Compatible with ES5/ES6 and any modern browser
