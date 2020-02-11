import * as PIXI from "pixi.js";

/**
 * Load the given assets into PIXI's shared loader
 * @param {object} assets
 */
export const loadPixiAssets = assets => {
  return new Promise(resolve => {
    Object.entries(assets).forEach(([key, asset]) => {
      PIXI.Loader.shared.add(key, asset);
    });
    PIXI.Loader.shared.load(resolve);
  });
};
