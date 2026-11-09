export const FFALS_ART = './assets/goldene-fassung';
export const FFALS_PEOPLE = Object.freeze([
  { key: 'alwyn', characterId: 'h0Ifj6cWfP3jqwWmeJJy', name: 'Alwyn Ffals', role: 'Inhaber · Einkauf und Geschäftsführung',
    bio: 'Alwyn tritt in Gwynthor als Händler der Familie Ffals auf und führt Die goldene Fassung. Er betreut Einkauf, Geschäftskontakte und die Vereinbarungen mit der Kundschaft. Weitere gesicherte Angaben zu seinem bisherigen Lebenslauf liegen noch nicht vor.' },
  { key: 'seren', characterId: 'OACnmvvmPeyO95CNt2Cm', name: 'Seren Ffals', role: 'Verkauf · Beratung und Präsentation',
    bio: 'Seren gehört zur vierköpfigen Besetzung der Goldenen Fassung. Im Laden übernimmt sie Beratung, Warenpräsentation und Verkauf. Ihr genauer bisheriger Lebenslauf ist noch nicht ausgearbeitet.' },
  { key: 'rhun', characterId: 'gj2lAsfeeqEpWvXumIma', name: 'Rhun Ffals', role: 'Juweliergehilfe · Auslage und Botengänge',
    bio: 'Rhun arbeitet in der Goldenen Fassung als Juweliergehilfe. Auslage, kleine Handreichungen und Botengänge bilden seine vorgesehene Ladenrolle. Gesicherte Lebensdaten und weitere Stationen bleiben offen.' },
  { key: 'bryn', characterId: 'QRUp1YQDmMr5uBvgx1aD', name: 'Bryn Ffals', role: 'Werkstattgehilfe · Lager und Warenannahme',
    bio: 'Bryn gehört zur Besetzung der Goldenen Fassung. Seine vorgesehene Rolle umfasst Warenannahme, Lager und Hilfsarbeiten in der Werkstatt. Eine abgeschlossene Goldschmiedeausbildung oder Meisterschaft ist damit nicht festgelegt.' }
].map(person => Object.freeze({ ...person, portrait: `${FFALS_ART}/portraits/${person.key}-ffals.png` })));

export const ffalsPerson = key => {
  const person = FFALS_PEOPLE.find(candidate => candidate.key === key);
  if (!person) throw Error(`Unbekannte Ffals-Ladenfigur: ${key}`);
  return person;
};
