import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { getPerllanPicturedCompanions, buildPerllanCompanionInventory } from './pictured-companions.mjs';

export const PERLLAN_CHARACTER_FEATURE = 'perllan';
export const PERLLAN_CHARACTER_AUTHORED_AT = '2026-11-04T00:00:00.000Z';
export const PERLLAN_CHARACTER_EXPORT_DIRECTORY = 'Charakter Archiv Exporte/Perllan';

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, symbol =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[symbol]);

export function isNamedPerllanPerson(person) {
  return !!person?.name?.trim() && !/^(?:\?+|Unbekannt)/i.test(person.name.trim());
}

function relationName(record, relation) {
  const person = record.family.persons.find(person => person.id === relation.personId);
  if (person?.name.startsWith('Unbekannt')) return person.name;
  if (person && !isNamedPerllanPerson(person)) {
    return `eine namentlich nicht überlieferte Person${person.birth ? ` (geboren ${person.birth})` : ''}`;
  }
  return relation.name;
}

function relationDetail(relation, key) {
  if (relation.type === 'claimed') return 'Vermutete Abstammungsverbindung über den Zeitsprung; keine belegte direkte Elternschaft';
  const label = key === 'parents' ? 'Elternteil' : key === 'children' ? 'Kind' : 'Partnerperson';
  const certainty = relation.certainty === 'probable' ? ' · wahrscheinlich' : relation.certainty && relation.certainty !== 'confirmed' ? ' · ungeklärt' : '';
  return `${label}${relation.type === 'affair' ? ' · Affäre' : ''}${certainty}`;
}

export function createPerllanCharacterBiography(record, candidate) {
  if (record.id !== 'perllan' || candidate.familyId !== record.id) throw Error('Eine eindeutige Perllan-Familienakte ist erforderlich.');
  const lifeStatus = candidate.status === 'dead' ? 'Verstorben' : candidate.status === 'alive' ? 'Lebend' : 'Ungeklärt';
  const statements = [
    `${candidate.displayName}${candidate.birth ? ` wurde ${candidate.birth} geboren und` : ''} gehört zur bürgerlichen Familie Perllan.`,
    ...(candidate.status === 'dead' ? [candidate.death && !/^\?+$/.test(candidate.death)
      ? `${candidate.displayName} starb ${candidate.death}.` : `${candidate.displayName} ist verstorben; das Todesjahr ist nicht überliefert.`] : [])
  ];
  const relationGroups = [
    ['parents', 'Eltern'], ['partners', 'Partnerschaften'], ['children', 'Kinder']
  ];
  const relationships = relationGroups.flatMap(([key, label]) => {
    const relations = candidate.relationships[key];
    if (key === 'parents' && relations.some(relation => relation.type === 'claimed')) {
      return [`Eine vermutete Abstammungsverbindung führt über den Zeitsprung zu ${relations.map(relation => relationName(record, relation)).join(' und ')}. Eine direkte biologische Elternschaft ist damit nicht belegt.`];
    }
    return relations.length ? [`${label}: ${relations.map(relation => `${relationName(record, relation)}${relation.certainty === 'probable' ? ' (wahrscheinlich)' : ''}`).join('; ')}.`] : [];
  });
  const peopleById = new Map(createFamilyCandidates(record).map(person => [person.personId, person]));
  const connections = relationGroups.flatMap(([key, label]) => candidate.relationships[key].map(relation => ({
    type: 'connection', name: relationName(record, relation),
    image: peopleById.get(relation.personId)?.portrait || '', imageFormat: 'portrait',
    detail: relationDetail(relation, key)
  })));
  for (const spec of getPerllanPicturedCompanions(candidate.personId)) {
    connections.push({ type: 'connection', name: spec.name, image: candidate.portrait,
      imageFormat: 'portrait', detail: `${spec.detail} Ein persönlicher Tiername ist nicht überliefert.` });
  }
  const text = `${statements.map(escapeHtml).join(' ')}${relationships.length ? `</p><p>${relationships.map(escapeHtml).join(' ')}` : ''}`;
  return {
    schema: 'aleria.biography-module', schemaVersion: 1,
    stats: [['Familie', 'Perllan'], ['Stand', 'Bürgerlich'],
      ...(candidate.birth ? [['Geboren', candidate.birth]] : []), ['Lebensstatus', lifeStatus]],
    quote: '', quoteBy: '',
    biography: {
      portrait: candidate.portrait, portraitCaption: candidate.displayName,
      biographyTitle: candidate.displayName, biographyText: `<p>${text}</p>`,
      abilities: [], knightMentors: [],
      connectionsTitle: 'Familie & Tierbegleiter', connections,
      documentsTitle: 'Familienakte', documents: [{
        title: 'Familie Perllan', icon: '../Stammbäume/' + record.family.document.emblem,
        text: 'Stammbaum mit den überlieferten Verwandtschaftsverbindungen.',
        link: `../Stammbäume/Stammbaum.html?family=perllan&mode=view&person=${encodeURIComponent(candidate.personId)}`
      }],
      footer: `Personenakte · ${candidate.displayName}`
    }
  };
}

export function buildPerllanCharacterExports(record) {
  if (record?.id !== 'perllan') throw Error('Die Perllan-Familienakte fehlt.');
  const namedIds = new Set(record.family.persons.filter(isNamedPerllanPerson).map(person => person.id));
  return createFamilyCandidates(record).filter(candidate => namedIds.has(candidate.personId)).map(candidate => {
    if (!candidate.worldPersonId.startsWith('person--perllan--')) throw Error(`Die ursprüngliche Weltpersonenkennung fehlt: ${candidate.personId}`);
    const character = {
      ...buildImportedCharacter(candidate, null, PERLLAN_CHARACTER_AUTHORED_AT),
      id: candidate.worldPersonId,
      biography: createPerllanCharacterBiography(record, candidate)
    };
    const inventory = buildPerllanCompanionInventory(character, candidate, PERLLAN_CHARACTER_AUTHORED_AT);
    if (inventory) character.inventory = inventory;
    return {
      type: 'aleria-character', version: 1, exportedAt: PERLLAN_CHARACTER_AUTHORED_AT,
      assignedTab: 'Gwynthor', mergeStrategy: 'replace-exported-fields',
      sourcePath: `${PERLLAN_CHARACTER_EXPORT_DIRECTORY}/${candidate.personId}.json`,
      source: { kind: 'supplied-family-export', documentId: 'perllan', familyId: record.id,
        personId: candidate.personId, worldPersonId: candidate.worldPersonId,
        picturedCompanions: getPerllanPicturedCompanions(candidate.personId).map(spec => ({ ...spec, portrait: candidate.portrait })) },
      character
    };
  });
}
