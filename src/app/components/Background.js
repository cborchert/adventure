import * as PIXI from "pixi.js";
import constants from "../constants";

export default () => {
  const { SCENE } = constants;
  const { texture } = PIXI.Loader.shared.resources["backgroundDay"];
  const { width, height } = texture;
  const sprite = new PIXI.TilingSprite(texture, width, height);
  sprite.x = sprite.y = 0;
  sprite.tilePosition.x = sprite.tilePosition.y;
  sprite.scale.x = sprite.scale.y = SCENE.height / height;
  sprite.width = SCENE.width;
  return sprite;
};
