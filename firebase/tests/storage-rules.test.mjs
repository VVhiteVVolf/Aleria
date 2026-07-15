import { readFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { getBytes, ref, uploadBytes } from 'firebase/storage';

const PROJECT_ID = 'aleria-family-storage-rules-test';
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      rules: await readFile(new URL('../storage.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 9199
    }
  });
});

after(async () => environment?.cleanup());

test.beforeEach(async () => {
  await environment.clearStorage();
});

test('verweigert direkte Browser-Uploads auch für angemeldete Benutzer', async () => {
  const storage = environment.authenticatedContext('editor').storage();
  const image = ref(storage, 'family-assets/haus-test/asset-1/original.png');
  await assertFails(uploadBytes(image, new Uint8Array([137, 80, 78, 71]), {
    contentType: 'image/png',
    customMetadata: {
      familyId: 'haus-test', assetId: 'asset-1', visibility: 'private', kind: 'portrait'
    }
  }));
});

test('verweigert fremde Dateitypen ebenfalls', async () => {
  const storage = environment.authenticatedContext('editor').storage();
  const file = ref(storage, 'family-assets/haus-test/asset-2/original.txt');
  await assertFails(uploadBytes(file, new Uint8Array([1, 2, 3]), {
    contentType: 'text/plain',
    customMetadata: {
      familyId: 'haus-test', assetId: 'asset-2', visibility: 'private', kind: 'portrait'
    }
  }));
});

test('macht nur ausdrücklich öffentliche Assets anonym lesbar', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    const storage = context.storage();
    await uploadBytes(ref(storage, 'family-assets/haus-test/public/original.png'), new Uint8Array([1]), {
      contentType: 'image/png',
      customMetadata: { familyId: 'haus-test', assetId: 'public', visibility: 'public' }
    });
    await uploadBytes(ref(storage, 'family-assets/haus-test/private/original.png'), new Uint8Array([1]), {
      contentType: 'image/png',
      customMetadata: { familyId: 'haus-test', assetId: 'private', visibility: 'private' }
    });
  });
  const storage = environment.unauthenticatedContext().storage();
  await assertSucceeds(getBytes(ref(storage, 'family-assets/haus-test/public/original.png')));
  await assertFails(getBytes(ref(storage, 'family-assets/haus-test/private/original.png')));
});
