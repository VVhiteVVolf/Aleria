import { readFile } from 'node:fs/promises';
import { DRAIG_GARDE_PEOPLE } from '../../../Stammbäume/assets/js/data/draig-garde-people.js';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';

const snapshot = new URL('../../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url);
const gardeHref = '/AleriaAlmanach/AleriaAlmanach.html?entry=draig-leibgarde';
const vogt = 'hof-vogt';
const guard = 'hof-hausmacht';
const gwynthor = `${guard}/hauptmann-gwynthor`;

// Editorial selection of current service, using the exact stable register IDs.
const houseServants = [
  ['hof', 'zofe', 'person--haus-draenmelyn--myfanwy-draenmelyn', 'Persönliche Zofe von Oweta Draig.'],
  [vogt, 'zofenstelle', 'person--haus-draenmelyn--sioned-draenmelyn', 'Zofe von Tegwen.'],
  [vogt, 'zofenstelle-2', 'person--haus-maerllys--nia-maerllys', 'Persönliche Zofe von Isobel Draig.'],
  [vogt, 'zofenstelle-3', 'person--haus-swyll--meredith-swyll', 'Persönliche Zofe von Rhiannon Draig.'],
  ['hof', 'kammerdiener', 'person--haus-draenmelyn--taliesin-draenmelyn', 'Kammerdiener des Hauses Draig.'],
  [vogt, 'kammerstelle', 'person--haus-pendrwn--emyr-pendrwn', 'Kammerdiener von Anaraut Draig.'],
  [vogt, 'kammerstelle-2', 'person--haus-ysgrif--floyd-ysgrif', 'Kammerdiener von Neithon Draig.'],
  ['hof-hofdame', 'weitere-hofdame', 'person--haus-eisenherz--brona-eisenherz', 'Belegte Hofdame und Zeremonienmeisterin des Hauses Draig.'],
  ['hof', 'kueche', 'person--pert--person-e6511832', 'Leitet die Küche auf Castell Draig.', undefined, 'Küchenmeisterin'],
  ['hof', 'brot', 'person--pert--person-3a869794', 'Führt die Vorräte auf Castell Draig.'],
];

const otherDraigService = [
  [guard, 'gardist', 'person--craigddu--person-d189ca4a', 'Leibgardist laut aktueller Gardeübersicht.'],
  [guard, 'gardist-2', 'person--craigddu--person-28b0e0a3', 'Leibgardist laut aktueller Gardeübersicht.'],
  [guard, 'waffenknecht', 'person--pert--person-52becf61', 'Waffenknecht des Hauses Draig auf Castell Draig.', gwynthor],
  ['militaer', 'marschall-gefolgswaffenknecht', 'NfpyXayG4KoYqp5xQZd5', 'Cai Taflu dient im Gefolge des Marschalls.'],
  ['militaer', 'hauptmann-caerysgellfor', 'person--haus-argall--rhydric-argall', 'Burgverwalter und Hauptmann von Caer Ysgellfor.'],
  ['militaer', 'knappe-caerysgellfor', 'person--haus-argall--perwyn-argall', 'Knappe seines Vaters Rhydric Argall auf Caer Ysgellfor.'],
  ['klerus', 'kathedrale-paladin-1', 'glendower-o-cenyr', 'Paladin und geläuterter Bußritter im persönlichen Stab des Patriarchen.'],
];

const deacon = (place, id, title = 'Diakon') => ['klerus', `diakon-${geographicKey(place)}`, id,
  'Örtlicher Kirchenvorstand laut Almanachakte.', undefined, `${title} von ${place}`];

const regionalChurch = {
  wyrm: [deacon('Llysfaen', 'micIJWlN8CkuedMo490X', 'Diakonin')],
  'arthus-streben': [deacon('Gwaulhir', 'Hx23IAHjVHeuFUJGZPAj', 'Diakonin')],
  'gwendolyns-ufer': [deacon('Morcarryn', 'j4fZKrXkARcP9oDAUSeb')],
  'rhonwens-traenen': [deacon('Traethgwen', 'Yj5xREgJtjrAs8JOpOLe')],
};

const gardeRanks = {
  'Hauptmann der Leibgarde': ['hof', 'garde', 1],
  'Leutnant der Leibgarde': [guard, 'leutnant', 1],
  'Ritter der Leibgarde': [guard, 'garderitter', 1],
  Leibgardist: [guard, 'gardist', 3],
};

function gardeAssignments() {
  const ranks = new Map();
  return DRAIG_GARDE_PEOPLE.map(person => {
    const [area, slug, first] = gardeRanks[person.role];
    const count = (ranks.get(slug) || 0) + 1;
    ranks.set(slug, count);
    const ordinal = first + count - 1;
    return [area, ordinal === 1 ? slug : `${slug}-${ordinal}`, person.worldPersonId, person.notes];
  });
}

export async function readAlmanacAppointments() {
  const { characters } = JSON.parse(await readFile(snapshot, 'utf8'));
  const records = new Map(characters.flatMap(character => [
    [character.id, character],
    ...(character.identity?.worldPersonId ? [[character.identity.worldPersonId, character]] : []),
  ]));
  const index = new Map();
  for (const [id, character] of records) {
    if (!character.archived) index.set(id, character);
  }
  for (const person of DRAIG_GARDE_PEOPLE) {
    if (records.has(person.worldPersonId)) continue;
    const character = records.get(person.existingCharacterId);
    if (character?.archived) continue;
    // The public guard roster includes named roles whose individual Almanac
    // files are optional. Link such an appointment to its published group.
    index.set(person.worldPersonId, {
      name: person.name, portrait: '/Stammbäume/' + person.portrait,
      id: person.worldPersonId, referenceHref: gardeHref,
      ...character, identity: { ...character?.identity, worldPersonId: person.worldPersonId, sex: person.sex },
      ...(character ? { referenceHref: '' } : {}),
    });
  }
  const documented = { draig: [...houseServants, ...gardeAssignments(), ...otherDraigService], ...regionalChurch };
  const appointments = Object.fromEntries(Object.entries(documented).map(([scope, roles]) => [scope,
    roles.map(([area, slot, id, note, site, title]) => {
      const character = index.get(id);
      if (!character || character.genealogy?.status === 'dead') throw new Error(`Almanachbeleg für laufenden Dienst fehlt: ${scope}/${area}/${slot} · ${id}`);
      return { area, slot, character, note, site, title };
    }),
  ]));
  return { index, appointments };
}
