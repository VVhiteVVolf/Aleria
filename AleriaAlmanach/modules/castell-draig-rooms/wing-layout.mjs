import { CASTELL_NODE_ID, RESIDENTIAL_NODE_ID, DRAIG_WINGS, DRAIG_HOUSEHOLDS } from './wing-households.mjs';
import { DRAIG_ROOMS_MODULE_ID } from './room-pages.mjs';

const rootPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Castell Draig', 'Wohntrakte'];
const tab = 'Völker & Kulturen';
const paragraph = text => `<p>${text}</p>`;
export const roomModuleId = room => room.id === 'gawain' ? DRAIG_ROOMS_MODULE_ID : `castell-draig-gemach-${room.id}`;
export const wingNodeId = wing => `${RESIDENTIAL_NODE_ID}/${wing.id}`;

export function reviewDraigOccupants(family, characters) {
  const excluded = new Set(['owain-draig', ...family.parentages.filter(row => row.parentIds.includes('owain-draig')).map(row => row.childId)]);
  const required = family.persons.filter(person => person.houseId === 'house-draig' && person.status === 'alive' && !excluded.has(person.id));
  const allocated = DRAIG_HOUSEHOLDS.flatMap(room => room.personIds);
  if (new Set(allocated).size !== allocated.length) throw Error('Eine Person besitzt mehrere Wohnparteien.');
  const people = allocated.map(id => {
    const person = family.persons.find(person => person.id === id);
    if (!person || person.status !== 'alive' || person.death || excluded.has(id)) throw Error(`Unzulässiger Bewohner: ${id}`);
    const character = characters.find(row => row.worldPersonId === person.worldPersonId);
    if (!character) throw Error(`Figurenquelle fehlt: ${id}`);
    return { personId: id, name: character.name, worldPersonId: person.worldPersonId, characterId: character.characterId,
      status: person.status, record: character.record, portrait: person.portrait };
  });
  for (const person of required) if (!allocated.includes(person.id)) throw Error(`Lebender Draig ohne Quartier: ${person.id}`);
  return { livingDraigs: required.length, people, unlinkedCharacterPersons: people.filter(person => !person.characterId).map(person => person.personId), excludedIds: [...excluded],
    guestHouseholds: DRAIG_HOUSEHOLDS.filter(room => room.wingId === 'gaeste').map(room => room.id) };
}

function scenePage(title, key, image, intro, cast, location) {
  return { schemaVersion: 1, pageTitle: title, commentThreadKey: key, image, imageWidth: 34, imageTall: true,
    enableComments: true, sessionPage: true, sessionIntro: paragraph(intro),
    sessionHint: 'Schreibe deinen Beitrag zu dieser Szene.', sessionLocation: location,
    sessionStatus: 'active', sessionParticipants: [], sessionCast: cast,
    sessionCastDetails: cast.map(id => ({ schemaVersion: 1, id, role: 'Bewohner des Gemachs' })),
    sessionDateAleria: { year: null, month: null, day: null },
    sessionEmptyTitle: title, sessionEmptyText: 'Die Szene ist offen. Hier kann ein Besuch oder eine Begegnung beginnen.' };
}

function moduleEntry(id, title, pages) {
  return { schemaVersion: 1, id, title, subtitle: title, type: 'Story', category: 'Kultur',
    moduleWidth: 100, moduleHeight: 100, image: pages[0].image, stamp: 'Celtigerns Wacht · Gwynthor · Castell Draig',
    icon: '', locked: false, appendCommentsPage: false, enablePageComments: true, multipage: true, pages };
}

export function planDraigWingExpansion({ entry, manifest, review, artwork }) {
  if (entry?.id !== DRAIG_ROOMS_MODULE_ID || !Array.isArray(entry.pages)) throw Error('Falsches Ausgangsmodul.');
  const next = structuredClone(manifest);
  if (next.moduleSectionNodes.some(node => node.id === RESIDENTIAL_NODE_ID)) throw Error('Wohntrakte wurden bereits neu gegliedert.');
  const castleSection = next.customSections.find(section => section.nodeId === CASTELL_NODE_ID && section.entryIds.includes(entry.id));
  if (!castleSection || !next.moduleSectionNodes.some(node => node.id === CASTELL_NODE_ID)) throw Error('Castell-Platzierung fehlt.');
  const original = key => {
    const pages = entry.pages.filter(page => page.commentThreadKey === key);
    if (pages.length !== 1) throw Error(`Bestandsseite nicht eindeutig: ${key}`);
    return structuredClone(pages[0]);
  };
  const corridor = original('0').image;
  const entries = [];
  const sections = [];
  const addSection = (id, parentId, title, desc, path, order) => {
    const node = { id, parentId, tab, title, desc, sortOrder: order };
    const section = { key: title, tab, desc, nodeId: id, path, entryIds: [] };
    next.moduleSectionNodes.push(node);
    next.customSections.push(section);
    sections.push(section);
    return section;
  };
  const place = (module, section) => {
    entries.push(module); section.entryIds.push(module.id);
    next.moduleNodeAssignments[module.id] = section.nodeId;
    if (next.moduleSectionMoves?.[module.id]) delete next.moduleSectionMoves[module.id];
  };
  const residential = addSection(RESIDENTIAL_NODE_ID, CASTELL_NODE_ID, 'Wohntrakte',
    'Die verbundenen Wohnflügel der lebenden Draig-Familie.', rootPath, 0);
  const overview = {
    schemaVersion: 1, pageTitle: 'Wohntrakte von Castell Draig', commentThreadKey: 'uebersicht', image: corridor,
    imageWidth: 30, imageTall: true, enableComments: false,
    description: 'Die Wohntrakte gliedern sich in sechs miteinander verbundene Flügel. Galahad und Gwendolyn wohnen im Grafenflügel bei ihren Kindern. Gemeinsame Gänge und die Familienstube ermöglichen Besuche und Begegnungen, während jede Wohnpartei einen eigenen Rückzugsraum besitzt.',
    stats: [['Flügel', String(DRAIG_WINGS.length)], ['Wohnparteien', String(DRAIG_HOUSEHOLDS.length)], ['Lebende Draigs', String(review.livingDraigs)]],
    sceneBlocks: DRAIG_WINGS.map(wing => ({ type: 'intro', text: `<h3>${wing.title}</h3><p>${wing.description}</p>` }))
  };
  place(moduleEntry('castell-draig-wohntrakte', 'Wohntrakte · Übersicht', [overview]), residential);
  if (!artwork.familienstube) throw Error('Bild der Familienstube fehlt.');
  const familyRoom = scenePage('Gemeinsame Familienstube', 'familienstube', artwork.familienstube,
    'Zwischen den Wohnflügeln liegt die gemeinsame Familienstube. Mehrere Sessel und Bänke gruppieren sich um den Kamin; ein großer Tisch bietet Platz für Gespräche, ein Spiel oder einen ungeplanten Besuch. Von hier führen kurze Gänge in die einzelnen Flügel. Auch Galahad und Gwendolyn erreichen die Stube direkt von ihren Gemächern aus.',
    [], 'Castell Draig · Wohntrakte · Familienstube');
  place(moduleEntry('castell-draig-familienstube', 'Gemeinsame Familienstube', [familyRoom]), residential);
  for (const [index, wing] of DRAIG_WINGS.entries()) {
    const section = addSection(wingNodeId(wing), RESIDENTIAL_NODE_ID, wing.title, wing.description, [...rootPath, wing.title], index);
    for (const room of DRAIG_HOUSEHOLDS.filter(room => room.wingId === wing.id)) {
      let page;
      if (room.existingRoom) page = original(`wohntrakte-${room.existingRoom}`);
      else {
        const image = room.existingImageThread ? original(room.existingImageThread).image : artwork[room.id];
        if (!image) throw Error(`Quartierbild fehlt: ${room.id}`);
        if (room.personIds.some(id => !review.people.some(person => person.personId === id))) throw Error(`Quartierbewohner fehlt: ${room.id}`);
        const cast = room.personIds.map(id => review.people.find(person => person.personId === id).characterId).filter(Boolean);
        page = scenePage(room.title, `wohntrakte-${room.id}`, image, room.description, cast, `Castell Draig · Wohntrakte · ${wing.title} · ${room.title}`);
      }
      const module = moduleEntry(roomModuleId(room), room.title, [page]);
      if (room.id === 'gawain') Object.assign(module, { ...structuredClone(entry), title: room.title, subtitle: room.title, image: page.image, pages: [page], appendCommentsPage: false });
      place(module, section);
    }
  }
  castleSection.entryIds = castleSection.entryIds.filter(id => id !== entry.id);
  return { entries, manifest: next, sections, review, preservedModuleId: entry.id,
    movedEmptyThreads: DRAIG_HOUSEHOLDS.filter(room => room.existingRoom && room.id !== 'gawain').map(room => `${entry.id}::session:wohntrakte-${room.existingRoom}`) };
}
