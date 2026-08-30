const PORTRAIT_ROOT = 'assets/images/portraits/haus-fir-an-tarvo';

export const HOUSE_FIR_AN_TARVO_LOCAL_PORTRAIT_IDS = Object.freeze([
  'tarvonius-tarvo',
  'luntorius-tarvo',
  'gaodhalan-tarvo',
  'usbran-tarvo',
  'ceiron-tarvo',
  'zailbhean-tarvo',
  'neartan-tarvo',
  'joclynn-tarvo',
  'laimreac-tarvo',
  'sgail-tarvo',
  'athluan-tarvo',
  'ronmara-tarvo',
  'gaius-tarvo',
  'tlachtga-tarvo',
  'turlachan-tarvo',
  'uallghus-tarvo',
  'glaisnin-tarvo',
  'crispus-tarvo',
  'imchad-tarvo',
  'iothlan-tarvo',
  'earcra-tarvo',
  'flannmara-tarvo'
]);

export const HOUSE_FIR_AN_TARVO_REUSED_PORTRAIT_IDS = Object.freeze([
  'cathaoir-cruthin',
  'sorcha-1700-cruthin',
  'nolan-gallchobhair',
  'peighneachan-gortach',
  'conairean-ruitheach'
]);

export const HOUSE_FIR_AN_TARVO_PORTRAITS = Object.freeze({
  ...Object.fromEntries(HOUSE_FIR_AN_TARVO_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])),
  'cathaoir-cruthin': 'assets/images/portraits/haus-dal-cruthin/cathaoir-cruthin.png',
  'sorcha-1700-cruthin': 'assets/images/portraits/haus-dal-cruthin/sorcha-1700-cruthin.png',
  'nolan-gallchobhair': 'assets/images/portraits/haus-fir-an-gallchobhair/nolan-gallchobhair.jpg',
  'peighneachan-gortach': 'assets/images/portraits/haus-ru-gortach/peighneachan-gortach.png',
  'conairean-ruitheach': 'assets/images/portraits/haus-dal-ruitheach/conairean-ruitheach.png'
});
