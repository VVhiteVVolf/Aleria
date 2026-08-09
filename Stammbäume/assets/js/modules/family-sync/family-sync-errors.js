export class FamilyRevisionConflictError extends Error {
  constructor(expectedRevision, actualRevision, familyId = '') {
    super(`Der Stammbaum wurde zwischenzeitlich geändert (lokal ${expectedRevision}, Server ${actualRevision}).`);
    this.name = 'FamilyRevisionConflictError';
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
    this.familyId = String(familyId || '');
  }
}

export function describeFamilySyncError(error) {
  const code = String(error?.code || error?.cause?.code || '');
  if (code.includes('unavailable') || code.includes('network')) {
    return 'GitHub ist derzeit nicht erreichbar. Der Entwurf bleibt lokal erhalten.';
  }
  return error?.message || 'Online-Speichern fehlgeschlagen. Der Entwurf bleibt lokal erhalten.';
}
