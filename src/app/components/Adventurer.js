import * as PIXI from "pixi.js";
import constants from "../constants/";

export default () => {
  const { SCENE } = constants;
  const resource = PIXI.Loader.shared.resources["adventurer"];
  const sprite = new PIXI.AnimatedSprite(
    resource.spritesheet.animations.running
  );
  sprite.x = 0;
  sprite.y = SCENE.height - sprite.height * 3.5;
  sprite.scale.x = sprite.scale.y = 3;
  sprite.play();
  sprite.animationSpeed = 0.1;
  return sprite;
};
