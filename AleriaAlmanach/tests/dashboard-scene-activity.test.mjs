import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'modules/dashboard/dashboard-scene-activity.js'), 'utf8');

function createContext() {
  const context = vm.createContext({
    console,
    Date,
    Intl,
    Map,
    Set,
    document: {
      addEventListener() {},
      querySelector() { return null; }
    },
    getPageCommentThreadKey(page, pageIndex) {
      return String(page?.commentThreadKey || pageIndex);
    },
    getSessionThreadId(entryId, pageKey) {
      return `${entryId}::session:${pageKey}`;
    },
    getCommentActivityMs(comment) {
      return Number(comment?.activityAtClient || 0);
    }
  });
  vm.runInContext(source, context, { filename: 'dashboard-scene-activity.js' });
  return context;
}

const sections = [{
  key: 'Chroniken',
  entries: [
    { id: 'scene-old', title: 'Alte Szene', pages: [{ sessionPage: true }] },
    { id: 'scene-new', title: 'Neue Szene', pages: [{ pageTitle: 'Auftakt' }, { sessionPage: true, commentThreadKey: 'court' }] },
    { id: 'lore', title: 'Wissen', pages: [{ description: 'Kein Sitzungsthread' }] }
  ]
}];

test('ordnet Kommentaraktivität der richtigen Szene und Sitzungsseite zu', () => {
  const context = createContext();
  const activity = context.buildAlmanachDashboardSceneActivity(sections, [
    { id: 'c1', entryId: 'scene-old::session:0', charName: 'Ifor', text: 'Der ältere Beitrag', activityAtClient: 1000 },
    { id: 'c2', entryId: 'scene-new::session:court', charName: 'Rhiannon', text: 'Die jüngste Antwort', activityAtClient: 3000 },
    { id: 'c3', entryId: 'scene-new::session:court', charName: 'Gawain', text: 'Eine frühere Antwort', activityAtClient: 2000 },
    { id: 'c4', entryId: 'lore', charName: 'Archiv', text: 'Kein Szenenkommentar', activityAtClient: 9000 }
  ]);

  assert.equal(activity.size, 2);
  assert.deepEqual(
    { ...activity.get('scene-new') },
    {
      entryId: 'scene-new',
      threadId: 'scene-new::session:court',
      pageIndex: 1,
      commentCount: 2,
      activityAt: 3000,
      authorName: 'Rhiannon',
      authorPortrait: '',
      excerpt: 'Die jüngste Antwort'
    }
  );
  assert.equal(activity.has('lore'), false);
});

test('sortiert Szenen nach der jüngsten Kommentaraktivität', () => {
  const context = createContext();
  vm.runInContext(`
    _almanachDashboardSceneActivity = buildAlmanachDashboardSceneActivity(${JSON.stringify(sections)}, [
      { entryId: 'scene-old::session:0', activityAtClient: 1000 },
      { entryId: 'scene-new::session:court', activityAtClient: 3000 }
    ]);
  `, context);

  const sorted = context.sortAlmanachDashboardScenesByActivity([
    { entry: { id: 'scene-old' } },
    { entry: { id: 'scene-new' } }
  ]);
  assert.deepEqual(Array.from(sorted, item => item.entry.id), ['scene-new', 'scene-old']);
});

test('nutzt bei segmentierten Beiträgen die jüngste sichtbare Stimme', () => {
  const context = createContext();
  const activity = context.buildAlmanachDashboardSceneActivity(sections, [{
    entryId: 'scene-old::session:0',
    charName: 'Rahmenfigur',
    text: 'Rahmentext',
    activityAtClient: 1000,
    commentSegments: [
      { charName: 'Erste Stimme', text: 'Erster Abschnitt' },
      { charName: 'Letzte Stimme', portrait: 'portrait.png', text: '**Letzter Abschnitt**' }
    ]
  }]);

  assert.equal(activity.get('scene-old').authorName, 'Letzte Stimme');
  assert.equal(activity.get('scene-old').authorPortrait, 'portrait.png');
  assert.equal(activity.get('scene-old').excerpt, 'Letzter Abschnitt');
});
