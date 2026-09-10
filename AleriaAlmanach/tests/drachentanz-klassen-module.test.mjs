import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { getVennyrClassProgression } from '../modules/classes/vennyr/vennyr-class-progression.js';

const moduleRoot = new URL('../modules/drachentanz-kampfstil/', import.meta.url);
const firstSource = await readFile(new URL('drachentanz-kampfstil-data.js', moduleRoot), 'utf8');
const classesSource = await readFile(new URL('drachentanz-kampfstil-klassen-data.js', moduleRoot), 'utf8');
const expected = [
  ['cantref', ['Tanz des Speerdrachens', 'Tanz des peitschenden Drachens', 'Tanz des hütenden Drachens']],
  ['helwyr', ['Tanz des lauernden Drachens', 'Tanz des jagenden Drachens']],
  ['uchelwyr', ['Tanz des Speerdrachens', 'Tanz des peitschenden Drachens', 'Tanz des hütenden Drachens', 'Tanz des stürmenden Drachens', 'Tanz des schweifenden Drachens']],
  ['barddwyr', ['Tanz des trällernden Drachens', 'Tanz des kreischenden Drachens']],
  ['arthwyr', ['Tanz der Bärenklaue']],
  ['derwyn', ['Tanz des fließenden Wyrms', 'Tanz des brandenden Wyrms', 'Tanz des steigenden Wyrms', 'Tanz des peitschenden Wyrms']]
];

function loadModules() {
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(firstSource, context);
  const firstPart = context.SECTIONS.flatMap(section => section.entries).find(entry => entry.id === 'drachentanz-kampfstil');
  const original = JSON.stringify(firstPart);
  vm.runInContext(classesSource, context);
  vm.runInContext(classesSource, context);
  const section = context.SECTIONS.find(section => section.entries.includes(firstPart));
  const entry = section.entries.find(candidate => candidate.id === 'drachentanz-kampfstil-klassen');
  return { section, entry, firstPart, original };
}

test('class module preserves first part, six assigned illustrations and one adjacent registration', () => {
  const { section, entry, firstPart, original } = loadModules();
  assert.equal(JSON.stringify(firstPart), original);
  assert.equal(section.entries.indexOf(entry), section.entries.indexOf(firstPart) + 1);
  assert.equal(section.entries.filter(candidate => candidate.id === entry.id).length, 1);
  assert.equal(entry.category, firstPart.category);
  assert.equal(entry.pages.length, 6);
  assert.equal(entry.enablePageComments, true);
  const expectedImages = expected.map(([classId]) => `./public/assets/drachentanz-kampfstil-klassen/${classId}.png`);
  assert.deepEqual(Array.from(entry.pages, page => page.image), expectedImages);
  assert.equal(entry.image, expectedImages[0]);
});

test('every editorial class form has the same name and class access in the playable curriculum', async () => {
  const { entry } = loadModules();
  for (const [index, [classId, names]] of expected.entries()) {
    const page = entry.pages[index];
    const headings = [...page.description.matchAll(/<strong>\d+\. ([^<]+)<\/strong>/g)].map(match => match[1]);
    assert.deepEqual(headings, names, classId);
    const plan = classId === 'derwyn' ? getVennyrClassProgression(classId, 20) : getCenyrClassProgression(classId, 20);
    const forms = plan.styles.flatMap(style => style.forms).filter(form => !form.blocked);
    for (const name of names) {
      const form = forms.find(candidate => candidate.shortName === name);
      assert(form, `${classId}: ${name} must be playable`);
      assert(form.techniques.length > 0, `${classId}: ${name} needs actual techniques`);
    }
    const link = page.description.match(/href="(\.\.\/Klassenordner\/[^"#]+)#ausbildungsplan"/);
    assert(link, `${classId}: linked training plan`);
    const classPage = await readFile(new URL(link[1], new URL('../', import.meta.url)), 'utf8');
    for (const name of names) assert(classPage.includes(name), `${classId}: generated page contains ${name}`);
    assert(!/\[Name der Kampfform\]|Satteldrach|Lanzendrach|Bogendrach|Sirenentanz/.test(page.description));
  }
});

test('shared spear forms lead both classes and Derwyn describes exactly four paths after either foundation', () => {
  const { entry } = loadModules();
  const spearNames = expected[0][1];
  for (const classId of ['cantref', 'uchelwyr']) {
    const plan = getCenyrClassProgression(classId, 20);
    assert.deepEqual(plan.styles.flatMap(style => style.forms).filter(form => form.isChoice && !form.blocked).slice(0, 3).map(form => form.shortName), spearNames);
  }
  const derwyn = entry.pages[5].description;
  for (const phrase of ['Tanz des Jungdrachens', 'Tanz der jungen Welle', 'Zeit des freien Übens und Erprobens', 'vier Wyrmformen', 'Wyrmtanz']) assert(derwyn.includes(phrase));
  for (const foundationFormId of ['drachentanz-form-i-jungdrache', 'sirenentanz-junge-welle']) {
    const plan = getVennyrClassProgression('derwyn', 20, { foundationFormId });
    assert.deepEqual(plan.pathOptions.filter(form => !form.blocked).map(form => form.shortName), expected[5][1]);
  }
});
