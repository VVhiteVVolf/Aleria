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

export const MAERLLYS_SWYLL_MARRIAGE = marriage(
  'marriage-iorwerth-maerllys-bronwen-swyll',
  person({
    id: 'iorwerth-maerllys',
    name: 'Iorwerth Maerllys',
    sex: 'male',
    birth: '1689',
    houseId: 'house-maerllys',
    portrait: '',
    title: 'Vater Nia Maerllys’',
    notes: 'Angehöriger des Hauses Maerllys; heiratete Bronwen Swyll.'
  }),
  person({
    id: 'bronwen-swyll',
    name: 'Bronwen Swyll',
    sex: 'female',
    birth: '1691',
    houseId: 'house-swyll',
    portrait: '',
    title: 'An Haus Maerllys verheiratete Swyll',
    notes: 'Schwester Iestyn Swylls; heiratete Iorwerth Maerllys.'
  })
);

export const MAERLLYS_YSGRIF_MARRIAGE = marriage(
  'marriage-owain-maerllys-gwenllian-ysgrif',
  person({
    id: 'owain-maerllys',
    name: 'Owain Maerllys',
    sex: 'male',
    birth: '1665',
    houseId: 'house-maerllys',
    portrait: '',
    title: 'Großonkel Nia Maerllys’',
    notes: 'Bruder Cadfan Maerllys’; heiratete Gwenllian Ysgrif.'
  }),
  person({
    id: 'gwenllian-ysgrif',
    name: 'Gwenllian Ysgrif',
    sex: 'female',
    birth: '1668',
    houseId: 'house-ysgrif',
    portrait: '',
    title: 'An Haus Maerllys verheiratete Ysgrif',
    notes: 'Schwester Idris Ysgrifs; heiratete Owain Maerllys.'
  })
);
