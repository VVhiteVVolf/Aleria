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

export const TONNARTH_MAERLLYS_MARRIAGE = marriage(
  'marriage-madoc-tonnarth-rhoswen-maerllys',
  person({
    id: 'madoc-tonnarth',
    name: 'Madoc Tonnarth',
    sex: 'male',
    birth: '1692',
    houseId: 'house-tonnarth',
    portrait: '',
    title: 'Onkel Llewarch Tonnarths',
    notes: 'Bruder Cadell Tonnarths; heiratete Rhoswen Maerllys und hat mit ihr drei Söhne.'
  }),
  person({
    id: 'rhoswen-maerllys',
    name: 'Rhoswen Maerllys',
    sex: 'female',
    birth: '1694',
    houseId: 'house-maerllys',
    portrait: '',
    title: 'An Haus Tonnarth verheiratete Maerllys',
    notes: 'Tochter Owain Maerllys’ und Gwenllian Ysgrifs; heiratete Madoc Tonnarth.'
  })
);
