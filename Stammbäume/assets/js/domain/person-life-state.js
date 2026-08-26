export function isPersonRecordedDead(person) {
  return person?.status === 'dead' || Boolean(String(person?.death || '').trim());
}

export function normalizeEditedPersonLifeState({ status, death }) {
  const normalizedStatus = String(status || 'unknown');
  if (normalizedStatus !== 'dead') {
    return Object.freeze({ status: normalizedStatus, death: '' });
  }
  return Object.freeze({
    status: 'dead',
    death: String(death || '').trim() || '????'
  });
}
