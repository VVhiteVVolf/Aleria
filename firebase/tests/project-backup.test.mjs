import assert from 'node:assert/strict';
import test from 'node:test';
import { encryptProjectBackup, decryptProjectBackup } from '../scripts/backup/project-backup-crypto.mjs';
import { createGoogleBackupReader } from '../scripts/backup/project-backup-source.mjs';

test('private backup preserves typed fields and binary content and rejects tampering', async () => {
  const payload = { fields: { roll: { integerValue: '9223372036854775807' }, time: { timestampValue: '2026-10-12T13:00:00.123456789Z' }, data: { bytesValue: 'AAH/' } }, private: 'not-for-github' };
  const copyKey = async bytes => Buffer.from(bytes);
  const archive = await encryptProjectBackup(payload, copyKey);
  assert(!archive.includes(Buffer.from('not-for-github')));
  assert.deepEqual(await decryptProjectBackup(archive, copyKey), payload);
  const damaged = Buffer.from(archive); damaged[damaged.length - 1] ^= 1;
  await assert.rejects(decryptProjectBackup(damaged, copyKey));
});

test('recursive export includes subcollections below missing parents at one read time', async () => {
  const root = 'projects/test/databases/(default)/documents';
  const readTime = new Date().toISOString();
  const visited = [];
  const fetchRef = async (url, options) => {
    const target = new URL(url); const pathname = decodeURIComponent(target.pathname); visited.push(pathname);
    let data;
    if (pathname.endsWith(':listCollectionIds')) {
      assert.equal(JSON.parse(options.body).readTime, readTime);
      data = { collectionIds: pathname.endsWith('/documents:listCollectionIds') ? ['locks'] : pathname.endsWith('/locks/characters:listCollectionIds') ? ['records'] : [] };
    } else {
      assert.equal(target.searchParams.get('readTime'), readTime);
      assert.equal(target.searchParams.get('showMissing'), 'true');
      data = { documents: pathname.endsWith('/locks') ? [{ name: `${root}/locks/characters` }] : [{ name: `${root}/locks/characters/records/hero`, fields: { active: { booleanValue: true } }, updateTime: readTime }] };
    }
    return new Response(JSON.stringify(data), { status: 200 });
  };
  const reader = createGoogleBackupReader({ accessToken: 'test', project: 'test', fetchRef });
  const snapshot = await reader.firestore('(default)', readTime);
  assert.deepEqual(snapshot.documents.map(item => item.name), [`${root}/locks/characters/records/hero`]);
  assert.equal(snapshot.collections['locks/characters/records'], 1);
  assert(visited.some(pathname => pathname.endsWith('/records/hero:listCollectionIds')));
});
