import PIXISOUND from "pixi-sound";

export default sounds => {
  Object.entries(sounds).forEach(([key, sound]) => {
    PIXISOUND.sound.add(key, sound);
  });
  return PIXISOUND;
};
