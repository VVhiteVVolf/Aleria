// Gemeinsamer kanonischer Datensatz für die hausübergreifende Ehe. Beide
// Stammbaumakten erzeugen daraus dieselben Weltpersonen und dieselbe Ehe-ID,
// ohne die Daten unabhängig voneinander zu duplizieren.
export const DRAENMELYN_SWYLL_MARRIAGE = Object.freeze({
  id: 'marriage-rhiannon-draenmelyn-iestyn-swyll',
  participantIds: Object.freeze([
    'rhiannon-draenmelyn',
    'iestyn-swyll'
  ]),
  rhiannon: Object.freeze({
    id: 'rhiannon-draenmelyn',
    name: 'Rhiannon Draenmelyn',
    sex: 'female',
    birth: '1702',
    houseId: 'house-draenmelyn',
    title: 'Bedienstete des Hauses Draig',
    portrait: 'https://i.imgur.com/cyJqlDG.png',
    notes: 'Tante von Taliesin und Myfanwy; heiratete in das bürgerliche Haus Swyll ein.',
    extensions: Object.freeze({
      registryManagedFields: Object.freeze(['portrait'])
    })
  }),
  iestyn: Object.freeze({
    id: 'iestyn-swyll',
    name: 'Iestyn Swyll',
    sex: 'male',
    birth: '1699',
    houseId: 'house-swyll',
    title: 'Angehöriger des Hauses Swyll',
    portrait: 'https://i.imgur.com/VpjeTe7.png',
    notes: 'Ehemann Rhiannon Draenmelyns; die Ehe verbindet die Bürgerhäuser Draenmelyn und Swyll.',
    extensions: Object.freeze({
      registryManagedFields: Object.freeze(['portrait'])
    })
  })
});
