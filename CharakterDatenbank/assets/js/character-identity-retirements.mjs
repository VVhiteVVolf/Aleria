// Explicitly reviewed document aliases, never inferred from a shared name.
// Retired documents remain intact; only the current profile resolves elsewhere.
export const CONFIRMED_CHARACTER_RETIREMENTS = Object.freeze([
  Object.freeze({
    legacyId: '6atOllMA637Z2VNAZAxf',
    canonicalCharacterId: 'person--haus-draig--gethin-1722-draig',
    canonicalWorldPersonId: 'person--haus-draig--gethin-1722-draig',
    canonicalName: 'Gethin Draig',
    confirmedOn: '2026-11-03',
    evidence: 'gethin-draig-zuordnung-2026-10-14'
  }),
  Object.freeze({
    legacyId: 'XWJ6XXwvpESHR3zAXkJx',
    canonicalCharacterId: '15ml9RhSvJPXof7z4qY3',
    canonicalWorldPersonId: 'person--haus-aderyn--gwendolyn-aderyn',
    canonicalName: 'Gwendolyn Draig',
    confirmedOn: '2026-11-03',
    evidence: 'registered-source-alias-and-matching-countess-profile-2026-11-03'
  }),
  Object.freeze({
    legacyId: 'uiKiMFXC6OEWOdDenbiM',
    canonicalCharacterId: '15ml9RhSvJPXof7z4qY3',
    canonicalWorldPersonId: 'person--haus-aderyn--gwendolyn-aderyn',
    canonicalName: 'Gwendolyn Draig',
    confirmedOn: '2026-11-03',
    evidence: 'registered-source-alias-countess-portrait-married-name-2026-11-03'
  }),
  Object.freeze({
    legacyId: 'mRCEkgEQByaxQWC0PJN5',
    canonicalCharacterId: 'fBCCU7G0r163GXUBqgYg',
    canonicalWorldPersonId: 'person--haus-gelyn--dehlia-gelyn',
    canonicalName: 'Dehlia Gelyn',
    confirmedOn: '2026-11-03',
    evidence: 'registered-source-alias-and-matching-chaplain-profile-2026-11-03'
  })
]);

const byLegacyId = new Map(CONFIRMED_CHARACTER_RETIREMENTS.map(row => [row.legacyId, row]));
export const getConfirmedCharacterRetirement = id => byLegacyId.get(String(id || '').trim()) || null;

export function characterRetirementMetadata(retirement) {
  return {
    schemaVersion: 1,
    status: 'merged',
    canonicalCharacterId: retirement.canonicalCharacterId,
    canonicalWorldPersonId: retirement.canonicalWorldPersonId,
    confirmedOn: retirement.confirmedOn,
    evidence: retirement.evidence
  };
}

export function applyConfirmedCharacterRetirement(character) {
  const retirement = getConfirmedCharacterRetirement(character?.id);
  if (!retirement) return character;
  const worldId = character.identity?.worldPersonId || character.genealogy?.worldPersonId || '';
  // A later, explicit different identity requires review rather than a forced merge.
  if (worldId && worldId !== retirement.canonicalWorldPersonId) return character;
  return { ...character, archived: true, mergeIdentity: characterRetirementMetadata(retirement) };
}
