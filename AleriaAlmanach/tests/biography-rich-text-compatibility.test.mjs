import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const almanachSafetyUrl = new URL('../modules/core/content-safety.js', import.meta.url);
const almanachBiographyUrl = new URL('../modules/characters/character-biography-tab.js', import.meta.url);
const genealogySafetyUrl = new URL('../../Stammb%C3%A4ume/assets/js/modules/person-biography/person-biography-content.js', import.meta.url);

test('beide Biografie-Sanitizer erhalten sichere Absatzcontainer aus Rich-Text-Importen', async () => {
  const [almanachSource, genealogySource] = await Promise.all([
    readFile(almanachSafetyUrl, 'utf8'),
    readFile(genealogySafetyUrl, 'utf8')
  ]);
  const expectedAllowedTags = "['BR', 'P', 'DIV', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'SPAN']";

  assert.match(almanachSource, new RegExp(expectedAllowedTags.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(genealogySource, new RegExp(expectedAllowedTags.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('der Charakter-Import normalisiert sowohl Export-Paare als auch Firestore-Statzeilen', async () => {
  const source = await readFile(almanachBiographyUrl, 'utf8');

  assert.match(source, /stats:\s*normalizeCharacterBiographyStats\(module\.stats\)/);
});
