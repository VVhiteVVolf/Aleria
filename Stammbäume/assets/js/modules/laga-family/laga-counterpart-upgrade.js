import { preserveSourceEntityBoundaries, sourceManagedFields } from '../../data/source-family-field-upgrade.js';

const CORRECTIONS = Object.freeze({
  'haus-gallchobhair': {
    personId: 'laoise-laga', birth: '1125', revision: 11,
    fields: { worldPersonId: 'person--haus-laga--laoise-1125-laga' }
  },
  'haus-chulainn': {
    personId: 'lugaid-1690-laga', birth: '1690', revision: 8,
    fields: { sex: 'male' }
  },
  'haus-durthacht': {
    personId: 'lagaid-1689-laga', birth: '1689', revision: 4,
    fields: { sex: 'male' }
  }
});

export const LAGA_COUNTERPART_REVISIONS = Object.freeze(Object.fromEntries(
  Object.entries(CORRECTIONS).map(([familyId, correction]) => [familyId, correction.revision])
));

// Nur die kollidierende historische Identität und die ausdrückliche neue
// Einordnung der beiden Brüder korrigieren. Personen- und Beziehungs-IDs bleiben erhalten.
export function withLagaCounterpartUpgrade(family) {
  const correction = CORRECTIONS[family.document.id];
  if (!correction) return family;
  const person = family.persons.find(entry => entry.id === correction.personId);
  if (!person || person.birth !== correction.birth) {
    throw new Error(`Lága-Gegenakte passt nicht zur belegten Person: ${family.document.id}.`);
  }
  if (Object.entries(correction.fields).every(([key, value]) => person[key] === value)) return family;
  if (correction.fields.worldPersonId && ![
    'person--haus-laga--laoise-laga', correction.fields.worldPersonId
  ].includes(person.worldPersonId)) throw new Error('Unerwartete Identität der historischen Laoise Lága.');
  const bounded = preserveSourceEntityBoundaries(family);
  return {
    ...bounded,
    persons: bounded.persons.map(entry => entry.id !== person.id ? entry : {
      ...entry, ...correction.fields,
      extensions: sourceManagedFields(entry.extensions, Object.keys(correction.fields), correction.revision)
    }),
    extensions: {
      ...bounded.extensions,
      sourceRevision: Math.max(Number(family.extensions.sourceRevision) || 0, correction.revision),
      registryManagedEntitySourceRevision: family.extensions.registryManagedEntitySourceRevision
        ?? family.extensions.sourceRevision,
      lagaCounterpartRevision: 1,
      registryManagedExtensionFields: [...new Set([
        ...(family.extensions.registryManagedExtensionFields || []), 'lagaCounterpartRevision'
      ])]
    }
  };
}
