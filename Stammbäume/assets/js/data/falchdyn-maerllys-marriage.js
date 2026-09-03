function person(definition) {
  return Object.freeze(definition);
}

export const FALCHDYN_MAERLLYS_MARRIAGE = Object.freeze({
  id: 'marriage-geraint-maerllys-llio-falchdyn',
  participantIds: Object.freeze(['geraint-maerllys', 'llio-falchdyn']),
  first: person({
    id: 'geraint-maerllys',
    name: 'Geraint Maerllys',
    sex: 'male',
    birth: '1691',
    houseId: 'house-maerllys',
    portrait: '',
    title: 'Sohn Owain Maerllys’ und Gwenllian Ysgrifs',
    notes: 'Angehöriger des Hauses Maerllys; heiratete Llio Falchdyn.'
  }),
  second: person({
    id: 'llio-falchdyn',
    name: 'Llio Falchdyn',
    sex: 'female',
    birth: '1692',
    houseId: 'house-falchdyn',
    portrait: '',
    title: 'An Haus Maerllys verheiratete Falchdyn',
    notes: 'Tochter Madoc Falchdyns; heiratete Geraint Maerllys. Die Verbindung wird in beiden Familienakten geführt.'
  })
});
