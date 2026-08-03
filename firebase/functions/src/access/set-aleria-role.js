import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const ALERIA_ROLES = new Set(['player', 'editor', 'moderator', 'admin']);

export function validateAleriaRole(role) {
  const normalized = String(role || '').trim().toLowerCase();
  if (!ALERIA_ROLES.has(normalized)) {
    throw new HttpsError('invalid-argument', 'Unbekannte Aleria-Rolle.');
  }
  return normalized;
}

export const setAleriaRole = onCall({
  region: 'europe-west1',
  maxInstances: 2,
  enforceAppCheck: true
}, async request => {
  if (!request.auth || request.auth.token?.aleriaRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Nur Aleria-Administratoren dürfen globale Rollen vergeben.');
  }
  const uid = String(request.data?.uid || '').trim();
  const role = validateAleriaRole(request.data?.role);
  if (!uid || uid.length > 128) throw new HttpsError('invalid-argument', 'Eine gültige Benutzer-ID ist erforderlich.');
  if (uid === request.auth.uid && role !== 'admin') {
    throw new HttpsError('failed-precondition', 'Die eigene Administratorrolle kann hier nicht entzogen werden.');
  }

  const target = await getAuth().getUser(uid);
  const claims = { ...(target.customClaims || {}), aleriaRole: role };
  await getAuth().setCustomUserClaims(uid, claims);
  await getFirestore().doc(`aleria_roles/${uid}`).set({
    uid,
    role,
    updatedBy: request.auth.uid,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { uid, role, tokenRefreshRequired: true };
});
