import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import {
  connectStorageEmulator,
  getStorage
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js';
import {
  connectFunctionsEmulator,
  getFunctions
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-functions.js';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js';
import { FIREBASE_PLATFORM_CONFIG, readFirebaseRuntimeOptions } from './firebase-config.js';

function initializeDatabase(app, databaseId) {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    }, databaseId);
  } catch (error) {
    if (error?.code !== 'failed-precondition') throw error;
    return getFirestore(app, databaseId);
  }
}

export function createFirebaseClient({
  config = FIREBASE_PLATFORM_CONFIG,
  runtimeOptions = readFirebaseRuntimeOptions()
} = {}) {
  let servicesPromise = null;

  async function initialize() {
    if (!runtimeOptions.enabled) return null;
    if (servicesPromise) return servicesPromise;
    servicesPromise = Promise.resolve().then(async () => {
      const app = getApps().some(item => item.name === config.appName)
        ? getApp(config.appName)
        : initializeApp(config.app, config.appName);
      const auth = getAuth(app);
      const db = initializeDatabase(app, config.databaseId);
      const storage = getStorage(app);
      const functions = getFunctions(app, config.functionsRegion);

      await setPersistence(auth, browserLocalPersistence);

      if (runtimeOptions.useEmulators) {
        connectAuthEmulator(auth, runtimeOptions.authEmulatorUrl, { disableWarnings: true });
        connectFirestoreEmulator(db, runtimeOptions.firestoreEmulatorHost, runtimeOptions.firestoreEmulatorPort);
        connectStorageEmulator(storage, runtimeOptions.storageEmulatorHost, runtimeOptions.storageEmulatorPort);
        connectFunctionsEmulator(functions, runtimeOptions.functionsEmulatorHost, runtimeOptions.functionsEmulatorPort);
      } else if (runtimeOptions.appCheckSiteKey) {
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(runtimeOptions.appCheckSiteKey),
          isTokenAutoRefreshEnabled: true
        });
      }

      return Object.freeze({ app, auth, db, storage, functions, config, runtimeOptions });
    });
    return servicesPromise;
  }

  return Object.freeze({
    initialize,
    isEnabled: () => runtimeOptions.enabled,
    getRuntimeOptions: () => runtimeOptions
  });
}
