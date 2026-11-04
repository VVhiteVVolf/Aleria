import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { isAuthoringArchive } from '../build/publication-policy.mjs';
import { shouldPublish } from '../build/site-publish.mjs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { isTaskInput } from '../build/site-build-plan.mjs';

const packages = [
  ['Tlapanui-Gesamtpaket-2.000', 'Nuatlapa', 'TavaruaBildschnitt-Regular'],
  ['Ishtaran-Gesamtpaket-1.000', 'Tirghan', 'AyluunMondbogen-Regular']
];

test('supplied language-package sources stay in the repository without static delivery', async () => {
  for (const [name] of packages) {
    for (const relative of ['Quellen/original.png', 'Quellen/Bildgenerierte_Glyphen/original.png',
      'Web/index.html', 'Web/example.css', 'Daten/preview_Wörter.png', 'README.txt', 'manifest.json',
      'Daten/example.json', 'Daten/example.csv', 'Daten/example.xlsx',
      'Dokumentation/example.pdf', 'Dokumentation/example.docx', 'Vorschau/Zeichentafel.png']) {
      const file = `Fonts/${name}/${relative}`;
      assert.equal(isAuthoringArchive(file), true, file);
      assert.equal(shouldPublish(file), false, file);
    }
    await access(new URL(`../../Fonts/${name}/README.txt`, import.meta.url));
  }
});

test('active original fonts remain available while raw reference packages stay preserved as sources', async () => {
  for (const [name, language, font] of packages) {
    for (const relative of ['woff2', 'woff', 'ttf', 'otf'].map(extension => `Fonts/${font}.${extension}`)) {
      const file = `Fonts/${name}/${relative}`;
      await access(new URL(`../../${file}`, import.meta.url));
      assert.equal(isAuthoringArchive(file), false, file);
      assert.equal(shouldPublish(file), true, file);
    }
    for (const relative of [`Dokumentation/${language}_Sprach_und_Namensbibel_1.000.pdf`,
      `Daten/${language}_Sprachdaten_1.000.json`]) {
      const file = `Fonts/${name}/${relative}`;
      await access(new URL(`../../${file}`, import.meta.url));
      assert.equal(shouldPublish(file), false, file);
    }
  }
  assert.equal(shouldPublish('Fonts/Stoicheia-Gesamtpaket-1.000/Web/index.html'), true,
    'the package rule must not change earlier font packages');
});

test('the derived Ayluun runtime font is public while its builder and verification source stay local', async () => {
  const root = 'Fonts/Ishtaran-Web-1.001/';
  const runtime = `${root}AyluunMondbogen-Regular.woff`;
  await access(new URL(`../../${runtime}`, import.meta.url));
  assert.equal(shouldPublish(runtime), true, runtime);
  for (const relative of ['AyluunMondbogen-Regular.ttf', 'build-webfont.py', 'README.md']) {
    const file = `${root}${relative}`;
    await access(new URL(`../../${file}`, import.meta.url));
    assert.equal(shouldPublish(file), false, file);
  }
});

test('the Node-only language importer stays a source while generated browser modules remain live', async () => {
  const root = 'AleriaAlmanach/modules/language/';
  const builder = `${root}package-language-build.mjs`;
  await access(new URL(`../../${builder}`, import.meta.url));
  assert.equal(isAuthoringArchive(builder), true, builder);
  assert.equal(shouldPublish(builder), false, builder);
  for (const relative of ['package-language-tables.js',
    'tlapanui/tlapanui-data.js', 'tlapanui/tlapanui-entry.js',
    'ishtaran/ishtaran-data.js', 'ishtaran/ishtaran-entry.js']) {
    const file = `${root}${relative}`;
    await access(new URL(`../../${file}`, import.meta.url));
    assert.equal(isAuthoringArchive(file), false, file);
    assert.equal(shouldPublish(file), true, file);
  }
});

test('language scenes deliver the selected WebP while retaining generation sources locally', async () => {
  for (const language of ['tlapanui', 'ishtaran']) {
    const root = `AleriaAlmanach/modules/language/${language}/assets/`;
    for (const extension of ['png', 'prompt.md']) {
      const file = `${root}language-${language}-scene.${extension}`;
      await access(new URL(`../../${file}`, import.meta.url));
      assert.equal(shouldPublish(file), false, file);
    }
    const scene = `${root}language-${language}-scene.webp`;
    await access(new URL(`../../${scene}`, import.meta.url));
    assert.equal(shouldPublish(scene), true, scene);
    assert.equal(shouldPublish(`${root}${language}-zeichentafel.png`), true,
      'the separate font specimen remains public');
  }
});

test('language source, rendering and font changes invalidate their release checks', () => {
  const task = SITE_BUILD_TASKS.find(entry => entry.id === 'package-languages');
  assert.ok(task, 'the language integration has a dedicated release check');
  for (const file of [
    'Fonts/Tlapanui-Gesamtpaket-2.000/Daten/Nuatlapa_Sprachdaten_1.000.json',
    'Fonts/Ishtaran-Gesamtpaket-1.000/Fonts/AyluunMondbogen-Regular.woff2',
    'Fonts/Ishtaran-Web-1.001/AyluunMondbogen-Regular.woff',
    'AleriaAlmanach/modules/language/tlapanui/tlapanui-entry.js',
    'AleriaAlmanach/modules/script-table/script-table-data.js',
    'AleriaAlmanach/DokumentenWerkstatt/js/fonts/font-catalog.js',
    'Anzeigetafeln/assets/js/typography/notice-font-catalog.mjs',
    'AleriaAlmanach/styles/comment-bubbles.css'
  ]) assert.equal(isTaskInput(task, file), true, file);
  assert.equal(isTaskInput(task, 'AleriaAlmanach/assets/gwynthor-troetzli/example.png'), false);
  assert.deepEqual(task.commands[0], ['AleriaAlmanach/modules/language/package-language-build.mjs', '--check']);
  assert.ok(task.commands[1].includes('AleriaAlmanach/tests/package-language-modules.test.mjs'));
  assert.ok(task.commands[1].includes('AleriaAlmanach/tests/tlapanui-ishtaran-fonts.test.mjs'));
});
