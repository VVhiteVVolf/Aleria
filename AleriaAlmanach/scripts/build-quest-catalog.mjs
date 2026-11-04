// Public repository sources only. No credentials, private dossiers or browser drafts.
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { questsFromBoard, questsFromModules } from '../modules/quests/quest-sources.js';
import { mergeAuthoredArchiveState } from '../../Anzeigetafeln/assets/js/archive/notice-archive-model.mjs';
export async function buildQuestCatalog({ check = false } = {}) {
const root = new URL('../../', import.meta.url), sourceFiles = new Set();
const read = path => { sourceFiles.add(path); return readFile(new URL(path, root), 'utf8'); };
const context = vm.createContext({ structuredClone }); context.window = context;
for (const path of ['Anzeigetafeln/tafeln.registry.js', 'Karten/karten.registry.js', 'Anzeigetafeln/assets/js/data/authored-notices.js']) vm.runInContext(await read(path), context, { filename: path });
const boards = structuredClone(context.window.TafelRegistry.all()), maps = structuredClone(context.window.KartoMapRegistry.all());
const boardStates = [];
for (const board of boards.filter(row => row.status === 'active')) {
  const envelope = JSON.parse(await read(`Anzeigetafeln/${board.dataPath}`)), base = envelope.state || envelope;
  const configContext = vm.createContext({ window: {} });
  vm.runInContext(await read(`Anzeigetafeln/${board.config}`), configContext);
  const authoredPath = configContext.window.TAFEL_CONFIG.storage?.authoredNoticesPath;
  const authored = authoredPath ? JSON.parse(await read(`Anzeigetafeln/${authoredPath}`)) : { zettel: [] };
  boardStates.push({ boardId: board.id, authoredPath: authoredPath || '', authored,
    state: mergeAuthoredArchiveState(structuredClone(context.window.TafelAuthoredNotices.merge(base, authored)), authored.archiveEntries) });
}
const html = await read('AleriaAlmanach/AleriaAlmanach.html');
for (const path of ['Fonts/Rheunwaith-Font-1.000/rheunwaith.js', 'Fonts/Karnrith-Font-2.000/karnrith.js', 'Fonts/Arkanes-Alphabet/arcane.js']) vm.runInContext(await read(path), context, { filename: path });
for (const path of ['modules/name-list/name-list-data.js', 'modules/script-table/script-table-data.js',
  'modules/language/morgar/morgar-data.js', 'modules/language/morgar/morgar-tables.js', 'modules/language/morgar/morgar-entry.js',
  'modules/language/laerelis/laerelis-data.js', 'modules/language/laerelis/laerelis-tables.js', 'modules/language/laerelis/laerelis-entry.js',
  'modules/language/package-language-tables.js',
  'modules/language/tlapanui/tlapanui-data.js', 'modules/language/tlapanui/tlapanui-entry.js',
  'modules/language/ishtaran/ishtaran-data.js', 'modules/language/ishtaran/ishtaran-entry.js',
  'modules/language/language-reference-entries.js', 'modules/language/arcane-alphabet-entry.js',
  'modules/religion/nimuiten/nimuiten-entry.js', 'modules/religion/gruener-bund/gruener-bund-entry.js', 'modules/piracy/piracy-entries.js']) {
  vm.runInContext(await read(`AleriaAlmanach/${path}`), context, { filename: path });
}
vm.runInContext(await read('AleriaAlmanach/data/sections.js'), context);
for (const match of html.matchAll(/<script\s+src="\.\/(modules\/[^"?]+-data\.js)(?:\?[^" ]*)?"/g)) {
  const source = await read(`AleriaAlmanach/${match[1]}`);
  if (source.includes('SECTIONS')) vm.runInContext(source, context, { filename: match[1] });
}
const modules = structuredClone(vm.runInContext('SECTIONS', context)).flatMap(section => section.entries || []).filter(row => !row.hidden && !row.isTemplate && !row.archived && row.title !== '[PLATZHALTER]');
vm.runInContext(await read('AleriaAlmanach/modules/comments/comments-routing.js'), context);
const scenes = modules.flatMap(entry => {
  const threads = new Map([[entry.id, { id: entry.id, title: entry.title, moduleId: entry.id }]]);
  for (const [index, page] of (entry.pages || []).entries()) {
    const thread = context.getCommentThreadForPage(page, entry, index) || context.getInlineCommentThreadForPage(page, entry, index);
    if (thread) threads.set(thread.threadId, { id: thread.threadId, title: `${entry.title} · ${page.pageTitle || `Seite ${index + 1}`}`, moduleId: entry.id });
  }
  return [...threads.values()];
});
const catalog = { schemaVersion: 1, boards, maps, modules: modules.map(row => ({ id: row.id, title: row.title })),
  scenes,
  quests: [...boardStates.flatMap(row => questsFromBoard(boards.find(board => board.id === row.boardId), row.state, maps)), ...questsFromModules(modules)],
  boardStates: [] };
// Keep the full notice states out of the quest index. Runtime loads source files
// when a board changes, applying the board's existing additive merge policy.
catalog.boardStates = boardStates.map(row => ({ boardId: row.boardId, authoredPath: row.authoredPath }));
// The release planner reuses this exact dependency list instead of invalidating
// every quest check for unrelated Almanach UI changes.
catalog.sourceFiles = [...sourceFiles].sort();
const output = JSON.stringify(catalog, null, 2) + '\n', target = new URL('../modules/quests/quest-catalog.json', import.meta.url);
if (check) {
  if (await readFile(target, 'utf8') !== output) throw Error('Questkatalog ist nicht aktuell: npm run build:quests');
} else await writeFile(target, output);
return catalog;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const catalog = await buildQuestCatalog({ check: process.argv.includes('--check') });
  console.log(`${catalog.quests.length} Aufträge, ${catalog.boards.length} Tafeln, ${catalog.maps.length} Karten, ${catalog.modules.length} Module.`);
}
