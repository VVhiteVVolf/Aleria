import { HttpsError } from 'firebase-functions/v2/https';

export async function requireFamilyRole({ request, database, familyId, roles }) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const globalRole = request.auth.token.aleriaRole;
  if (['admin', 'archivist'].includes(globalRole)) return globalRole;
  const member = await database.doc(`familyWorkspaces/${familyId}/members/${request.auth.uid}`).get();
  const role = member.exists ? member.data().role : '';
  if (!roles.includes(role)) throw new HttpsError('permission-denied', 'Für diese Aktion fehlt die erforderliche Familienrolle.');
  return role;
}
