export const DRACHENTANZ_FORM_IDS = Object.freeze({
  jungdrache: 'drachentanz-form-i-jungdrache',
  vertiefung: 'drachentanz-freie-vertiefung',
  schwertdrache: 'drachentanz-form-ii-schwertdrache',
  abwartender: 'drachentanz-form-iii-abwartender-drache',
  fliegender: 'drachentanz-form-iv-fliegender-drache',
  bruellender: 'drachentanz-form-v-bruellender-drache',
  ausgeglichener: 'drachentanz-form-vi-ausgeglichener-drache',
  aufsteigender: 'drachentanz-pfad-aufsteigender-drache',
  zwillingsdrache: 'drachentanz-pfad-zwillingsdrache',
  speerdrache: 'drachentanz-pfad-speerdrache',
  peitschender: 'drachentanz-pfad-peitschender-drache',
  huetender: 'drachentanz-pfad-huetender-drache',
  stuermender: 'drachentanz-pfad-stuermender-drache',
  schweifender: 'drachentanz-pfad-schweifender-drache',
  lauernder: 'drachentanz-pfad-lauernder-drache',
  jagender: 'drachentanz-pfad-jagender-drache',
  baerenklaue: 'drachentanz-form-baerenklaue',
  drachling: 'drachentanz-form-drachling',
  traellernder: 'drachentanz-form-barddwyr-traellernder-drache',
  kreischender: 'drachentanz-form-barddwyr-kreischender-drache'
});

export const DRACHENTANZ_FORM_NAMES = Object.freeze({
  [DRACHENTANZ_FORM_IDS.jungdrache]: 'Tanz des Jungdrachens',
  [DRACHENTANZ_FORM_IDS.vertiefung]: 'Freie Vertiefung',
  [DRACHENTANZ_FORM_IDS.schwertdrache]: 'Tanz des Schwertdrachens',
  [DRACHENTANZ_FORM_IDS.abwartender]: 'Tanz des abwartenden Drachens',
  [DRACHENTANZ_FORM_IDS.fliegender]: 'Tanz des fliegenden Drachens',
  [DRACHENTANZ_FORM_IDS.bruellender]: 'Tanz des brüllenden Drachens',
  [DRACHENTANZ_FORM_IDS.ausgeglichener]: 'Tanz des ausgeglichenen Drachens',
  [DRACHENTANZ_FORM_IDS.aufsteigender]: 'Tanz des aufsteigenden Drachens',
  [DRACHENTANZ_FORM_IDS.zwillingsdrache]: 'Tanz des Zwillingsdrachens',
  [DRACHENTANZ_FORM_IDS.speerdrache]: 'Tanz des Speerdrachens',
  [DRACHENTANZ_FORM_IDS.peitschender]: 'Tanz des peitschenden Drachens',
  [DRACHENTANZ_FORM_IDS.huetender]: 'Tanz des hütenden Drachens',
  [DRACHENTANZ_FORM_IDS.stuermender]: 'Tanz des stürmenden Drachens',
  [DRACHENTANZ_FORM_IDS.schweifender]: 'Tanz des schweifenden Drachens',
  [DRACHENTANZ_FORM_IDS.lauernder]: 'Tanz des lauernden Drachens',
  [DRACHENTANZ_FORM_IDS.jagender]: 'Tanz des jagenden Drachens',
  [DRACHENTANZ_FORM_IDS.baerenklaue]: 'Tanz der Bärenklaue',
  [DRACHENTANZ_FORM_IDS.drachling]: 'Tanz des Drachlings',
  [DRACHENTANZ_FORM_IDS.traellernder]: 'Tanz des trällernden Drachens',
  [DRACHENTANZ_FORM_IDS.kreischender]: 'Tanz des kreischenden Drachens'
});

export const DRACHENTANZ_EXPERT_PATH_IDS = Object.freeze([
  DRACHENTANZ_FORM_IDS.schwertdrache,
  DRACHENTANZ_FORM_IDS.abwartender,
  DRACHENTANZ_FORM_IDS.fliegender,
  DRACHENTANZ_FORM_IDS.aufsteigender,
  DRACHENTANZ_FORM_IDS.bruellender,
  DRACHENTANZ_FORM_IDS.ausgeglichener,
  DRACHENTANZ_FORM_IDS.zwillingsdrache,
  DRACHENTANZ_FORM_IDS.speerdrache,
  DRACHENTANZ_FORM_IDS.peitschender,
  DRACHENTANZ_FORM_IDS.huetender,
  DRACHENTANZ_FORM_IDS.stuermender,
  DRACHENTANZ_FORM_IDS.schweifender,
  DRACHENTANZ_FORM_IDS.lauernder,
  DRACHENTANZ_FORM_IDS.jagender,
  DRACHENTANZ_FORM_IDS.baerenklaue
]);

const TEULU_PATH_IDS = Object.freeze([
  DRACHENTANZ_FORM_IDS.schwertdrache, DRACHENTANZ_FORM_IDS.abwartender,
  DRACHENTANZ_FORM_IDS.fliegender, DRACHENTANZ_FORM_IDS.aufsteigender,
  DRACHENTANZ_FORM_IDS.bruellender, DRACHENTANZ_FORM_IDS.ausgeglichener,
  DRACHENTANZ_FORM_IDS.zwillingsdrache
]);
const SPEAR_PATH_IDS = Object.freeze([
  DRACHENTANZ_FORM_IDS.speerdrache, DRACHENTANZ_FORM_IDS.peitschender, DRACHENTANZ_FORM_IDS.huetender
]);

export const DRACHENTANZ_CLASS_PATH_IDS = Object.freeze({
  teulu: TEULU_PATH_IDS,
  cantref: SPEAR_PATH_IDS,
  uchelwyr: Object.freeze([...SPEAR_PATH_IDS, DRACHENTANZ_FORM_IDS.stuermender, DRACHENTANZ_FORM_IDS.schweifender]),
  helwyr: Object.freeze([...TEULU_PATH_IDS, DRACHENTANZ_FORM_IDS.lauernder, DRACHENTANZ_FORM_IDS.jagender]),
  arthwyr: Object.freeze([...TEULU_PATH_IDS, DRACHENTANZ_FORM_IDS.baerenklaue]),
  barddwyr: Object.freeze([DRACHENTANZ_FORM_IDS.schwertdrache, DRACHENTANZ_FORM_IDS.kreischender]),
  milwr: Object.freeze([DRACHENTANZ_FORM_IDS.drachling])
});
