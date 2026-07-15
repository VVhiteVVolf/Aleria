export const FIREBASE_PLATFORM_CONFIG = Object.freeze({
  app: Object.freeze({
    apiKey: 'AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg',
    authDomain: 'aleriaprojekt.firebaseapp.com',
    projectId: 'aleriaprojekt',
    storageBucket: 'aleriaprojekt.firebasestorage.app',
    messagingSenderId: '377039244960',
    appId: '1:377039244960:web:27ab9971f25657224403c5'
  }),
  appName: 'aleria-family-trees',
  databaseId: 'family-trees',
  functionsRegion: 'europe-west1',
  storageRoot: 'family-assets'
});

function metaContent(documentRef, name) {
  return documentRef?.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
}

export function readFirebaseRuntimeOptions(
  documentRef = globalThis.document,
  locationRef = globalThis.location
) {
  const host = String(locationRef?.hostname || '').toLocaleLowerCase('de');
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const query = new URLSearchParams(locationRef?.search || '');
  return Object.freeze({
    enabled: metaContent(documentRef, 'aleria-firebase-enabled') !== 'false',
    appCheckSiteKey: metaContent(documentRef, 'aleria-app-check-site-key'),
    useEmulators: isLocalHost && query.get('firebaseEmulator') === '1',
    firestoreEmulatorHost: metaContent(documentRef, 'aleria-firestore-emulator-host') || '127.0.0.1',
    firestoreEmulatorPort: Number(metaContent(documentRef, 'aleria-firestore-emulator-port') || 8080),
    authEmulatorUrl: metaContent(documentRef, 'aleria-auth-emulator-url') || 'http://127.0.0.1:9099',
    storageEmulatorHost: metaContent(documentRef, 'aleria-storage-emulator-host') || '127.0.0.1',
    storageEmulatorPort: Number(metaContent(documentRef, 'aleria-storage-emulator-port') || 9199),
    functionsEmulatorHost: metaContent(documentRef, 'aleria-functions-emulator-host') || '127.0.0.1',
    functionsEmulatorPort: Number(metaContent(documentRef, 'aleria-functions-emulator-port') || 5001)
  });
}
