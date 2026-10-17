import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';

export const FREYA_CHARACTER_ID = 'ksJQe8Ai4KbRE9jOAvb7';
export const FREYA_WORLD_ID = 'person--haus-skald--freya-skald';
export const FENRIR_CHARACTER_ID = 'FKiXsSWVoV74rTgmpPip';
const FENRIR_WORLD_ID = 'person--haus-varulv--fenrir-varulv';
const ownHouse = (record, person) => record.id === person.houseId?.replace(/^house-/, 'haus-');

function indexFamilies() {
  const people = new Map(), parentages = new Map(), partnerships = new Map(), houses = new Map();
  for (const record of FAMILY_REGISTRY) {
    for (const house of record.family.houses || []) if (!houses.has(house.id) || house.id === record.family.lineage?.houseId) houses.set(house.id, house);
    for (const person of record.family.persons) {
      if (!person.worldPersonId) continue;
      const previous = people.get(person.worldPersonId), primary = ownHouse(record, person);
      if (!previous || primary && !previous.primary) people.set(person.worldPersonId, { ...previous, ...person,
        portrait: person.portrait || previous?.portrait || '', familyId: record.id, primary });
      else if (!previous.portrait && person.portrait) previous.portrait = person.portrait;
    }
  }
  for (const record of FAMILY_REGISTRY) {
    const local = new Map(record.family.persons.map(person => [person.id, person]));
    for (const relation of record.family.parentages || []) {
      if (relation.type === 'claimed' || relation.certainty === 'uncertain') continue;
      const child = local.get(relation.childId), parents = relation.parentIds.map(id => local.get(id)?.worldPersonId).filter(Boolean);
      if (!child?.worldPersonId || !parents.length) continue;
      const previous = parentages.get(child.worldPersonId), primary = ownHouse(record, child);
      if (!previous || primary && !previous.primary) parentages.set(child.worldPersonId, { parents, familyId: record.id, primary });
    }
    for (const relation of record.family.partnerships || []) {
      const participants = relation.participantIds.map(id => local.get(id)?.worldPersonId).filter(Boolean);
      if (participants.length !== 2 || relation.type === 'affair') continue;
      const key = [...participants].sort().join('|');
      if (!partnerships.has(key)) partnerships.set(key, { participants, type: relation.type, status: relation.status });
    }
  }
  return { people, parentages, partnerships: [...partnerships.values()], houses };
}

export function buildFreyaFamilyContext() {
  const index = indexFamilies(), { people, parentages, houses } = index;
  const person = id => { assert(people.has(id), 'Fehlende Stammbaumperson: ' + id); return people.get(id); };
  const parentsOf = id => parentages.get(id)?.parents || [];
  const siblingsOf = id => {
    const parents = parentsOf(id);
    return parents.length ? [...parentages].filter(([child, relation]) => child !== id
      && parents.length === relation.parents.length && parents.every(parent => relation.parents.includes(parent))).map(([child]) => child) : [];
  };
  const childrenOf = id => [...parentages].filter(([, relation]) => relation.parents.includes(id)).map(([child]) => child);
  const partnersOf = id => index.partnerships.filter(relation => relation.participants.includes(id))
    .map(relation => ({ ...relation, id: relation.participants.find(participant => participant !== id) }));
  const connections = [], seen = new Set();
  function add(id, group, relation, detail = '') {
    if (id === FREYA_WORLD_ID || seen.has(id)) return;
    const p = person(id), house = houses.get(p.houseId);
    const familyEmblem = FAMILY_REGISTRY.find(record => record.id === p.familyId)?.family.document?.emblem;
    seen.add(id);
    connections.push({ worldPersonId: id, personId: p.id, familyId: p.familyId, name: p.name,
      sex: p.sex, birth: p.birth, death: p.death, title: p.title || '', group, relation,
      detail: [relation, detail, p.title, p.birth ? `Geboren ${p.birth}${p.death ? `, gestorben ${p.death}` : ''}.` : ''].filter(Boolean).join(' '),
      image: '/Stammbäume/' + (p.portrait || house?.emblem || familyEmblem),
      imageFormat: p.portrait ? 'portrait' : 'square',
      link: `/Stammbäume/Stammbaum.html?family=${p.familyId}&mode=view&person=${p.id}` });
  }
  add(FENRIR_WORLD_ID, 'Fenrir – Bester Freund & Love Interest', 'Bester Freund und möglicher Lebenspartner.',
    'Freya kann sich ein gemeinsames Leben vorstellen. Ihre Sehnsucht nach Freiheit und seine eher traditionellen Zukunftsvorstellungen sind noch nicht miteinander geklärt. Eine Verlobung oder Ehe besteht nicht.');
  const parents = parentsOf(FREYA_WORLD_ID);
  assert.equal(parents.length, 2);
  for (const id of parents) add(id, 'Eltern', person(id).sex === 'female' ? 'Mutter.' : 'Vater.',
    person(id).sex === 'female' ? 'Furchtlose Kriegerin; unterwies Freya im Umgang mit Schwert und Schild.' : 'Weltberühmter Skalde; prägte Freyas musikalische und magische Ausbildung. Häufig am Königshof im Nordosten Aldrimars.');
  const siblings = siblingsOf(FREYA_WORLD_ID).sort((a, b) => Number(person(a).birth) - Number(person(b).birth));
  for (const id of siblings) {
    add(id, 'Geschwister', person(id).sex === 'female' ? 'Ältere Schwester.' : 'Älterer Bruder.',
      person(id).sex === 'male' ? 'Ihre Brüder hatten großen Anteil an Freyas musikalischer und magischer Entwicklung.' : 'Gehört mit Freya zu den sieben Kindern Ragnars und Lagerthas.');
    for (const partner of partnersOf(id)) add(partner.id, 'Geschwister',
      `${partner.type === 'betrothal' || partner.status === 'betrothed' ? 'Verlobte' : 'Partnerin'} ihres Bruders ${person(id).name}.`);
  }
  const aunts = [];
  for (const parent of parents) {
    const maternal = person(parent).sex === 'female', side = maternal ? 'mütterlicherseits' : 'väterlicherseits';
    for (const grandparent of parentsOf(parent)) add(grandparent, 'Großeltern', `${person(grandparent).sex === 'female' ? 'Großmutter' : 'Großvater'} ${side}.`);
    for (const relative of siblingsOf(parent)) {
      aunts.push({ id: relative, side });
      const group = maternal ? 'Familie Eisenjungfer – Tanten und Onkel' : 'Familie Skald – Tanten und Onkel';
      add(relative, group, `${person(relative).sex === 'female' ? 'Tante' : 'Onkel'} ${side}.`);
      for (const partner of partnersOf(relative)) add(partner.id, group,
        `${person(partner.id).sex === 'female' ? 'Gemahlin' : 'Gemahl'} von ${person(relative).name}; angeheiratete Verwandtschaft.`);
    }
  }
  for (const relative of aunts) for (const child of childrenOf(relative.id)) add(child,
    relative.side === 'mütterlicherseits' ? 'Cousinen und Cousins – Eisenjungfer' : 'Cousinen und Cousins – Skald und verbundene Clans',
    `${person(child).sex === 'female' ? 'Cousine' : 'Cousin'} ${relative.side}.`,
    `${person(child).sex === 'female' ? 'Tochter' : 'Sohn'} von ${parentsOf(child).map(id => person(id).name).join(' und ')}.`);
  for (const id of parentsOf(FENRIR_WORLD_ID)) add(id, 'Fenrirs Familie', `${person(id).sex === 'female' ? 'Mutter' : 'Vater'} Fenrirs.`);
  for (const id of siblingsOf(FENRIR_WORLD_ID)) add(id, 'Fenrirs Familie',
    person(id).id === 'hati-varulv' ? 'Jüngeres Geschwister Fenrirs.' : `${person(id).sex === 'female' ? 'Schwester' : 'Bruder'} Fenrirs.`);
  const ancestors = [], ancestorSeen = new Set([FREYA_WORLD_ID]);
  let generation = [FREYA_WORLD_ID];
  for (let depth = 1; depth <= 12 && generation.length; depth++) {
    generation = [...new Set(generation.flatMap(parentsOf))].filter(id => !ancestorSeen.has(id));
    for (const id of generation) { const p = person(id); ancestorSeen.add(id); ancestors.push({ worldPersonId: id, name: p.name, birth: p.birth, death: p.death, generation: depth, familyId: p.familyId }); }
  }
  const freya = person(FREYA_WORLD_ID), fenrir = person(FENRIR_WORLD_ID);
  return { schemaVersion: 1, source: 'Stammbäume/assets/js/data/families.registry.js', indexedFamilies: FAMILY_REGISTRY.length,
    freya: { worldPersonId: freya.worldPersonId, birth: freya.birth, houseId: freya.houseId },
    fenrir: { worldPersonId: fenrir.worldPersonId, birth: fenrir.birth }, connections, ancestors,
    parentIds: parents, siblingIds: siblings, notes: ['Nur belegte Elternschaften; behauptete oder über Generationen springende Gründerlinien werden nicht als lückenlose Abstammung ausgegeben.',
      'Antje Skald (Gleipnirs Gemahlin) und Antke Skald (Mandons Gemahlin) sind zwei verschiedene Tanten.'] };
}
