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
  let worldContainer = new PIXI.Container();

  stage.addChild(container);
  stage.addChild(worldContainer);
  renderer.render(stage);

  // prepare for animation
  let adventurerVelocityY = 0;

  // allow jumps and double jumps
  let adventurerJumping,
    adventurerDoubleJumping,
    adventurerAlive,
    loopCount,
    difficulty,
    speed,
    score;

  let scoreText = new PIXI.Text("Toto", {
    fontFamily: "Courier",
    dropShadow: true,
    fontWeight: "bold",
    fontSize: 36,
    fill: 0xffffff,
    align: "center"
  });
  stage.addChild(scoreText);

  const reset = () => {
    // remove all the previous tiles and repopulate
    stage.removeChild(worldContainer);
    worldContainer.destroy();
    worldContainer = new PIXI.Container();
    stage.addChild(worldContainer);
    worldContainer.children.forEach(sprite => {
      sprite.destroy();
      worldContainer.removeChild(sprite);
    });

    loopCount = 0;
    difficulty = 0;
    speed = 1 / 10;
    adventurerAlive = true;
    adventurerJumping = false;
    adventurerDoubleJumping = false;
    adventurer.animationSpeed = 0.1;
    score = 0;
    adventurer.y = SCENE.height - blockSize * scale;

    const worldSprites = [
      ...generatePlatformSlice(0 * blockSize * scale, [1, 0, 0]),
      ...generatePlatformSlice(4 * blockSize * scale, [1, 0, 0]),
      ...generatePlatformSlice(8 * blockSize * scale, [1, 0, 0]),
      ...generatePlatformSlice(12 * blockSize * scale, [1, 0, 0]),
      ...generatePlatformSlice(16 * blockSize * scale, [1, 0, 0]),
      ...generatePlatformSlice(20 * blockSize * scale, [1, 0, 0])
    ];
    worldSprites.forEach(sprite => worldContainer.addChild(sprite));
  };

  const jump = () => {
    if (adventurerDoubleJumping) return;
    // TODO: Think about disabling the double jump if you're already falling?
    // adventurerJumping || adventurerVelocityY > 0
    if (adventurerJumping) {
      adventurerDoubleJumping = true;
      adventurerVelocityY = -13;
    } else {
      adventurerVelocityY = -9;
    }
    adventurerJumping = true;
  };

  const clickHandler = () => {
    if (adventurerAlive) {
      jump();
    } else {
      reset();
    }
  };
  canvasEl.addEventListener("touchstart", clickHandler);
  canvasEl.addEventListener("click", clickHandler);

  let animationFrame;
  // init the game
  reset();

  const gameLoop = () => {
    animationFrame = requestAnimationFrame(gameLoop);
    if (!adventurerAlive) return;

    // Speed up the loop every 200 repetitions
    if (loopCount >= 200) {
      loopCount = 0;
      difficulty += 1;
      if (speed < 0.5) {
        speed += 1 / 64;
      }
      if (adventurer.animationSpeed < 0.25) {
        adventurer.animationSpeed += 0.005;
      }
    }
    loopCount += 1;
    score++;

    // the number of pixels to displace everything to the left
    const dX = blockSize * scale * speed;

    // remove unused blocks
    worldContainer.children.forEach(worldSprite => {
      if (worldSprite.x < -1 * blockSize * scale) {
        worldSprite.destroy();
        worldContainer.removeChild(worldSprite);
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

      if (collidesY) {
        // deal with damage
        let damage = 0;
        if (aliases.includes("floorDeath")) damage = 10;
        if (aliases.includes("item-hamburger")) damage = 200;
        if (aliases.includes("item-avocado")) damage = 100;

        //TODO: Special effect visual
        score -= damage;

        // deal with bonuses
        let bonus = 0;
        if (aliases.includes("item-water")) bonus = 100;
        if (aliases.includes("item-recycle")) bonus = 200;
        if (aliases.includes("item-pimento")) {
          speed = (speed * 3) / 4;
          adventurer.animationSpeed = (adventurer.animationSpeed * 5) / 6;
          bonus = 1000;
        }
        if (aliases.includes("item-renault")) {
          speed = speed * 1.5;
          adventurer.animationSpeed = adventurer.animationSpeed * 1.1;
          bonus = score;
        }

        //TODO: Special effect visual
        score += bonus;
      }

      // remove one-time sprites; items, for example
      const destroySprite = aliases.some(a =>
        [
          "item-avocado",
          "item-hamburger",
          "item-pimento",
          "item-recycle",
          "item-water",
          "item-renault"
        ].includes(a)
      );
      if (destroySprite) {
        worldContainer.removeChild(sprite);
        sprite.destroy();
      }
    });

    // update score text
    scoreText.text = score;

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
    // adventurer dies from falling
    if (adventurer.y - adventurer.height > SCENE.height || score < 0) {
      adventurerAlive = false;
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
