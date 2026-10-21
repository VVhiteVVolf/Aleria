import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import { buildHerluinMissingNotice, buildHerluinMissingNotices } from '../tools/build-herluin-missing-quest.mjs';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const json = value => JSON.parse(JSON.stringify(value));
const notice = buildHerluinMissingNotice();

function feature({ published = null, draft = null, authored = [notice], fail = false } = {}) {
  const saved = new Map(draft ? [['aleria.tafeln.draft.test', JSON.stringify(draft)]] : []);
  const requests = [];
  const context = vm.createContext({
    window: { TAFEL_CONFIG: { boardId: 'test', storage: { dataPath: 'data.json', authoredNoticesPath: 'authored.json' } }, setTimeout, dispatchEvent() {} },
    document: { getElementById: () => null }, console: { warn() {} },
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) },
    setTimeout, clearTimeout, Event: class {}, CustomEvent: class {},
    fetch: async (path, options) => {
      requests.push({ path, method: options?.method || 'GET' });
      if (fail && path === 'authored.json') throw new Error('Offline');
      return { ok: true, json: async () => path === 'data.json' ? published : { schemaVersion: 1, zettel: authored } };
    },
  });
  for (const file of ['data/authored-notices.js', 'core/tafel-state.js', 'tafel-storage.js']) {
    vm.runInContext(read(`assets/js/${file}`), context);
  }
  return { ...context.window, requests };
}

test('authored notice adds to existing board state without changing its notices or metadata', () => {
  const app = feature();
  const old = { id: 'existing', x: .1, y: .2, comments: [{ text: 'Bleibt erhalten' }] };
  const state = { zettel: [old], regionTitle: 'Eigener Titel', boardImages: { board: 'custom.png' }, cardWidth: 820 };
  const before = json(state);
  const merged = app.TafelAuthoredNotices.merge(state, [notice]);
  assert.deepEqual(state, before);
  assert.strictEqual(merged.zettel[0], old);
  assert.deepEqual(json(merged), { ...before, zettel: [old, notice], appliedAuthoredNoticeIds: [notice.id] });
  assert.deepEqual(json(app.TafelAuthoredNotices.merge(merged, [notice, notice])), json(merged));
  assert.strictEqual(app.TafelAuthoredNotices.merge(state, []), state);
});

test('existing authored notice edits take precedence and deleted notices stay deleted after a save/reload', () => {
  const app = feature();
  const edited = { ...notice, title: 'Meine Bearbeitung', x: .9, comments: [{ text: 'Eine Spur!' }] };
  const merged = app.TafelAuthoredNotices.merge({ zettel: [edited] }, [notice]);
  assert.strictEqual(merged.zettel[0], edited);
  app.TafelState.apply(merged);
  app.TafelState.get().zettel = [];
  const snapshot = json(app.TafelState.snapshot());
  app.TafelState.apply(snapshot);
  const next = app.TafelAuthoredNotices.merge(app.TafelState.snapshot(), [notice]);
  assert.deepEqual(json(next.zettel), []);
  assert.deepEqual(json(next.appliedAuthoredNoticeIds), [notice.id]);
  app.TafelState.apply({ zettel: [] });
  assert.equal(Object.hasOwn(app.TafelState.snapshot(), 'appliedAuthoredNoticeIds'), false);
});

test('storage adds authored content to both published and local draft boards using reads only', async () => {
  for (const useDraft of [false, true]) {
    const state = { zettel: [{ id: 'existing', comments: [{ text: 'Nicht überschreiben' }] }] };
    const app = feature({ published: { revision: 3, state: useDraft ? { zettel: [] } : state }, draft: useDraft ? { basedOnRevision: 3, state } : null });
    const loaded = await new Promise(resolve => app._fb.sub(resolve));
    assert.equal(loaded.zettel.length, 2);
    assert.deepEqual(json(loaded.zettel[0]), state.zettel[0]);
    assert.ok(app.requests.every(request => request.method === 'GET'));
  }
});

test('an uninitialized board shows the authored quest; an unavailable pack keeps published content', async () => {
  const app = feature();
  const loaded = await new Promise(resolve => app._fb.sub(resolve));
  assert.deepEqual(json(loaded.zettel), [notice]);
  const state = { zettel: [{ id: 'old' }] };
  const offline = feature({ published: { revision: 1, state }, fail: true });
  assert.strictEqual(await new Promise(resolve => offline._fb.sub(resolve)), state);
});

test('Gwynthor quest uses canonical employees and portrait, agreed reward, template and exact nail position', async () => {
  const pack = JSON.parse(read('Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/authored-notices.json'));
  assert.deepEqual(pack, await buildGwynthorQuestPack());
  assert.deepEqual(pack.zettel.slice(0, 4), buildHerluinMissingNotices());
  assert.equal(notice.typ, 'quest');
  assert.equal(notice.title, 'Angestellte Vermisst!');
  assert.equal(notice.table.find(row => row.k === 'Belohnung').v, '5 Silbertaler');
  assert.equal(notice.table.find(row => row.k === 'Frist').v, 'Dringend, offen');
  for (const word of ['Cyrwyn', 'Torvald', 'Rioneth', 'Glannadeor']) assert.ok(notice.text.includes(word));
  assert.equal(notice.x * 4096, 2883);
  assert.equal(notice.y * 3072, 1509);
  assert.equal(notice.media.verfasser.personId, 'herluin-lothaire');
  for (const field of ['verfasser', 'emblem', 'unterschrift', 'siegel']) {
    assert.ok(existsSync(fileURLToPath(new URL(decodeURI(notice[field]), new URL('../tafel.html', import.meta.url)))), field);
  }
  const context = { window: {} };
  vm.runInNewContext(read('Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/tafel.config.js'), context);
  assert.equal(context.window.TAFEL_CONFIG.storage.authoredNoticesPath,
    'Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/authored-notices.json');
});

test('requested authored corrections update only unchanged defaults once, preserving edits, replies and positions', async () => {
  const pack = await buildGwynthorQuestPack();
  const baseline = JSON.parse(read('tools/data/herluin-notice-v1.json'));
  const app = feature();
  const old = baseline.notices.map(item => ({ id: item.id, ...item.fields, x: .32, y: .61, title: 'Eigener Titel', comments: [{ text: 'Bestehende Spur' }] }));
  old[1].text = '<p>Eigener bearbeiteter Wortlaut</p>';
  old[2].portrait = 'eigene-skizze.png';
  const merged = app.TafelAuthoredNotices.merge({ zettel: old, appliedAuthoredNoticeIds: old.map(item => item.id) }, pack);
  assert.equal(merged.zettel[0].text, pack.zettel[0].text);
  assert.equal(merged.zettel[0].x, .32);
  assert.equal(merged.zettel[0].title, 'Eigener Titel');
  assert.deepEqual(json(merged.zettel[0].comments), [{ text: 'Bestehende Spur' }]);
  assert.equal(merged.zettel[1].text, old[1].text);
  assert.equal(merged.zettel[1].portrait, pack.zettel[1].portrait);
  assert.equal(merged.zettel[2].portrait, 'eigene-skizze.png');
  delete merged.zettel[0].noticeGroupId;
  merged.zettel = merged.zettel.filter(item => item.id !== pack.zettel[3].id);
  app.TafelState.apply(merged);
  const restored = app.TafelAuthoredNotices.merge(app.TafelState.snapshot(), pack);
  assert.equal(restored.zettel[0].noticeGroupId, undefined, 'later deliberate ungrouping survives reload');
  assert.ok(!restored.zettel.some(item => item.id === pack.zettel[3].id), 'deleted authored sheet stays deleted');
  assert.equal(restored.appliedAuthoredUpdateIds.length, pack.updates.length);
});

for (const [baselineFile, revision] of [
  ['gwynthor-notice-voice-v1.json', ':20261021-personal-voice'],
  ['herluin-notice-voice-v2.json', ':20261021-academic-ihr-voice'],
]) test(`wording migration ${revision} preserves edits, replies, rewards and deliberate deletions`, async () => {
  const pack = await buildGwynthorQuestPack();
  const baseline = JSON.parse(read(`tools/data/${baselineFile}`));
  const app = feature();
  const notices = baseline.notices.map(old => ({ ...json(pack.zettel.find(note => note.id === old.id)), text: old.fields.text,
    comments: [{ text: `Antwort zu ${old.id}` }], x: .17, y: .29 }));
  const edited = notices.find(note => note.id.endsWith('-cyrwyn'));
  edited.text = '<p>Ein eigener, später ergänzter Hinweis.</p>';
  const deletedId = notices.at(-1).id;
  const state = { zettel: [...notices.filter(note => note.id !== deletedId), ...json(pack.zettel.filter(note => !baseline.notices.some(old => old.id === note.id)))],
    appliedAuthoredNoticeIds: pack.zettel.map(note => note.id),
    appliedAuthoredUpdateIds: pack.updates.filter(update => !update.id.endsWith(revision)).map(update => update.id) };
  const before = json(state);
  const merged = app.TafelAuthoredNotices.merge(state, pack);
  for (const previous of before.zettel) {
    const current = merged.zettel.find(note => note.id === previous.id);
    const { text: beforeText, ...beforeFields } = previous;
    const { text: afterText, ...afterFields } = current;
    assert.deepEqual(json(afterFields), beforeFields, previous.id);
    assert.equal(afterText, previous.id === edited.id ? beforeText : pack.zettel.find(note => note.id === previous.id).text);
  }
  assert.ok(!merged.zettel.some(note => note.id === deletedId));
  assert.deepEqual(json(app.TafelAuthoredNotices.merge(merged, pack)), json(merged));
  assert.deepEqual(state, before);
});

test('Egon media corrections reach saved wanted sheets without replacing custom media or resurrecting deletions', async () => {
  const pack = await buildGwynthorQuestPack();
  const baseline = JSON.parse(read('tools/data/zitteraale-notice-media-v1.json'));
  const app = feature();
  const notices = baseline.notices.map(old => ({ ...json(pack.zettel.find(note => note.id === old.id)), ...old.fields,
    comments: [{ text: 'Bestehende Fahndungsspur' }], x: .14, y: .37 }));
  for (const note of notices) for (const field of ['media', 'emblem', 'unterschrift', 'siegel']) delete note[field];
  const customized = notices[1];
  customized.verfasser = 'eigener-auftraggeber.png';
  customized.portrait = 'eigene-skizze.png';
  customized.unterschrift = 'eigene-unterschrift.png';
  customized.media = { verfasser: { src: customized.verfasser, fit: 'contain' } };
  const deletedId = notices.at(-1).id;
  const state = {
    zettel: notices.filter(note => note.id !== deletedId),
    appliedAuthoredNoticeIds: pack.zettel.map(note => note.id),
    appliedAuthoredUpdateIds: pack.updates.filter(update => !update.id.endsWith(':20261021-egon-issuer-media')).map(update => update.id),
  };
  const before = json(state);
  const merged = app.TafelAuthoredNotices.merge(state, pack);
  for (const previous of before.zettel) {
    const current = merged.zettel.find(note => note.id === previous.id);
    const expected = pack.zettel.find(note => note.id === previous.id);
    assert.equal(current.verfasser, previous.id === customized.id ? previous.verfasser : expected.verfasser);
    assert.equal(current.portrait, previous.portrait === baseline.notices[0].fields.portrait ? '' : previous.portrait);
    assert.equal(current.unterschrift, previous.id === customized.id ? previous.unterschrift : expected.unterschrift);
    assert.deepEqual(json(current.media.verfasser), previous.media?.verfasser || expected.media.verfasser);
    for (const field of ['siegel', 'emblem']) assert.equal(current[field], expected[field]);
    for (const field of ['comments', 'text', 'rewards', 'x', 'y', 'stackId', 'noticeGroupId']) {
      assert.deepEqual(json(current[field]), previous[field], `${previous.id}: ${field}`);
    }
  }
  assert.ok(!merged.zettel.some(note => note.id === deletedId));
  assert.deepEqual(json(app.TafelAuthoredNotices.merge(merged, pack)), json(merged));
  assert.deepEqual(state, before);
});
