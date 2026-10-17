import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { buildBiographyExportPayload, parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';

async function context() {
  const scope = vm.createContext({ URL, window: { location: { href: 'https://aleria.example/' } }, document: { addEventListener() {} } });
  for (const file of ['core/content-safety.js', 'module-editor/module-editor-data.js', 'rendering/module-renderer.js']) {
    vm.runInContext(await readFile(new URL('../modules/' + file, import.meta.url), 'utf8'), scope);
  }
  return scope;
}

test('old biographies retain their data shape; five captions survive a biography export', async () => {
  const scope = await context();
  assert.equal(Object.hasOwn(scope.sanitizeBiographyData({}), 'portraitCaptions'), false);
  const biography = scope.sanitizeBiographyData({ portraitCaptions: [' aktuell ', 'Rüstung', '20', '14', '8', 'overflow'] });
  assert.deepEqual(Array.from(biography.portraitCaptions), ['aktuell', 'Rüstung', '20', '14', '8']);
  const imported = parseBiographyImportPayload(buildBiographyExportPayload({ biographyModule: { biography } }));
  assert.deepEqual(imported.biography.portraitCaptions, ['aktuell', 'Rüstung', '20', '14', '8']);
});

test('an empty portrait slot does not shift the caption of a later image', async () => {
  const scope = await context();
  const stages = scope.getBiographyPortraitStages({ biography: { portraitStages: ['', '/age-14.png'], portraitCaptions: ['now', 'missing', '14 years'] } });
  assert.equal(stages.length, 1);
  assert.equal(stages[0].label, '[3]');
  assert.equal(stages[0].caption, '14 years');
});

test('portrait captions remain text and never inject markup', async () => {
  const scope = await context();
  scope.buildModuleImageElementAttrs = () => '';
  const html = scope.buildBiographyPortrait({ image: '/current.png', biography: { portraitStages: ['/second.png'], portraitCaptions: ['<img src=x onerror=bad()>', 'armor & horse'] } }, { title: 'Branwen' });
  assert.ok(html.includes('&lt;img src=x onerror=bad()&gt;'));
  assert.ok(html.includes('armor &amp; horse'));
  assert.ok(!html.includes('<img src=x'));
});

test('full-length biography artwork can fit inside its frame without changing old biographies or other page images', async () => {
  const scope = await context();
  assert.equal(Object.hasOwn(scope.sanitizeBiographyData({}), 'portraitFit'), false);
  assert.equal(Object.hasOwn(scope.sanitizeBiographyData({ portraitFit: 'invalid' }), 'portraitFit'), false);
  const biography = scope.sanitizeBiographyData({ portrait: '/full-body.png', portraitFit: 'contain', portraitStages: ['/young.png'] });
  const html = scope.buildBiographyPortrait({ biography, imageFit: 'cover' }, { title: 'Sleipnir' });
  assert.equal((html.match(/object-fit:contain/g) || []).length, 2);
  assert.ok(!html.includes('object-fit:cover'));
  const single = scope.buildBiographyPortrait({ biography: { portrait: '/full-body.png', portraitFit: 'contain' } }, { title: 'Sleipnir' });
  assert.ok(single.includes('object-fit:contain'));
  const old = scope.buildBiographyPortrait({ image: '/old.png' }, { title: 'Old' });
  assert.ok(old.includes('object-fit:cover'));
  const imported = parseBiographyImportPayload(buildBiographyExportPayload({ biographyModule: { biography } }));
  assert.equal(imported.biography.portraitFit, 'contain');
});
