const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
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
vm.runInContext(source, context, { filename: 'character-avatar-import.js' });

async function run() {
  assert.equal(vm.runInContext('CHARACTER_AVATAR_LIMIT', context), 80);
  assert.match(profileSource, /const MAX_EMOTES = CHARACTER_AVATAR_LIMIT;/);
  assert.match(html, /id="cp-avatar-limit">80<\/span>/);
  assert.match(html, /data-char-profile-action="import-avatar-links"/);
  assert.match(html, /data-char-profile-action="paste-avatar-links"/);

  context.testSlots = Array.from({ length: 80 }, () => null);
  context.testSlots[0] = { img: 'https://img.example/already.png', label: 'Schon da' };
  context.testLoader = async url => {
    if (url.includes('broken')) throw new Error('not loadable');
    return url;
  };
  context.testRaw = [
    'https://img.example/already.png',
    'https://img.example/happy-face.png',
    'https://img.example/broken.png'
  ].join('\n');

  const result = await vm.runInContext(`buildCharacterAvatarImport({
    rawValue: testRaw,
    slots: testSlots,
    loadImage: testLoader
  })`, context);
  assert.equal(result.addedCount, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.rejectedCount, 1);
  assert.equal(result.slots[1].img, 'https://img.example/happy-face.png');
  assert.equal(result.slots[1].label, 'happy face');

  context.fullSlots = Array.from({ length: 80 }, (_, index) => ({
    img: `https://img.example/${index}.png`,
    label: String(index)
  }));
  const fullResult = await vm.runInContext(`buildCharacterAvatarImport({
    rawValue: 'https://img.example/overflow.png',
    slots: fullSlots,
    loadImage: testLoader
  })`, context);
  assert.equal(fullResult.addedCount, 0);
  assert.equal(fullResult.skippedCapacityCount, 1);
  assert.equal(fullResult.slots.length, 80);

  console.log('Character-Avatar-Import: 80er-Limit, Mehrfachimport, Duplikate und Kapazität geprüft.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
