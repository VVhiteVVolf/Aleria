const PORTRAIT_ROOT = 'assets/images/portraits/haus-annwyl';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'willard-annwyl',
  'cennyn-annwyl',
  'glyndwr-annwyl',
  'elgan-annwyl',
  'elowen-annwyl',
  'eurig-annwyl',
  'esyllt-annwyl',
  'emyr-annwyl',
  'wilff-annwyl',
  'harri-annwyl',
  'luned-annwyl'
]);

export const HOUSE_ANNWYL_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ]))
);
