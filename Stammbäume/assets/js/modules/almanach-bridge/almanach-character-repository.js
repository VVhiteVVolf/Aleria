import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

export function createAlmanachCharacterRepository(firebaseClient) {
  async function database() {
    const services = await firebaseClient.initialize();
    if (!services?.almanachDb) throw new Error('Die Almanach-Datenbank ist in dieser Umgebung nicht verfügbar.');
    return services.almanachDb;
  }

  async function loadCharacters() {
    const almanachDb = await database();
    const snapshot = await getDocs(query(collection(almanachDb, 'characters'), orderBy('name', 'asc')));
    return snapshot.docs.map(item => Object.freeze({ id: item.id, ...item.data() }));
  }

  async function linkWorldPersonId(characterId, worldPersonId) {
    const safeCharacterId = String(characterId || '').trim();
    const safeWorldPersonId = String(worldPersonId || '').trim();
    if (!safeCharacterId || !safeWorldPersonId) {
      throw new Error('Charakter und Personen-ID werden für die Verknüpfung benötigt.');
    }
    const almanachDb = await database();
    await updateDoc(doc(almanachDb, 'characters', safeCharacterId), {
      'identity.worldPersonId': safeWorldPersonId,
      'genealogy.worldPersonId': safeWorldPersonId,
      updatedAt: new Date().toISOString()
    });
  }

  return Object.freeze({ loadCharacters, linkWorldPersonId });
}
