function person(definition) {
  return Object.freeze(definition);
}

function marriage(id, first, second) {
  return Object.freeze({
    id,
    participantIds: Object.freeze([first.id, second.id]),
    first,
    second
  });
}

export const PENDRWN_SWYLL_MARRIAGE = marriage(
  'marriage-meilyr-pendrwn-eirwen-swyll',
  person({
    id: 'meilyr-pendrwn',
    name: 'Meilyr Pendrwn',
    sex: 'male',
    birth: '1687',
    houseId: 'house-pendrwn',
    portrait: '',
    title: 'Vater Emyr Pendrwns',
    notes: 'Ehemann Eirwen Swylls und Vater der jüngsten Pendrwn-Geschwister.'
  }),
  person({
    id: 'eirwen-swyll',
    name: 'Eirwen Swyll',
    sex: 'female',
    birth: '1688',
    houseId: 'house-swyll',
    portrait: '',
    title: 'An Haus Pendrwn verheiratete Swyll',
    notes: 'Schwester Iestyn Swylls; heiratete Meilyr Pendrwn.'
  })
);

export const PENDRWN_DRAENMELYN_MARRIAGE = marriage(
  'marriage-gwenith-pendrwn-caradog-draenmelyn',
  person({
    id: 'gwenith-pendrwn',
    name: 'Gwenith Pendrwn',
    sex: 'female',
    birth: '1693',
    houseId: 'house-pendrwn',
    portrait: '',
    title: 'Tante Emyr Pendrwns',
    notes: 'Schwester Meilyr Pendrwns; heiratete Caradog Draenmelyn.'
  }),
  person({
    id: 'caradog-draenmelyn',
    name: 'Caradog Draenmelyn',
    sex: 'male',
    birth: '1700',
    houseId: 'house-draenmelyn',
    portrait: '',
    title: 'Söldner',
    notes: 'Onkel von Taliesin und Myfanwy; verließ den Draig-Haushalt, schlägt sich als Söldner durch und ist mit Gwenith Pendrwn verheiratet.'
  })
);
