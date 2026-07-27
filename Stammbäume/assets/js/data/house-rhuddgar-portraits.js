const PORTRAIT_ROOT = 'assets/images/portraits/haus-rhuddgar';

const PNG_PORTRAIT_IDS = new Set([
  'ithel-der-rote-gwyntog',
  'morgan-trydar'
]);

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'arfon-rhuddgar',
  'arawn-rhuddgar',
  'wyndham-rhuddgar',
  'drudwas-rhuddgar',
  'ithel-der-rote-gwyntog',
  'cadwallon-rhuddgar',
  'meuric-rhuddgar',
  'dolena-rhuddgar',
  'oth-rhuddgar',
  'ylva',
  'morgan-trydar',
  'telyn',
  'lewys-rhuddgar',
  'gower-rhuddgar',
  'haul-rhuddgar',
  'caderyn-rhuddgar',
  'serenna-rhuddgar',
  'tathal-rhuddgar',
  'frewi-rhuddgar',
  'meggan-selog',
  'tilda',
  'miraeth-caerlaen',
  'emyrs-caerthwyn',
  'ulysses',
  'griff-rhuddgar',
  'sulwen-rhuddgar',
  'melyn-rhuddgar',
  'iob-rhuddgar',
  'brenn-rhuddgar',
  'teyna-rhuddgar',
  'talwyn-rhuddgar',
  'ceron-rhuddgar',
  'cari-rhuddgar',
  'roisin',
  'collen-rhuddgar',
  'ened-rhuddgar'
]);

export const HOUSE_RHUDDGAR_PORTRAITS = Object.freeze(
  Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.${PNG_PORTRAIT_IDS.has(personId) ? 'png' : 'jpg'}`
  ]))
);
