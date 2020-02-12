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
  floorTypes,
  itemTypes,
  maxNumItems = 4
) => {
  const { SCENE, blockSize, scale } = constants;
  const resource = name => PIXI.Loader.shared.resources[name] || undefined;
  floorTypes = floorTypes || [
    undefined,
    "floorSolid",
    "floorDeath",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "floorSolid",
    "floorSolid",
    "floorSolid",
    "floorSolid"
  ];

  itemTypes = itemTypes || [
    ...Array(400).fill(undefined),
    ...Array(13).fill("item-avocado"),
    ...Array(9).fill("item-hamburger"),
    ...Array(6).fill("item-recycle"),
    ...Array(5).fill("item-water"),
    ...Array(2).fill("item-pimento")
  ];
  platformConfiguration = platformConfiguration || [
    Math.floor(Math.random() * floorTypes.length),
    Math.floor(Math.random() * floorTypes.length),
    Math.floor(Math.random() * floorTypes.length)
  ];

  const sprites = [];
  platformConfiguration.forEach((floorType, level) => {
    const floorResource =
      floorTypes[floorType] && resource(floorTypes[floorType]);
    if (floorResource) {
      const y = SCENE.height - level * 5 * blockSize * scale;
      for (let x = 0; x < 4; x++) {
        if (floorResource) {
          const sprite = new PIXI.Sprite(floorResource.texture);
          sprite.anchor.set(0, 1);
          sprite.y = y;
          sprite.x = x * blockSize * scale + xOffset;
          sprite.scale.x = sprite.scale.y = scale;
          sprites.push(sprite);
        }
      }
    }
  });
  for (let i = 0; i < maxNumItems; i++) {
    const level = Math.floor(Math.random() * 3);
    const x = Math.floor(Math.random() * 4);
    const y = SCENE.height - level * 5 * blockSize * scale;
    const itemType = Math.floor(Math.random() * itemTypes.length);
    const itemResource = itemTypes[itemType] && resource(itemTypes[itemType]);
    if (itemResource) {
      const sprite = new PIXI.Sprite(itemResource.texture);
      sprite.anchor.set(0, 1);
      sprite.y = y - blockSize * scale;
      sprite.x = x * blockSize * scale + xOffset;
      sprite.width = sprite.height = blockSize * scale;
      sprites.push(sprite);
    }
  }
  return sprites;
};
