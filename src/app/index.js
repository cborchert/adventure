import * as PIXI from "pixi.js";
import constants from "./constants";
import Adventurer from "./components/Adventurer";
import Background from "./components/Background";
import { loadPixiAssets, generatePlatformSlice } from "./utils";

const initGame = async () => {
  const { SCENE, assets, blockSize, scale } = constants;

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

  // load sprites into the pixi shared loader for use
  await loadPixiAssets(assets);

  // add the background to the container
  const background = Background();
  container.addChild(background);

  // add the adventurer to the container
  const adventurer = Adventurer();
  container.addChild(adventurer);

  // add platforms to the world
  const worldContainer = new PIXI.Container();
  const worldSprites = [
    ...generatePlatformSlice(0 * blockSize * scale, [1, 0, 0]),
    ...generatePlatformSlice(4 * blockSize * scale, [1, 0, 0]),
    ...generatePlatformSlice(8 * blockSize * scale, [1, 0, 0]),
    ...generatePlatformSlice(12 * blockSize * scale, [1, 0, 0]),
    ...generatePlatformSlice(16 * blockSize * scale, [1, 0, 0]),
    ...generatePlatformSlice(20 * blockSize * scale, [1, 0, 0])
  ];
  worldSprites.forEach(sprite => worldContainer.addChild(sprite));

  stage.addChild(container);
  stage.addChild(worldContainer);
  renderer.render(stage);

  let iterations = 0;
  let animationFrame;
  // each block moves slowly to the left
  let speed = 1 / 16;
  const gameLoop = () => {
    animationFrame = requestAnimationFrame(gameLoop);
    // background moves slowly to give a
    background.tilePosition.x -= (blockSize * scale * speed) / 4;

    worldContainer.children.forEach(worldSprite => {
      worldSprite.x -= blockSize * scale * speed;
    });
    // remove unused blocks
    worldContainer.children.forEach(worldSprite => {
      if (worldSprite.x < -1 * blockSize * scale) {
        // worldContainer.removeChild(worldSprite);
        worldSprite.destroy();
      }
    });
    // add more blocks if necessary
    const rightMostSprite =
      worldContainer.children[worldContainer.children.length - 1];
    if (rightMostSprite.x < SCENE.width + blockSize * scale * 4) {
      const worldSprites = generatePlatformSlice(
        rightMostSprite.x + blockSize * scale
      );
      worldSprites.forEach(sprite => worldContainer.addChild(sprite));
    }
  };

  gameLoop();
};

initGame();
