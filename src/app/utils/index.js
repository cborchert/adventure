import * as PIXI from "pixi.js";
import constants from "../constants";

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

/**
 * Parses json exported from Tiled.
 * Level data comes as a 1-dimensional array. However, we need to establish things like tile's position in 2d world.
 * Later, we will also need to know if a tile has neighbours. Therefore, let's transform it into 2d array.
 *
 * Once all required data is calculated, flatten array back into 1d and filter all blank tiles.
 *
 * @param rawTiles json file exported from Tiled
 */
export const createLevel = rawTiles => {
  const array2d = Array.from({ length: rawTiles.height }).map((_, i) =>
    rawTiles.layers[0].data.slice(i * rawTiles.width, (i + 1) * rawTiles.width)
  );
  return array2d
    .map((row, i) => {
      return row.map((tileId, j) => ({
        id: `${i}_${j}`,
        tileId,
        x: rawTiles.tilewidth * j,
        y: rawTiles.tileheight * i
      }));
    })
    .reduce((acc, row) => row.concat(acc), [])
    .filter(tile => tile.tileId !== 0);
};

/**
 * Creates platform tiles.
 */
export const generatePlatformSlice = (
  xOffset,
  platformConfiguration,
  floorTypes
) => {
  const { SCENE, blockSize, scale } = constants;
  floorTypes = floorTypes || [
    undefined,
    PIXI.Loader.shared.resources["floorSolid"],
    PIXI.Loader.shared.resources["floorDeath"],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    PIXI.Loader.shared.resources["floorSolid"],
    PIXI.Loader.shared.resources["floorSolid"],
    PIXI.Loader.shared.resources["floorSolid"],
    PIXI.Loader.shared.resources["floorSolid"]
  ];
  platformConfiguration = platformConfiguration || [
    Math.floor(Math.random() * floorTypes.length),
    Math.floor(Math.random() * floorTypes.length),
    Math.floor(Math.random() * floorTypes.length)
  ];

  const sprites = [];
  platformConfiguration.forEach((floorType, level) => {
    const floorResource = floorTypes[floorType];
    if (floorResource) {
      const y = SCENE.height - level * 5 * blockSize * scale;
      for (let x = 0; x < 4; x++) {
        const sprite = new PIXI.Sprite(floorResource.texture);
        sprite.anchor.set(0, 1);
        sprite.y = y;
        sprite.x = x * blockSize * scale + xOffset;
        sprite.scale.x = sprite.scale.y = scale;
        sprites.push(sprite);
      }
    }
  });
  return sprites;
};

export const hitTest = (r1, r2) => {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
