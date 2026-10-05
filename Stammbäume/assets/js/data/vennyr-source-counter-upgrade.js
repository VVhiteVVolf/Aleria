import { VENNYR_REMAINING_SOURCE_CATALOG as SOURCE } from './vennyr-remaining-source-catalog.js';
import { VENNYR_SOURCE_COUNTER_PATCHES } from './vennyr-source-counter-patches.js';
import { createFamilyPerson, createMarriage, createMarriedAwayBranch } from './family-record-builders.js';
import { sourceManagedFields as managedFields, preserveSourceEntityBoundaries as preservePreviousEntityBoundaries } from './source-family-field-upgrade.js';

function sourcePersonFields(personId) {
  const person = SOURCE.persons[personId];
  return { ...person, portrait: person.portraitPlaceholder === 'child' ? '' : SOURCE.portraits[personId] || '' };
}

// Nutzerklärung: Die Meinir-Ehe gehört zu Ilwen, die neue Drewi-Ehe zu Illtyd.
// Bestehende Ehe-/Personen-IDs bleiben erhalten; Ilwen erhält eine eigene Welt-ID.
function withWalwrsDrewiSplit(family, revision) {
  const meinirPair = Object.values(SOURCE.partnerships).find(pair => pair.participantIds.includes('ilwen-drewi'));
  const illtydPair = Object.values(SOURCE.partnerships).find(pair => pair.participantIds.includes('illtyd-drewi'));
  if (family.persons.some(person => person.id === 'ilwen-drewi')) return family;
  const ilwen = createFamilyPerson({ ...sourcePersonFields('ilwen-drewi'), familyRole: 'married' });
  const persons = [...family.persons, ilwen].map(person => person.id === 'gwendolen-walwrs' ? {
    ...person, title: 'Wegverheiratet an die Häuser Gwaedlyd und Drewi',
    extensions: managedFields(person.extensions, ['title'], revision)
  } : person);
  const partnerships = [...family.partnerships.map(pair => pair.id === meinirPair.id ? {
    ...pair, participantIds: meinirPair.participantIds,
    extensions: managedFields(pair.extensions, ['participantIds'], revision)
  } : pair), { ...createMarriage(illtydPair.id, ...illtydPair.participantIds), ...illtydPair }];
  const cadetBranches = [...family.cadetBranches, createMarriedAwayBranch({
    id: 'married-away-walwrs-illtyd-gwendolen-drewi', name: 'Haus Drewi', houseId: 'house-drewi',
    targetFamilyId: 'haus-drewi', parentPartnershipId: illtydPair.id,
    emblem: family.houses.find(house => house.id === 'house-drewi')?.emblem || '',
    extensions: { chartAlignBelowPartnership: true, registryManagedExtensionFields: ['chartAlignBelowPartnership'] }
  })];
  return { ...family, persons, partnerships, cadetBranches };
}

/** Apply only the explicitly identified fields in existing counter-records. */
export function withVennyrSourceCounterUpgrade(family) {
  const patch = VENNYR_SOURCE_COUNTER_PATCHES[family.document.id];
  if (!patch) return family;
  if (family.extensions.vennyrSourceCounterInventory === SOURCE.inventory && family.extensions.sourceRevision >= patch.revision) return family;
  const previous = family;
  family = preservePreviousEntityBoundaries(family);
  let changed = false;
  const persons = family.persons.map(person => {
    const fields = patch.persons[person.id];
    if (!fields) return person;
    const source = sourcePersonFields(person.id);
    if (source.worldPersonId !== person.worldPersonId) throw new Error(`Abweichende Quellenidentität ${person.id}.`);
    if (fields.every(field => person[field] === source[field])) return person;
    changed = true;
    return { ...person, ...Object.fromEntries(fields.map(field => [field, source[field]])),
      extensions: managedFields(person.extensions, fields, patch.revision) };
  });
  let result = changed ? { ...family, persons } : family;
  if (family.document.id === 'haus-walwrs') result = withWalwrsDrewiSplit(result, patch.revision);
  if (result === family) return previous;
  return { ...result, extensions: { ...result.extensions,
    sourceRevision: Math.max(Number(result.extensions.sourceRevision) || 0, patch.revision),
    registryManagedEntitySourceRevision: Number.isInteger(previous.extensions.registryManagedEntitySourceRevision)
      ? previous.extensions.registryManagedEntitySourceRevision : Number(previous.extensions.sourceRevision) || 0,
    vennyrSourceCounterInventory: SOURCE.inventory,
    registryManagedExtensionFields: [...new Set([...(result.extensions.registryManagedExtensionFields || []), 'vennyrSourceCounterInventory'])]
  } };
}
