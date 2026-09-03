import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildImportedCharacter,
  createFamilyCandidates
} from '../modules/character-genealogy/genealogy-mapping.js';
import { loadPublishedGenealogyFamily } from '../modules/character-genealogy/genealogy-source-repository.js';

const swyllUrl = new URL('../../Stammb%C3%A4ume/assets/data/published-families/haus-swyll.json', import.meta.url);

test('die veröffentlichte Swyll-Fassung überträgt alle drei Portraits in neue Charaktere', async () => {
  const envelope = JSON.parse(await readFile(swyllUrl, 'utf8'));
  const candidates = createFamilyCandidates({
    id: 'haus-swyll',
    title: 'Haus Swyll',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwynthor'],
    family: envelope.family,
    source: 'github'
  });

  const expectedPortraits = new Map([
    ['gareth-swyll', 'https://i.imgur.com/DpqoWhn.png'],
    ['meredith-swyll', '../Stammbäume/assets/images/portraits/haus-swyll/meredith-swyll.png'],
    ['rhydwen-swyll', 'https://i.imgur.com/NR8HKxj.png']
  ]);

  expectedPortraits.forEach((portrait, personId) => {
    const candidate = candidates.find(item => item.personId === personId);
    assert.equal(candidate?.portrait, portrait);
    assert.equal(buildImportedCharacter(candidate).portrait, portrait);
  });
});

test('veröffentlichte GitHub-Fassung bleibt als Fallback verfügbar, wenn Firebase fehlt', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = { _fbReady: true, _fb: null };
  globalThis.fetch = async url => ({
    ok: true,
    async json() {
      return {
        revision: 7,
        updatedAt: '2026-09-03T20:00:00.000Z',
        family: {
          document: { id: 'haus-test', title: 'Haus Test' },
          persons: [{ id: 'person-test', portrait: 'https://i.imgur.com/test.png' }]
        }
      };
    },
    url: String(url)
  });

  try {
    const published = await loadPublishedGenealogyFamily({
      id: 'haus-test',
      title: 'Haus Test',
      folderPath: ['Cenyr']
    });
    assert.equal(published.source, 'github');
    assert.equal(published.releaseId, 'github-r7');
    assert.equal(published.family.persons[0].portrait, 'https://i.imgur.com/test.png');
  } finally {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  }
});
