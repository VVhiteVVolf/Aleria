import { normalizeFamily } from '../../domain/family-schema.js';

function portraitsByWorldPersonId(family) {
  return new Map((family?.persons || []).flatMap(person => {
    const worldPersonId = String(person.worldPersonId || '');
    return worldPersonId ? [[worldPersonId, String(person.portrait || '')]] : [];
  }));
}

function changedPortraits(previousFamily, currentFamily) {
  if (!previousFamily || previousFamily.document?.id !== currentFamily?.document?.id) {
    return new Map();
  }
  const previousPortraits = portraitsByWorldPersonId(previousFamily);
  return new Map((currentFamily.persons || []).flatMap(person => {
    const worldPersonId = String(person.worldPersonId || '');
    if (!worldPersonId || !previousPortraits.has(worldPersonId)) return [];
    const portrait = String(person.portrait || '');
    return previousPortraits.get(worldPersonId) === portrait
      ? []
      : [[worldPersonId, portrait]];
  }));
}

/**
 * Projects portrait changes onto every locally known family snapshot that
 * contains the same world person. The caller persists the returned records as
 * one related batch, so a later online save cannot publish only one copy.
 */
export function createWorldPersonPortraitSyncChanges({
  previousFamily,
  currentFamily,
  familyRecords = []
}) {
  const portraitChanges = changedPortraits(previousFamily, currentFamily);
  if (!portraitChanges.size) return Object.freeze([]);

  const currentFamilyId = currentFamily.document.id;
  const changesByFamilyId = new Map();
  const records = typeof familyRecords === 'function' ? familyRecords() : familyRecords;
  (records || []).forEach(record => {
    const family = record?.family || record;
    const familyId = String(family?.document?.id || '');
    if (!familyId || familyId === currentFamilyId || changesByFamilyId.has(familyId)) return;

    let changed = false;
    const persons = family.persons.map(person => {
      const worldPersonId = String(person.worldPersonId || '');
      if (!portraitChanges.has(worldPersonId)) return person;
      const portrait = portraitChanges.get(worldPersonId);
      if (String(person.portrait || '') === portrait) return person;
      changed = true;
      return { ...person, portrait };
    });
    if (!changed) return;

    changesByFamilyId.set(familyId, Object.freeze({
      family: normalizeFamily({ ...family, persons }),
      baseFamily: family
    }));
  });

  return Object.freeze([...changesByFamilyId.values()]);
}
