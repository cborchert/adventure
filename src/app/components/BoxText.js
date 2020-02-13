import * as PIXI from "pixi.js-legacy";
import constants from "../constants";

export default (boxWidth, boxHeight, text) => {
  const { SCENE } = constants;
  const centerX = SCENE.width / 2 - boxWidth / 2;
  const centerY = SCENE.height / 2 - boxHeight / 2;
  const graphics = new PIXI.Graphics();

  graphics.beginFill(0x000000, 0.8);
  graphics.drawRect(centerX, centerY, boxWidth, boxHeight);
  graphics.endFill();

  const basicText = new PIXI.Text(text, {
    fontFamily: "Futura",
    fontSize: 20,
    fill: 0xffffff
  });
  basicText.x = centerX + 10;
  basicText.y = centerY + 10;

  graphics.zIndex = 2000;

  graphics.addChild(basicText);

  return graphics;
};
