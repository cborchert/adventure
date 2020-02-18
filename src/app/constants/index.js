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
    whalewolf: "assets/sprites/whalewolf/whalewolf.json",
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
    "item-renault": "assets/sprites/items/renault.png",
    "item-shrimp": "assets/sprites/items/shrimp.png"
  },
  sounds: {
    "simple-jump": "assets/sounds/simple-jump.mp3",
    "double-jump": "assets/sounds/double-jump.mp3",
    death: "assets/sounds/death.mp3",
    good: "assets/sounds/good.mp3",
    bad: "assets/sounds/bad.mp3",
    main: "assets/sounds/loop.mp3",
    whale: "assets/sounds/whale.mp3",
    pimento: "assets/sounds/pimento.mp3"
  },
  gravity: 0.4
};

export default constants;
