import PIXISOUND from "pixi-sound";

export default sounds => {
  Object.entries(sounds).forEach(([key, sound]) => {
    // On preload tout
    PIXISOUND.sound.add(key, { url: sound, preload: true });
  });
  return PIXISOUND;
};
