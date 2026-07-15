import {
  FAMILY_SCHEMA,
  FAMILY_SCHEMA_VERSION,
  assertValidFamily,
  normalizeFamily
} from '../domain/family-schema.js';

function legacySex(gender) {
  if (gender === 'm') return 'male';
  if (gender === 'f') return 'female';
  return 'unknown';
}

function legacyPartnershipType(type) {
  if (type === 'married') return 'marriage';
  if (type === 'affair') return 'affair';
  if (type === 'forced') return 'forced';
  return 'union';
}

function legacyRole(lineType) {
  return ['core', 'married', 'bastard', 'affair', 'forced'].includes(lineType) ? lineType : 'core';
}

export function migrateLegacyFamily(legacy) {
  const persons = Array.isArray(legacy?.persons) ? legacy.persons : [];
  const couples = Array.isArray(legacy?.couples) ? legacy.couples : [];
  const migrated = {
    schema: FAMILY_SCHEMA,
    schemaVersion: FAMILY_SCHEMA_VERSION,
    document: {
      id: 'imported-family-tree',
      title: String(legacy?.house || 'Importierter Stammbaum'),
      motto: String(legacy?.motto || ''),
      description: 'Aus dem früheren Dynastieplaner migriert.',
      emblem: ''
    },
    persons: persons.map(person => ({
      id: String(person.id),
      name: String(person.name || 'Unbenannte Person'),
      title: String(person.rank || ''),
      sex: legacySex(person.gender),
      status: person.status === 'dead' || person.death ? 'dead' : 'alive',
      birth: String(person.birth ?? ''),
      death: String(person.death ?? ''),
      portrait: String(person.portrait || ''),
      portraitPlaceholder: 'auto',
      houseId: '',
      familyRole: legacyRole(person.lineType),
      tags: String(person.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
      notes: String(person.notes || ''),
      extensions: { legacyRank: person.rank || '' }
    })),
    partnerships: couples.flatMap(couple => {
      const firstId = String(couple.parentA || couple.personA || '');
      const secondId = String(couple.parentB || couple.personB || '');
      if (!firstId || !secondId) return [];
      return [{
        id: `partnership-${couple.id}`,
        participantIds: [firstId, secondId],
        type: legacyPartnershipType(couple.relationshipType || couple.coupleType),
        status: 'active',
        start: '',
        end: '',
        certainty: 'confirmed',
        visibility: 'public',
        notes: '',
        extensions: { legacyCoupleId: couple.id }
      }];
    }),
    parentages: couples.flatMap(couple => {
      const parentIds = [couple.parentA || couple.personA, couple.parentB || couple.personB]
        .map(value => String(value || ''))
        .filter(Boolean);
      if (!parentIds.length) return [];
      return (Array.isArray(couple.children) ? couple.children : []).map((childId, childIndex) => {
        const child = persons.find(person => String(person.id) === String(childId));
        const partnershipExists = parentIds.length > 1;
        return {
          id: `parentage-${couple.id}-${childIndex + 1}`,
          childId: String(childId),
          parentIds,
          partnershipId: partnershipExists ? `partnership-${couple.id}` : '',
          type: 'biological',
          legitimacy: child?.lineType === 'bastard' ? 'illegitimate' : 'legitimate',
          certainty: 'confirmed',
          visibility: 'public',
          notes: '',
          extensions: { legacyCoupleId: couple.id }
        };
      });
    }),
    houses: [],
    view: {
      focusPersonId: persons[0]?.id ? String(persons[0].id) : '',
      orientation: 'vertical',
      ancestorDepth: 5,
      descendantDepth: 5,
      showSiblings: true
    },
    extensions: { migratedFrom: 'dynastieplaner-v1' }
  };
  return assertValidFamily(migrated).family;
}

export function parseFamilyJson(serialized) {
  const parsed = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
  if (parsed?.schema === FAMILY_SCHEMA) return assertValidFamily(parsed).family;
  if (Array.isArray(parsed?.persons) && Array.isArray(parsed?.couples)) return migrateLegacyFamily(parsed);
  return assertValidFamily(normalizeFamily(parsed)).family;
}

export function serializeFamily(family) {
  return JSON.stringify(assertValidFamily(family).family, null, 2);
}

export function downloadFamilyJson(family, documentRef = globalThis.document) {
  const serialized = serializeFamily(family);
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  const safeName = family.document.title.toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '') || 'stammbaum';
  anchor.href = url;
  anchor.download = `${safeName}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
