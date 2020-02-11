import * as PIXI from "pixi.js";

export default () => {
  // for the static fello
  // const sprite = new PIXI.Sprite(
  //   PIXI.Loader.shared.resources["adventurer"].texture
  // );
  // sprite.x = sprite.y = 0;
  // sprite.scale.x = sprite.scale.y = 2;
  // return sprite;
  const resource = PIXI.Loader.shared.resources["adventurer"];
  console.log(resource);
  const sprite = new PIXI.AnimatedSprite(resource.spritesheet.animations.idle);
  sprite.x = sprite.y = 0;
  sprite.scale.x = sprite.scale.y = 2;
  sprite.play();
  sprite.animationSpeed(0.1);
  return sprite;
};
