import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export const FEDERKIEL_GUILD_ID = 'gwynthor-federkiel';
export const FEDERKIEL_GUILD_EMBLEM = '../Fraktionen/assets/emblems/gilden/federkiel-v2.webp';
export const FEDERKIEL_ART = './assets/federkiel-gwynthor';
export const FEDERKIEL_SIGN = `${FEDERKIEL_ART}/aushangeschild-v1.webp`;

export const FEDERKIEL_SECTION = Object.freeze({
  key: 'Gilde Federkiel - Gwynthor',
  tab: 'Völker & Kulturen',
  path: Object.freeze([...GWYNTHOR_CITY_PATH, 'Gilde Federkiel - Gwynthor']),
  iconUrl: FEDERKIEL_SIGN,
  desc: 'Gwynthors Zentralpost, Schreibstube, Druckerei, Kuriergestüt und Postlager.'
});

export const federkielModuleId = place => `${FEDERKIEL_GUILD_ID}-${place}`;
export const federkielModuleLink = id => `./AleriaAlmanach.html?entry=${encodeURIComponent(id)}`;
export const federkielSceneImage = key => `${FEDERKIEL_ART}/scenes/${key}-v1.webp`;

export function federkielIllustration(key, imagePosition = 'center') {
  return { image: federkielSceneImage(key), imageWidth: 36, imageTall: true, imageFit: 'cover', imagePosition };
}
