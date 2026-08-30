const PORTRAIT_ROOT = 'assets/images/portraits/haus-ui-fiachrach';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'seamair-fiachrach',
  'naodhan-fiachrach',
  'tormodh-fiachrach',
  'fothadh-fiachrach',
  'tiarnog-fiachrach',
  'kester-fiachrach',
  'bhaltair-fiachrach',
  'domhnallach-fiachrach',
  'wiarnan-fiachrach',
  'ythran-fiachrach',
  'breasal-fiachrach',
  'grada-fiachrach',
  'yoliva-fiachrach',
  'gormflaith-fiachrach',
  'ultach-fiachrach',
  'paislie-fiachrach',
  'seamus-fiachrach',
  'padraig-fiachrach',
  'gadhra-fiachrach',
  'uallach-fiachrach',
  'talitha-fiachrach',
  'neart-fiachrach',
  'connla-fiachrach',
  'fiadh-fiachrach'
]);

export const HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  LOCAL_PORTRAIT_IDS.map(personId => [personId, `${PORTRAIT_ROOT}/${personId}.jpg`])
));
