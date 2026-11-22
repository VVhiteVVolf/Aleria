import {
  GLYNMOR_EMBLEM, GLYNMOR_FAMILY_NAME, GLYNMOR_MEERA, GLYNMOR_MODULE_URL, GLYNMOR_TUDUR, isNamedGlynmorPerson
} from '../../../shared/glynmor/glynmor-identity.mjs';
import { ALERIA_CURRENT_YEAR } from '../../../Stammbäume/assets/js/config/chronology.js';
import {
  buildFamilyPersonViewUrl, buildImportedCharacter, createFamilyCandidates
} from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

export const GLYNMOR_CHARACTER_FEATURE = 'glynmor';
export const GLYNMOR_AUTHORED_AT = '2026-11-22T15:23:31.739Z';

const occupationDetails = {
  [GLYNMOR_TUDUR.personId]: ['Gwynthor', 'Tudur ist Familienoberhaupt und Meister der Glynmor-Kerzenzieherei in Gwynthor. Seine Werkstatt fertigt Alltagskerzen, Zierkerzen und Bestellungen für größere Haushalte.'],
  'person-2a5e7890': ['Castell Wyrm', 'Emlyn ist der erste Glynmor, dem als Vogt die Verwaltung des Hauses Wyrm anvertraut wurde.'],
  'person-64064dfd': ['Castell Wyrm', 'Eleri ist Küchenmeisterin im Haushalt des Hauses Wyrm.'],
  'person-f1b4fd4f': ['Gwynthor', 'Ilar dient in der Stadtwache.'],
  'person-e9652261': ['', 'Iestyn gehört zum älteren, unmittelbar an das Gründerpaar anschließenden Zweig. Er starb 1732.']
};

const roleLabels = {
  parents: 'Elternteil', partners: 'Ehe', children: 'Kind'
};

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function familyConnections(candidate, candidates) {
  return Object.entries(roleLabels).flatMap(([group, label]) => candidate.relationships[group].map(relation => {
    const person = candidates.get(relation.personId);
    const named = isNamedGlynmorPerson(person.recordedName);
    const unknownName = person.recordedName.startsWith('Unbekannt') ? person.recordedName : 'Name nicht überliefert';
    const detail = relation.type === 'claimed' ? 'Vermutete Abstammung über eine Überlieferungslücke'
      : relation.status === 'widowed' ? 'Ehe · verwitwet' : label;
    return {
      type: 'connection', name: named ? person.displayName : unknownName,
      image: person.portrait, imageFormat: 'portrait', detail
    };
  }));
}

function familyDocuments(candidate) {
  const documents = [{
    title: GLYNMOR_FAMILY_NAME, icon: `../Stammbäume/${GLYNMOR_EMBLEM}`,
    text: 'Personenkarte und Verwandtschaft im Stammbaum.', link: buildFamilyPersonViewUrl(candidate)
  }];
  if ([GLYNMOR_TUDUR.personId, GLYNMOR_MEERA.personId].includes(candidate.personId)) {
    documents.push({ title: 'Kerzenmacherei Glynmor', text: 'Laden, Ziehwerkstatt und Zierkammer in Gwynthor-Stadt.', link: GLYNMOR_MODULE_URL });
  }
  return documents;
}

function createBiography(candidate, candidates, existing) {
  const name = candidate.displayName;
  const original = existing?.biography;
  const body = original?.biography;
  const [location, authoredIntro] = occupationDetails[candidate.personId] || [];
  const intro = authoredIntro || `${name} gehört ${candidate.familyRole === 'married' ? 'durch Heirat ' : ''}zur Gwynthorer Bürgerfamilie Glynmor.`;
  const lifeStatus = candidate.status === 'dead' ? 'Verstorben' : candidate.status === 'alive' ? 'Lebend' : 'Ungeklärt';
  const stats = original?.stats || [
    ['Haus', 'Glynmor'], ['Stand', 'Bürgerlich'],
    ...(candidate.title ? [['Tätigkeit', candidate.title]] : []),
    ...(candidate.birth ? [['Geboren', candidate.birth]] : []),
    ...(candidate.death ? [['Gestorben', candidate.death]] : []),
    ...(location ? [['Ort', location]] : []),
    ['Lebensstatus', lifeStatus]
  ];
  return sanitizeCharacterBiographyForFirestore({ biography: {
    schema: 'aleria.biography-module', schemaVersion: 1,
    ...original, pageTitle: name, stats,
    biography: {
      biographyTitle: name, biographyText: `<p>${escapeHtml(intro)}</p>`, footer: `Personenakte · ${name}`,
      ...body, portrait: candidate.portrait, crestImage: `../Stammbäume/${GLYNMOR_EMBLEM}`,
      ...(body?.abilities ? { abilities: body.abilities.map(ability => ability.icon === '*' ? { ...ability, icon: '' } : ability) } : {}),
      connectionsTitle: 'Familie und Verwandtschaft',
      connections: [...(body?.connections || []), ...familyConnections(candidate, candidates)],
      documentsTitle: body?.documents?.length ? body.documentsTitle : 'Familienakte',
      documents: [...(body?.documents || []), ...familyDocuments(candidate)]
    }
  } }).biography;
}

export function buildGlynmorCharacterSources(record, meeraExport) {
  const candidates = createFamilyCandidates(record);
  const byId = new Map(candidates.map(person => [person.personId, person]));
  const namedIds = new Set(record.family.persons.filter(person => isNamedGlynmorPerson(person.name)).map(person => person.id));
  const meera = byId.get(GLYNMOR_MEERA.personId);
  if (meeraExport.type !== 'aleria-character' || meeraExport.character.id !== GLYNMOR_MEERA.characterId
      || meeraExport.character.name !== meera.displayName || meeraExport.character.title !== meera.title) {
    throw new Error('Meeras Einzelakte passt nicht zur geprüften Glynmor-Karte.');
  }
  return candidates.filter(person => namedIds.has(person.personId)).map(candidate => {
    const existing = candidate.personId === GLYNMOR_MEERA.personId ? meeraExport.character : null;
    const prior = existing && {
      ...existing,
      genealogy: { ...existing.genealogy, sex: existing.genealogy?.sex === 'unknown' ? '' : existing.genealogy?.sex }
    };
    const imported = buildImportedCharacter(candidate, prior, GLYNMOR_AUTHORED_AT);
    const knownLocation = occupationDetails[candidate.personId]?.[0];
    const id = existing?.id || candidate.worldPersonId;
    const age = candidate.birthYear && candidate.status === 'alive' ? ALERIA_CURRENT_YEAR - candidate.birthYear : null;
    return {
      type: 'aleria-character', version: existing ? meeraExport.version : 1, exportedAt: GLYNMOR_AUTHORED_AT,
      assignedTab: 'Gwynthor', mergeStrategy: 'replace-exported-fields',
      source: { familyId: record.id, personId: candidate.personId },
      character: {
        ...existing, ...imported, id,
        ...(Number.isInteger(age) ? { age } : {}),
        ...(existing ? { updatedAt: existing.updatedAt } : {}),
        currentLocation: imported.currentLocation || knownLocation || '',
        portrait: candidate.portrait || null,
        biography: createBiography(candidate, byId, existing)
      }
    };
  });
}
