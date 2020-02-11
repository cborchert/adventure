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
    floorSolid: "assets/sprites/floors/solid.png",
    floorDeath: "assets/sprites/floors/death.png"
  },
  gravity: 1
};

export default constants;
