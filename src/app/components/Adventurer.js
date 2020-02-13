import * as PIXI from "pixi.js";
import constants from "../constants/";

export default (animationKey = "running") => {
  const { SCENE, scale, blockSize } = constants;
  const resource = PIXI.Loader.shared.resources["adventurer"];
  const sprite = new PIXI.AnimatedSprite(
    resource.spritesheet.animations[animationKey]
  );
  sprite.anchor.set(0, 1);
  sprite.x = 0;
  sprite.y = SCENE.height - blockSize * scale;
  sprite.scale.x = sprite.scale.y = scale;
  sprite.play();
  sprite.animationSpeed = 0.1;

  const setAnimation = (animationKey, isWhaleWolf) => {
    // add whalewolf swimming animation 🐋🐺
    if (isWhaleWolf) animationKey = "swimming";
    const currentResource =
      animationKey === "swimming"
        ? PIXI.Loader.shared.resources["whalewolf"]
        : PIXI.Loader.shared.resources["adventurer"];
    const currentTextures =
      currentResource.spritesheet.animations[animationKey];

    if (sprite.textures !== currentTextures) {
      sprite.textures = currentTextures;
      sprite.play();
    }
  };

  return { adventurer: sprite, setAnimation };
};
