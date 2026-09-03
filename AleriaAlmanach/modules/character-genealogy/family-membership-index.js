import { createWorldPersonId } from './genealogy-mapping.js?v=20260903-character-register-v2';
import { listGenealogyFamilies } from './genealogy-source-repository.js';

function cleanText(value) {
  return String(value || '').trim();
}

function resolveFamilyAssetPath(value) {
  const source = cleanText(value);
  if (/^assets\//i.test(source)) return `../Stammbäume/${source}`;
  return source;
}

function createMembership(record, person) {
  const familyId = cleanText(record?.id || record?.family?.document?.id);
  const familyTitle = cleanText(record?.title || record?.family?.document?.title || familyId);
  const folderPath = Array.isArray(record?.folderPath)
    ? record.folderPath.map(cleanText).filter(Boolean)
    : [];
  const emblem = resolveFamilyAssetPath(
    record?.emblem
    || record?.family?.document?.emblem
    || record?.houseProfile?.emblem
  );
  return Object.freeze({
    familyId,
    familyTitle,
    personId: cleanText(person?.id),
    familyRole: cleanText(person?.familyRole),
    emblem,
    folderPath: Object.freeze(folderPath),
    sortPath: [...folderPath, familyTitle].join(' > ')
  });
}

function compareMemberships(first, second) {
  return first.sortPath.localeCompare(second.sortPath, 'de', {
    sensitivity: 'base',
    numeric: true
  });
}

export function createCharacterFamilyMembershipIndex(records = []) {
  const byWorldPersonId = new Map();
  const familiesById = new Map();

  (Array.isArray(records) ? records : []).forEach(record => {
    const familyId = cleanText(record?.id || record?.family?.document?.id);
    if (!familyId) return;
    familiesById.set(familyId, createMembership(record, null));

    (record?.family?.persons || []).forEach(person => {
      const worldPersonId = createWorldPersonId(familyId, person);
      if (!worldPersonId) return;
      const memberships = byWorldPersonId.get(worldPersonId) || [];
      const membership = createMembership(record, person);
      const existingIndex = memberships.findIndex(item => item.familyId === familyId);
      if (existingIndex >= 0) memberships[existingIndex] = membership;
      else memberships.push(membership);
      memberships.sort(compareMemberships);
      byWorldPersonId.set(worldPersonId, memberships);
    });
  });

  return Object.freeze({ byWorldPersonId, familiesById });
}

function getCharacterWorldPersonIds(character) {
  return Array.from(new Set([
    cleanText(character?.identity?.worldPersonId),
    cleanText(character?.genealogy?.worldPersonId)
  ].filter(Boolean)));
}

export function getCharacterFamilyMemberships(character, index) {
  const resolvedIndex = index || createCharacterFamilyMembershipIndex([]);
  const memberships = new Map();
  const remember = membership => {
    if (!membership?.familyId) return;
    const current = memberships.get(membership.familyId);
    memberships.set(membership.familyId, Object.freeze({
      ...(current || {}),
      ...membership,
      personId: membership.personId || current?.personId || ''
    }));
  };

  getCharacterWorldPersonIds(character).forEach(worldPersonId => {
    (resolvedIndex.byWorldPersonId.get(worldPersonId) || []).forEach(remember);
  });

  (character?.genealogy?.sources || []).forEach(source => {
    const familyId = cleanText(source?.familyId);
    if (!familyId) return;
    const family = resolvedIndex.familiesById.get(familyId);
    remember({
      ...(family || {
        familyId,
        familyTitle: familyId,
        emblem: '',
        folderPath: [],
        sortPath: familyId
      }),
      personId: cleanText(source?.personId)
    });
  });

  return Array.from(memberships.values()).sort(compareMemberships);
}

const defaultIndex = createCharacterFamilyMembershipIndex(listGenealogyFamilies());

export function getDefaultCharacterFamilyMemberships(character) {
  return getCharacterFamilyMemberships(character, defaultIndex);
}
