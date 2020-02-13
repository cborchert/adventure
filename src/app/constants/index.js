const constants = {
  SCENE: {
    width: 800,
    height: 640
  },
  scale: 3,
  blockSize: 16,
  assets: {
    // The path "assets" here has been copied by webpack, no need for a relative path
    adventurer: "assets/sprites/adventurer/adventurer.json",
    backgroundDay: "assets/sprites/backgrounds/background-day.png",
    backgroundNight: "assets/sprites/backgrounds/background-night.png",
    mainTitle: "assets/sprites/game/title.png",
    floorSolid: "assets/sprites/floors/solid.png",
    floorDeath: "assets/sprites/floors/death.png",
    "item-avocado": "assets/sprites/items/avocado.png",
    "item-hamburger": "assets/sprites/items/hamburger.png",
    "item-moon": "assets/sprites/items/moon.png",
    "item-recycle": "assets/sprites/items/recycle.png",
    "item-sun": "assets/sprites/items/sun.png",
    "item-water": "assets/sprites/items/water.png",
    "item-pimento": "assets/sprites/items/pimento.png",
    "item-renault": "assets/sprites/items/renault.png"
  },
  gravity: 0.4
};

export default constants;
