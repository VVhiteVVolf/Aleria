import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = fs.readFileSync(
  path.join(root, 'modules', 'characters', 'character-avatar-import.js'),
  'utf8'
);
const html = fs.readFileSync(path.join(root, 'AleriaAlmanach.html'), 'utf8');
const profileSource = fs.readFileSync(
  path.join(root, 'modules', 'characters', 'character-profile.js'),
  'utf8'
);

const context = vm.createContext({
  URL,
  normalizeImageUrlForStorage(value) {
    const raw = String(value || '').trim();
    return /^https:\/\//.test(raw) ? raw : null;
  }
});
for (const name of ['image-library-model', 'image-library-import']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'modules', 'image-library', `${name}.js`), 'utf8'), context);
}
vm.runInContext(source, context, { filename: 'character-avatar-import.js' });

async function run() {
  assert.equal(vm.runInContext('CHARACTER_AVATAR_LIMIT', context), 160);
  assert.match(profileSource, /const MAX_EMOTES = CHARACTER_AVATAR_LIMIT;/);
  assert.match(html, /id="cp-avatar-limit">160<\/span>/);
  assert.match(html, /data-char-profile-action="import-avatar-links"/);
  assert.match(html, /data-char-profile-action="paste-avatar-links"/);

  context.testSlots = Array.from({ length: 160 }, () => null);
  context.testSlots[0] = { img: 'https://img.example/already.png', label: 'Schon da' };
  context.testRaw = [
    'https://img.example/already.png',
    'https://img.example/happy-face.png',
    'https://img.example/slow.png'
  ].join('\n');

  const result = await vm.runInContext(`buildCharacterAvatarImport({
    rawValue: testRaw,
    slots: testSlots
  })`, context);
  assert.equal(result.addedCount, 2);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.slots[1].img, 'https://img.example/happy-face.png');
  assert.equal(result.slots[1].label, 'happy face');

  context.fullSlots = Array.from({ length: 160 }, (_, index) => ({
    img: `https://img.example/${index}.png`,
    label: String(index)
  }));
  const fullResult = await vm.runInContext(`buildCharacterAvatarImport({
    rawValue: 'https://img.example/overflow.png',
    slots: fullSlots
  })`, context);
  assert.equal(fullResult.addedCount, 0);
  assert.equal(fullResult.skippedCapacityCount, 1);
  assert.equal(fullResult.slots.length, 160);

  console.log('Character-Avatar-Import: 160er-Limit, Mehrfachimport, Duplikate und Kapazität geprüft.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
