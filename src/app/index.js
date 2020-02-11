import * as PIXI from "pixi.js";

const SCENE = {
  width: 1280,
  height: 640
};

const initGame = () => {
  // init the game using the canvas and correct width and height
  const canvasEl = document.querySelector("#game");
  console.log(canvasEl);
  canvasEl.height = SCENE.height;
  canvasEl.width = SCENE.width;
  const pixiApp = new PIXI.Application({ view: canvasEl, ...SCENE });
  const container = new PIXI.Container();

  pixiApp.stage.addChild(container);
  pixiApp.renderer.render(pixiApp.stage);
};

initGame();
