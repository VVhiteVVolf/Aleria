const PROTECTED_RECORD_SECTIONS = Object.freeze(['combatProfile', 'inventory']);
const PROTECTED_RECORD_SECTION_SET = new Set(PROTECTED_RECORD_SECTIONS);

function sectionRevision(record, section) {
  const parsed = Number(record?.[section]?.revision);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

export function getNextProtectedRecordRevision(record = {}, requestedRevision = Date.now()) {
  const requested = Number(requestedRevision);
  const requestedFloor = Number.isFinite(requested) && requested > 0
    ? Math.trunc(requested)
    : Date.now();
  const highestCurrent = PROTECTED_RECORD_SECTIONS.reduce(
    (highest, section) => Math.max(highest, sectionRevision(record, section)),
    0
  );
  return Math.max(requestedFloor, highestCurrent + 1);
}

// Firestore akzeptiert nicht gleichzeitig `inventory` und `inventory.revision` in demselben
// Update. Deshalb stempelt diese Funktion eine vollstaendig ersetzte Sektion direkt in deren
// Objekt, waehrend sie bei verschachtelten Updates einen Dot-Path ergaenzt. Alle serverseitigen
// Mechanik-Schreibpfade verwenden damit dieselbe Konfliktschutzregel wie der Charaktereditor.
export function withProtectedRecordRevisions(record, values, changedSections, requestedRevision = Date.now()) {
  const sections = [...new Set(Array.isArray(changedSections) ? changedSections : [])];
  sections.forEach(section => {
    if (!PROTECTED_RECORD_SECTION_SET.has(section)) {
      throw new TypeError(`Unbekannter geschuetzter Datensatzbereich: ${section}`);
    }
  });
  if (!sections.length) return { ...(values || {}) };

  const revision = getNextProtectedRecordRevision(record, requestedRevision);
  const stamped = { ...(values || {}) };
  sections.forEach(section => {
    if (Object.prototype.hasOwnProperty.call(stamped, section)) {
      const sectionValue = stamped[section];
      if (!sectionValue || typeof sectionValue !== 'object' || Array.isArray(sectionValue)) {
        throw new TypeError(`${section} muss fuer eine Revisionsstempelung ein Objekt sein.`);
      }
      stamped[section] = { ...sectionValue, revision };
      return;
    }
    stamped[`${section}.revision`] = revision;
  });
  return stamped;
}

export const protectedRecordRevisionInternals = Object.freeze({
  PROTECTED_RECORD_SECTIONS,
  sectionRevision
});
