import * as PIXI from "pixi.js";
import constants from "./constants";
import Adventurer from "./components/Adventurer";
import Background from "./components/Background";
import { loadPixiAssets } from "./utils";

const initGame = async () => {
  const { SCENE, assets } = constants;

  // retain pixilation
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  // init the game using the canvas and correct width and height
  const canvasEl = document.querySelector("#game");

  canvasEl.height = SCENE.height;
  canvasEl.width = SCENE.width;
  const { stage, renderer } = new PIXI.Application({
    view: canvasEl,
    antialias: false,
    ...SCENE
  });
  const container = new PIXI.Container();

  // load sprites into the pixi shared loader
  await loadPixiAssets(assets);
  const adventurer = Adventurer();
  const background = Background();

  container.addChild(background);
  container.addChild(adventurer);
  stage.addChild(container);
  renderer.render(stage);

  const gameLoop = () => {
    requestAnimationFrame(gameLoop);
    background.tilePosition.x -= 1;
  };

  gameLoop();
};

initGame();
