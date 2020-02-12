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

  // prepare for animation
  let adventurerVelocityY = 0;

  // allow jumps and double jumps
  let adventurerJumping = false;
  let adventurerDoubleJumping = false;
  canvasEl.addEventListener("click", () => {
    if (adventurerDoubleJumping) return;
    if (adventurerJumping || adventurerVelocityY > 0) {
      adventurerDoubleJumping = true;
    }
    adventurerVelocityY = -12;
  });

  // each block moves slowly to the left
  let speed = 1 / 12;

  let animationFrame;
  const gameLoop = () => {
    animationFrame = requestAnimationFrame(gameLoop);

    // the number of pixels to displace everything to the left
    const dX = blockSize * scale * speed;

    // remove unused blocks
    worldContainer.children.forEach(worldSprite => {
      if (worldSprite.x < -1 * blockSize * scale) {
        // worldContainer.removeChild(worldSprite);
        worldSprite.destroy();
      }
    });

    let currentBottom = adventurer.y;
    let nextBottom = currentBottom + adventurerVelocityY + gravity;
    const nextTop = nextBottom - adventurer.height;
    // const nextCenter = adventurer.x + 0.5 * adventurer.width + dX;
    const nextCenter = adventurer.x + 0.5 * adventurer.width;
    const nextLeft = nextCenter - 0.5 * blockSize * scale;
    const nextRight = nextCenter + 0.5 * blockSize * scale;
    // unless otherwise noted, the adventurer is falling
    let adventurerFalls = true;
    // check collisions and their effects
    worldContainer.children.forEach(sprite => {
      const spriteLeft = sprite.x;
      const spriteRight = spriteLeft + sprite.width;

      // Filter out blocks not in the same column as our adventurer
      const collidesX = nextRight >= spriteLeft && nextLeft <= spriteRight;
      if (!collidesX) return;

      // if next Y falls inside the adventurer's bounding box falls inside this bounding box, it's a collision
      const spriteTop = sprite.y - sprite.height;
      const spriteBottom = sprite.y;

      // Filter out blocks that aren't on the same row as our adventurer
      // check whether the next position slightly overlaps with the adventurer
      const collidesY = nextTop <= spriteBottom && nextBottom >= spriteTop;
      // the adventurer is dropping through the top of a sprite
      // this will be used for checking the platform drops
      const droppingThrough =
        currentBottom <= spriteTop && nextBottom >= spriteTop;

      if (!collidesY && !droppingThrough) return;

      // the sprite's names
      const aliases = sprite._texture.textureCacheIds;

      // deal with the collisions that prevent you from falling
      const isSolid =
        aliases.includes("floorSolid") || aliases.includes("floorDeath");
      // only stop adventurer from falling through solid blocks; they can jump through the bottom
      if (isSolid && droppingThrough) {
        // stop his velocity when we'll calculate gravity
        adventurerFalls = false;
        // don't move him
        nextBottom = spriteTop;
      }

      // deal with damage
      const isDamage = aliases.includes("floorDeath");
      if (isDamage && collidesY) {
        //
      }

      // remove one time sprites; items, for example
      const destroySprite = false;
      if (destroySprite) {
        sprite.destroy();
      }
    });

    // MOVE adventurer
    // add gravity to velocity
    if (adventurerFalls) {
      adventurerVelocityY = adventurerVelocityY + gravity;
    } else {
      adventurerVelocityY = 0;
      adventurerJumping = false;
      adventurerDoubleJumping = false;
    }
    // calculate the new Y position
    adventurer.y = nextBottom;
    // TODO: adventurer dies from falling
    if (adventurer.y - adventurer.height > SCENE.height) {
      cancelAnimationFrame(animationFrame);
    }

    // background moves slower than foreground to give a parallax effect
    background.tilePosition.x -= dX / 4;
    // move each block
    worldContainer.children.forEach(worldSprite => {
      worldSprite.x -= dX;
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
