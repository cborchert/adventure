import * as PIXI from "pixi.js-legacy";
import constants from "./constants";
import Adventurer from "./components/Adventurer";
import Background from "./components/Background";
import BoxText from "./components/BoxText.js";
import Sound from "./components/Sounds.js";
import { loadPixiAssets, generatePlatformSlice } from "./utils";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(registration => {
        console.log("SW registered: ", registration);
      })
      .catch(registrationError => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const initGame = async () => {
  const { SCENE, assets, blockSize, scale, gravity, sounds } = constants;

  const PIXISOUND = Sound(sounds);

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

  // load sprites into the pixi shared loader for use
  await loadPixiAssets(assets);

  // add the backgrounds to the container
  const bgContainer = new PIXI.Container();
  const background = Background();
  const backgroundNight = Background(true);
  let sunSetting = true;
  backgroundNight.alpha = 0;
  bgContainer.addChild(background);
  bgContainer.addChild(backgroundNight);
  stage.addChild(bgContainer);

  // add the adventurer to the container
  const container = new PIXI.Container();
  const { adventurer, setAnimation: setAdventurerAnimation } = Adventurer(
    "idle"
  );
  container.addChild(adventurer);
  stage.addChild(container);

  // add platforms to the world
  let worldContainer = new PIXI.Container();
  stage.addChild(worldContainer);

  // add the helper text to the screen
  const helperContainer = new PIXI.Container();
  const logo = PIXI.Sprite.from("assets/sprites/game/title.png");
  logo.anchor.set(0.5);
  logo.x = SCENE.width / 2;
  logo.y = 120;
  helperContainer.addChild(logo);
  const boxText = BoxText(
    500,
    200,
    "Le monde est en danger ! \r\nEvite les avocats & les hamburgers pour survivre \r\n(ps: ne cours pas sur les plaques rouges\r\ntu risques de te faire très très mal)\r\n\r\nVas-tu réussir à sauver le monde ? "
  );
  helperContainer.addChild(boxText);

  // prepare for animation
  let adventurerVelocityY = 0;

  let gameIsStarted = false;

  let lastDownTarget = null;

  let loseBox = BoxText(450, 100, "");
  loseBox.alpha = 0;
  helperContainer.addChild(loseBox);

  // allow jumps and double jumps
  let adventurerJumping,
    adventurerDoubleJumping,
    adventurerAlive,
    loopCount,
    isWhaleWolf,
    isWhaleWolfFor,
    difficulty,
    speed,
    score;

  let scoreText = new PIXI.Text("", {
    fontFamily: "Futura, Comic Sans MS",
    dropShadow: true,
    fontWeight: "bold",
    fontSize: 36,
    fill: 0xffffff,
    align: "center"
  });
  helperContainer.addChild(scoreText);
  stage.addChild(helperContainer);

  renderer.render(stage);
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

    // reset the fact the the helper container always shows on front
    // hacky as fuck. there's probably a z-index prop somewhere...
    stage.removeChild(helperContainer);
    stage.addChild(helperContainer);
    PIXISOUND.sound.stop("death");
    PIXISOUND.sound.play("main", { loop: true, volume: 0.5 });

    loopCount = 0;
    difficulty = 0;
    speed = 1 / 10;
    adventurerAlive = true;
    adventurerJumping = false;
    adventurerDoubleJumping = false;
    isWhaleWolf = false;
    isWhaleWolfFor = 0;
    adventurer.animationSpeed = 0.1;
    score = 0;
    adventurer.y = SCENE.height - blockSize * scale;

    const worldSprites = [
      ...generatePlatformSlice({
        xOffset: 0 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      }),
      ...generatePlatformSlice({
        xOffset: 4 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      }),
      ...generatePlatformSlice({
        xOffset: 8 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      }),
      ...generatePlatformSlice({
        xOffset: 12 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      }),
      ...generatePlatformSlice({
        xOffset: 16 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      }),
      ...generatePlatformSlice({
        xOffset: 20 * blockSize * scale,
        platformConfiguration: [1, 0, 0],
        itemTypes: [undefined]
      })
    ];
    worldSprites.forEach(sprite => worldContainer.addChild(sprite));
  };

  const toggleAdventurerIdle = isGameStopped => {
    if (isGameStopped) {
      setAdventurerAnimation("idle", isWhaleWolf);
    } else {
      setAdventurerAnimation("running", isWhaleWolf);
    }
  };

  const jump = () => {
    if (isWhaleWolf) {
      adventurerVelocityY = -5;
      adventurerJumping = true;
      return;
    }
    if (adventurerDoubleJumping) return;
    // TODO: Think about disabling the double jump if you're already falling?
    // adventurerJumping || adventurerVelocityY > 0
    if (adventurerJumping) {
      // switch model to double jump
      adventurerDoubleJumping = true;
      adventurerVelocityY = -13;
      PIXISOUND.sound.play("double-jump");
      setAdventurerAnimation("flipping", isWhaleWolf);
    } else {
      // switch model to jump
      PIXISOUND.sound.play("simple-jump");
      adventurerVelocityY = -9;
      setAdventurerAnimation("jumpingUp", isWhaleWolf);
    }
    adventurerJumping = true;
  };

  const clickHandler = () => {
    if (gameIsStarted) {
      if (adventurerAlive) {
        jump();
      } else {
        loseBox.alpha = 0;
        reset();
        toggleAdventurerIdle(false);
      }
    } else {
      boxText.alpha = 0;
      logo.alpha = 0;
      gameIsStarted = true;
      toggleAdventurerIdle(false);
    }
  };
  canvasEl.addEventListener("touchstart", e => {
    lastDownTarget = e.target;
    clickHandler();
  });
  canvasEl.addEventListener("click", e => {
    lastDownTarget = e.target;
    clickHandler();
  });
  /* We're fucked, we can't focus first canvas and canvas seems not working with key up and key down :/
  So I stock last dom focus and setting keyUp on Document dom, check if Canvas is focuses, if true jump :D  
  */
  document.addEventListener(
    "keyup",
    e => {
      if (lastDownTarget == canvasEl) {
        if (e.keyCode === 32) {
          clickHandler();
        }
      }
    },
    true
  );

  let animationFrame;
  // init the game
  reset();

  const showLoseMessage = score => {
    let message;
    if (score < 100) {
      message = "🌂";
    } else if (score < 1000) {
      message = "Oh no, you were our last hope";
    } else if (score < 5000) {
      message = "Future generations will appreciate your work";
    } else if (score < 10000) {
      message = "Excellent! You've saved the planet";
    } else {
      message = "Woah, Eric is very proud of you !";
    }

    loseBox.children[0].text =
      "You lose...\r\n" + message + "\r\n Your score is: " + score;
    loseBox.alpha = 1;
  };

  const gameLoop = () => {
    animationFrame = requestAnimationFrame(gameLoop);
    if (!adventurerAlive || !gameIsStarted) return;

    // Day/night cycle
    if (loopCount % 20 === 0) {
      backgroundNight.alpha += sunSetting ? 0.01 : -0.01;
      if (backgroundNight.alpha >= 1) {
        backgroundNight.alpha = 1;
        sunSetting = false;
      } else if (backgroundNight.alpha <= 0) {
        backgroundNight.alpha = 0;
        sunSetting = true;
      }
    }

    // Speed up the loop every 200 repetitions
    if (loopCount && loopCount % 200 === 0) {
      difficulty += 1;
      if (speed < 0.5) {
        speed += 1 / 64;
      }
      if (adventurer.animationSpeed < 0.25) {
        adventurer.animationSpeed += 0.005;
      }
    }
    loopCount += 1;

    if (isWhaleWolfFor >= 1) {
      isWhaleWolfFor--;
      if (isWhaleWolfFor <= 0) {
        // flip out of whale wolf
        PIXISOUND.sound.stop("whale");
        PIXISOUND.sound.play("main", { loop: true, volume: 0.5 });
        isWhaleWolf = false;
        isWhaleWolfFor >= 0;
        adventurerJumping = false;
        adventurerDoubleJumping = false;
        adventurerVelocityY = -24;
        setAdventurerAnimation("flipping");
      }
    }
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
        let dontPlaySound = false;
        if (aliases.includes("floorDeath")) {
          dontPlaySound = true;
          damage = 10;
        }
        if (aliases.includes("item-hamburger")) damage = 200;
        if (aliases.includes("item-avocado")) damage = 100;
        if (aliases.includes("item-shrimp")) damage = 10;

        //TODO: Special effect visual
        if (!isWhaleWolf) {
          score -= damage;
        }

        // deal with bonuses
        let bonus = 0;
        if (aliases.includes("item-water")) {
          bonus = 100;
        }
        if (aliases.includes("item-recycle")) bonus = 200;
        if (aliases.includes("item-shrimp") && isWhaleWolf) bonus = 20;
        if (aliases.includes("item-pimento")) {
          PIXISOUND.sound.play("pimento");
          speed = (speed * 3) / 4;
          if (speed < 1 / 20) {
            speed = 1 / 20;
          }
          adventurer.animationSpeed = (adventurer.animationSpeed * 5) / 6;
          if (adventurer.animationSpeed < 0.1) {
            adventurer.animationSpeed = 0.1;
          }
          bonus = 1000;
        }
        if (aliases.includes("item-renault")) {
          speed = speed * 1.5;
          if (speed > 2) {
            speed = 2;
          }
          adventurer.animationSpeed = adventurer.animationSpeed * 1.1;
          if (adventurer.animationSpeed > 2) {
            adventurer.animationSpeed = 2;
          }
          bonus = score;
        }
        if (aliases.includes("item-moon")) {
          PIXISOUND.sound.stop("main");
          PIXISOUND.sound.play("whale", { loop: true, volume: 0.5 });
          speed = 0.1;
          adventurer.animationSpeed = 0.1;
          bonus = 1000;
          isWhaleWolf = true;
          isWhaleWolfFor = 1000;
          setAdventurerAnimation("swimming");
        }

        if (!dontPlaySound) {
          if (bonus > 0) PIXISOUND.sound.play("good");
          if (damage > 0) PIXISOUND.sound.play("bad");
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
          "item-renault",
          "item-moon",
          "item-shrimp"
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
    const prevAdventurerVelocityY = adventurerVelocityY;
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
      PIXISOUND.sound.stop("main");
      adventurerAlive = false;
      toggleAdventurerIdle(true);
      PIXISOUND.sound.play("death");
      showLoseMessage(score);
    }

    // Handle changing animation
    if (adventurerVelocityY === 0 && prevAdventurerVelocityY !== 0) {
      // started running
      setAdventurerAnimation("running", isWhaleWolf);
    } else if (adventurerVelocityY > 0 && prevAdventurerVelocityY <= 0) {
      // started falling
      setAdventurerAnimation("falling", isWhaleWolf);
    }

    // move each block
    worldContainer.children.forEach(worldSprite => {
      worldSprite.x -= dX;
    });

    // add more blocks if necessary
    const rightMostSprite =
      worldContainer.children[worldContainer.children.length - 1];
    if (rightMostSprite.x < SCENE.width + blockSize * scale * 4) {
      const worldSprites = generatePlatformSlice({
        xOffset: rightMostSprite.x + blockSize * scale,
        isWhaleWolf
      });
      worldSprites.forEach(sprite => worldContainer.addChild(sprite));
    }
  };

  gameLoop();
};

initGame();
