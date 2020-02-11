import * as PIXI from "pixi.js";
import constants from "./constants";
import Adventurer from "./components/Adventurer";
import Background from "./components/Background";
import { loadPixiAssets, generatePlatformSlice, hitTest } from "./utils";

const initGame = async () => {
  const { SCENE, assets, blockSize, scale, gravity } = constants;

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

  let animationFrame;

  let adventurerVelocityY = 0;

  // each block moves slowly to the left
  let speed = 1 / 16;
  const gameLoop = () => {
    animationFrame = requestAnimationFrame(gameLoop);

    // let nextBottom = adventurer.y + adventurerVelocityY + gravity;
    // const nextTop = nextBottom - adventurer.height * adventurer.scale.y;
    // const nextXCenter =
    //   adventurer.x + (adventurer.width / 2) * adventurer.scale.x;

    // console.log(adventurer);
    // // check if the player falls
    // // yeah I know I should use a reduce here
    // const collidesWith = worldContainer.children.filter(sprite => {
    //   const spriteWidth = sprite.width * sprite.scale.x;
    //   const spriteLeft = sprite.x;
    //   const spriteRight = spriteLeft + spriteWidth;
    //   // only get blocks on the same column as our user
    //   const collidesX = nextXCenter < spriteRight && nextXCenter > spriteLeft;
    //   if (!collidesX) return false;

    //   // if next Y falls inside the user's bounding box falls inside this bounding box, it's a collision
    //   const spriteTop = sprite.y;
    //   const spriteBottom = spriteTop + sprite.height;
    //   return (
    //     (nextBottom <= spriteTop && nextBottom >= spriteTop) ||
    //     (nextTop <= spriteTop && nextTop >= spriteTop)
    //   );
    // });

    // let userStopped = false;
    // collidesWith.forEach(sprite => {
    //   console.log(sprite);
    //   // if it's not a safe block => damage
    //   // if the user is jumping (velocity < 0)
    //   if (adventurerVelocityY < 0) {
    //     // do nothing
    //   } else {
    //     // if the user is falling
    //     // if the block is solid
    //     // stop his velocity
    //     // userStopped = true;
    //     // nextY =
    //   }
    //   // place him on the platform
    // });
    let nextBottom = adventurer.y + adventurerVelocityY + gravity;
    const nextTop = nextBottom - adventurer.height;
    const nextXCenter = adventurer.x + adventurer.width / 2;

    // check if the player collides
    // yeah I know I should use a reduce here
    const collidesWith = worldContainer.children.filter(sprite => {
      const spriteWidth = sprite.width;
      const spriteLeft = sprite.x;
      const spriteRight = spriteLeft + spriteWidth;
      // only get blocks on the same column as our user
      const collidesX = nextXCenter < spriteRight && nextXCenter > spriteLeft;
      if (!collidesX) return false;

      // if next Y falls inside the user's bounding box falls inside this bounding box, it's a collision
      const spriteTop = sprite.y - sprite.height;
      const spriteBottom = spriteTop;
      return nextTop <= spriteBottom && nextBottom >= spriteTop;
    });

    // if they collides, check the side effects
    let userStopped = false;
    let userTakesDamage = false;
    collidesWith.forEach(sprite => {
      const aliases = sprite._texture.textureCacheIds;
      const isSolid =
        aliases.includes("floorSolid") || aliases.includes("floorDeath");
      const isDamage = aliases.includes("floorDeath");
      // if it's not a safe block => damage
      if (isDamage) {
        userTakesDamage = true;
      }
      // if the user is jumping (velocity < 0)
      if (adventurerVelocityY < 0) {
        // do nothing -- the user can pass though
      } else {
        // the user is falling
        // if the block is solid
        if (isSolid) {
          // stop his velocity
          userStopped = true;
          // place him on the platform
          nextBottom = sprite.y - sprite.height;
        }
      }
    });

    // add gravity to velocity
    if (userStopped) {
      adventurerVelocityY = userStopped ? 0 : adventurerVelocityY + gravity;
    }
    adventurer.y = nextBottom;

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
