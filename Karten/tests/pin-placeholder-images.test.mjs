import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

await import('../assets/js/pins/pin-placeholder-images.js');

const placeholders = globalThis.KartoPinPlaceholders;
const testDirectory = dirname(fileURLToPath(import.meta.url));

test('pins without an image receive a stable project placeholder', () => {
  const pin = { id: 'gwynthor-markt', title: 'Markt von Gwynthor', x: 42, y: 17 };
  const first = placeholders.resolve(pin);
  const second = placeholders.resolve(pin);

  assert.equal(first.src, second.src);
  assert.equal(first.isPlaceholder, true);
  assert.equal(first.link, '');
  assert.ok(placeholders.sources.includes(first.src));
});

test('every configured placeholder exists in the project', () => {
  for(const source of placeholders.sources){
    const projectPath = resolve(testDirectory, '..', source.replace(/^\/Karten\//, ''));
    assert.equal(existsSync(projectPath), true, `${source} fehlt`);
  }
});

test('an explicit pin image and its link take precedence', () => {
  const result = placeholders.resolve({
    id: 'gwynthor-markt',
    img: '/eigene-bilder/markt.webp',
    imgLink: '/orte/gwynthor/markt',
  });

  assert.deepEqual(result, {
    src: '/eigene-bilder/markt.webp',
    link: '/orte/gwynthor/markt',
    isPlaceholder: false,
  });
});
