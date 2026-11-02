import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import '../../js/biography/public-biographies.generated.js';
import { getPersonBiographyModule, normalizePersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { buildBiographyExportPayload, parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';
import { createPublicPersonExtensions } from '../../firebase/functions/src/families/person-biography-publication.js';
import { GAIS_WYRM_BIOGRAPHY } from '../../Stammbäume/assets/js/data/person-biographies/gais-wyrm.js';
const { entries } = JSON.parse(await readFile(new URL('../../js/biography/sources/public-biographies.json', import.meta.url), 'utf8'));
const catalog = globalThis.AleriaBiographyCatalog;

test('all public editions can cross character, family-tree and file boundaries without losing the new training cards', () => {
  for (const row of entries) {
    const fromCharacter = catalog.resolve(null, { worldPersonId: row.worldPersonIds[0], characterId: row.characterIds[0] });
    assert(fromCharacter, row.name);
    const exported = buildBiographyExportPayload({ biographyModule: fromCharacter, baseUrl: 'https://aleria.test/AleriaAlmanach/' });
    const normalized = normalizePersonBiographyModule(parseBiographyImportPayload(exported));
    const published = createPublicPersonExtensions({ biographyModule: normalized }).biographyModule;
    assert.deepEqual(normalizePersonBiographyModule(published), normalized, row.name);
    assert.equal(normalized.biography.knightMentors?.length || 0, row.biography.biography.knightMentors?.length || 0);
    if (row.personIds.length) assert.deepEqual(getPersonBiographyModule({ id: row.personIds[0] }), normalizePersonBiographyModule(fromCharacter));
  }
});

test('Idwal retains both ordered training households and their portraits', () => {
  const bio = catalog.resolve(null, { worldPersonId: 'person--haus-draig--idwal-draig' });
  assert.deepEqual(bio.biography.knightMentors.map(m=>m.name), ['Sir Mervyn Gwyvern','Sir Parzifal Arth']);
  assert.match(bio.biography.biographyText, /zweite bei <strong>Sir Parzifal Arth/);
  const before = JSON.stringify(bio);
  const page = catalog.resolveModule({ commentThreadKey: 'unknown', pageTitle: 'Sir Idwal Draig', biography: bio.biography }, 'unrelated-module');
  assert.equal(JSON.stringify(bio), before);
  assert.equal(page.biography, bio.biography);
});

test('a revised personal narrative and an explicitly emptied mentor list survive the editorial fallback', () => {
  const row = entries.find(e=>e.key==='person--haus-wyrm--gais-wyrm');
  const stored = structuredClone(row.biography);
  stored.biography.biographyText = '<p>Eine später online überarbeitete Fassung.</p>';
  stored.biography.knightMentors = [];
  const before = JSON.stringify(stored);
  const resolved = catalog.resolve(stored, { characterId: row.characterIds[0] });
  assert.equal(resolved.biography.biographyText, stored.biography.biographyText);
  assert.deepEqual(resolved.biography.knightMentors, []);
  assert.equal(JSON.stringify(stored), before);
  const titled = structuredClone(GAIS_WYRM_BIOGRAPHY);
  titled.biography.biographyTitle = 'Mein eigener Titel';
  assert.equal(catalog.resolve(titled, {personId:'gais-wyrm'}).biography.biographyTitle, 'Mein eigener Titel');
  assert.equal(catalog.resolve(null, {personId:'eine-unbekannte-person'}), null);
  const removed = { schema:'aleria.biography-module', schemaVersion:1, disabled:true };
  assert.equal(getPersonBiographyModule({ id:'gais-wyrm', extensions:{biographyModule:removed} }), null);
  assert.deepEqual(createPublicPersonExtensions({biographyModule:removed}).biographyModule, removed);
});

test('unsafe training portraits are rejected by publication and ordinary portrait captions remain intact', () => {
  const value = { schema:'aleria.biography-module', biography:{knightMentors:[{name:'Bekannt',image:'javascript:alert(1)'}],portraitFit:'contain',portraitCaptions:['Erwachsen']} };
  const result = createPublicPersonExtensions({biographyModule:value}).biographyModule;
  assert.equal(result.biography.knightMentors[0].image,'');
  assert.equal(result.biography.portraitFit,'contain');
  assert.equal(normalizePersonBiographyModule(result).biography.portraitCaptions[0],'Erwachsen');
});

test('explicit identities and concrete module pages prevent unrelated biography defaults', () => {
  const conflict = { worldPersonId:'person--anderes-haus--andere-person', characterId:'person--haus-wyrm--gais-wyrm', personId:'gais-wyrm' };
  assert.equal(catalog.resolve(null, conflict), null);
  const own = { biography:{ biographyText:'Eigene Person', historyText:'Eigene Geschichte' } };
  assert.equal(catalog.resolve(own, conflict), own);
  const page = { commentThreadKey:'1', biography:{ biographyText:'Gemeinsame Reise', historyText:'Die Beziehung zu Duncan' } };
  const resolved = catalog.resolveModule(page, 'gawain-duncan');
  assert.equal(resolved.biography.knightMentors[0].name, 'Sir Duncan Gafyr');
  assert.equal(resolved.biography.historyText, page.biography.historyText);
  const unrelated = { ...page, commentThreadKey:'weitere-person' };
  assert.equal(catalog.resolveModule(unrelated, 'gawain-duncan'), unrelated);
});
