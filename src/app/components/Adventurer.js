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
  return sprite;
};
