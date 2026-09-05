export const DRACHENTANZ_FORM_IDS = Object.freeze({
  jungdrache: 'drachentanz-form-i-jungdrache',
  schwertdrache: 'drachentanz-form-ii-schwertdrache',
  abwartender: 'drachentanz-form-iii-abwartender-drache',
  fliegender: 'drachentanz-form-iv-fliegender-drache',
  bruellender: 'drachentanz-form-v-bruellender-drache',
  ausgeglichener: 'drachentanz-form-vi-ausgeglichener-drache',
  zorniger: 'drachentanz-form-vii-zorniger-drache',
  drachling: 'drachentanz-form-drachling',
  traellernder: 'drachentanz-form-barddwyr-traellernder-drache',
  kreischender: 'drachentanz-form-barddwyr-kreischender-drache'
});

export const DRACHENTANZ_FORM_NAMES = Object.freeze({
  [DRACHENTANZ_FORM_IDS.jungdrache]: 'Tanz des Jungdrachens',
  [DRACHENTANZ_FORM_IDS.schwertdrache]: 'Tanz des Schwertdrachens',
  [DRACHENTANZ_FORM_IDS.abwartender]: 'Tanz des abwartenden Drachens',
  [DRACHENTANZ_FORM_IDS.fliegender]: 'Tanz des fliegenden Drachens',
  [DRACHENTANZ_FORM_IDS.bruellender]: 'Tanz des brüllenden Drachens',
  [DRACHENTANZ_FORM_IDS.ausgeglichener]: 'Tanz des ausgeglichenen Drachens',
  [DRACHENTANZ_FORM_IDS.zorniger]: 'Tanz des zornigen Drachens',
  [DRACHENTANZ_FORM_IDS.drachling]: 'Tanz des Drachlings',
  [DRACHENTANZ_FORM_IDS.traellernder]: 'Tanz des trällernden Drachens',
  [DRACHENTANZ_FORM_IDS.kreischender]: 'Tanz des kreischenden Drachens'
});

export const DRACHENTANZ_EXPERT_PATH_IDS = Object.freeze([
  DRACHENTANZ_FORM_IDS.abwartender,
  DRACHENTANZ_FORM_IDS.fliegender,
  DRACHENTANZ_FORM_IDS.bruellender,
  DRACHENTANZ_FORM_IDS.ausgeglichener,
  DRACHENTANZ_FORM_IDS.zorniger
]);
