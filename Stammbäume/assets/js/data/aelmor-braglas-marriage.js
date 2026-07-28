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

export const AELMOR_BRAGLAS_MARRIAGE = marriage(
  'marriage-bryn-braglas-anwen-aelmor',
  person({
    id: 'bryn-braglas',
    name: 'Bryn Braglas',
    sex: 'male',
    birth: '1692',
    houseId: 'house-braglas',
    portrait: '',
    title: 'Bruder Cadfan Braglas’',
    notes: 'Heiratete Anwen Aelmor; mit ihr hat er die Söhne Madoc und Iestyn.'
  }),
  person({
    id: 'anwen-aelmor',
    name: 'Anwen Aelmor',
    sex: 'female',
    birth: '1696',
    houseId: 'house-aelmor',
    portrait: '',
    title: 'An Haus Braglas verheiratete Aelmor',
    notes: 'Schwester Goronwy Aelmors; heiratete Bryn Braglas.'
  })
);
