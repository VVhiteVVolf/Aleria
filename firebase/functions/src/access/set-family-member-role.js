import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { requireFamilyRole } from './family-access.js';

const ROLES = new Set(['viewer', 'editor', 'reviewer', 'admin']);

export const setFamilyMemberRole = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  enforceAppCheck: false
}, async request => {
  const familyId = String(request.data?.familyId || '').trim();
  const uid = String(request.data?.uid || '').trim();
  const role = String(request.data?.role || '').trim();
  if (!familyId || !uid || !ROLES.has(role)) throw new HttpsError('invalid-argument', 'Familie, Benutzer und Rolle sind erforderlich.');
  const database = getFirestore('family-trees');
  await requireFamilyRole({ request, database, familyId, roles: ['admin'] });
  if (uid === request.auth.uid && role !== 'admin') {
    throw new HttpsError('failed-precondition', 'Die eigene Administratorrolle kann nicht hierüber entzogen werden.');
  }
  await database.doc(`familyWorkspaces/${familyId}/members/${uid}`).set({
    uid,
    role,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid
  }, { merge: true });
  return { familyId, uid, role };
});
