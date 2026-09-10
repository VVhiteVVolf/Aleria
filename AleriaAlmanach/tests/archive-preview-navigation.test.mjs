import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const root = new URL('../modules/archive/', import.meta.url);
const sources = await Promise.all(['archive-card-meta.js', 'archive-entry-card.js', 'archive-hierarchy-browser.js'].map(file => readFile(new URL(file, root), 'utf8')));
function createContext() {
  const context = vm.createContext({
    escapeHtml: value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'),
    sanitizeImageSrc: value => String(value || ''),
    getSectionOptionLabel: section => [section.tab, ...(section.path || [])].join(' › '),
    getSectionPathParts: section => section.path || [],
    getSectionLeafLabel: section => section.path?.at(-1) || section.key,
    normalizeArchivePathPart: value => String(value || '').toLowerCase(),
    archivePathsEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    encodeArchivePathData: value => encodeURIComponent(JSON.stringify(value)),
    getArchiveRootSection: (sections, tab) => sections.find(section => !section.path?.length) || {key:tab,tab},
    getThemeMetaForTab: () => ({note:'Überlieferungen aus dem Archiv.'}),
    getArchiveDashboardTabIcon: (tab, icon) => icon || 'parchment-category.png'
  });
  sources.forEach(source => vm.runInContext(source, context));
  return context;
}

test('preview keeps the guild emblem, readable text and actual page/comment capabilities', () => {
  const context = createContext();
  const entry = {
    id: 'guild', title: 'Eine sehr lange Gildenüberlieferung & ihre Geschichte', subtitle: 'Schreiber und Boten',
    appendCommentsPage: false, enablePageComments: true,
    image: 'scene.png',
    pages: [{image:'scene.png'}, {guildPage:true,guild:{crestImage:'crest.png'}}, {_commentsPage:true}]
  };
  assert.equal(context.getArchiveEntryPreviewImage(entry), 'crest.png');
  const html = context.renderArchiveEntryCard(entry, {tab:'Gilden & Zünfte',path:['Nachrichten']});
  assert.match(html, /src="crest.png"/);
  assert.match(html, /Gildenüberlieferung &amp; ihre Geschichte/);
  assert.match(html, /2 Seiten/);
  assert.match(html, /Kommentare möglich/);
  assert.doesNotMatch(html, /entry-card-meta-chip|card-image-overlay/);
  assert.doesNotMatch(context.renderArchiveEntryMeta({appendCommentsPage:false,pages:[{}]}), /Kommentare/);
  assert.match(context.renderArchiveEntryMeta({appendCommentsPage:false,pages:[{sessionPage:true}]}), /Kommentare möglich/);
});

test('selecting parent areas includes their descendants and the root remains selectable', () => {
  const context = createContext();
  const model = context.buildArchiveHierarchyModel([
    {key:'Kultur',tab:'Kultur',path:[],entries:[{id:'root',pages:[{}]}]},
    {key:'Cenyr',tab:'Kultur',path:['Cenyr'],entries:[{id:'cenyr',pages:[{}]}]},
    {key:'Bräuche',tab:'Kultur',path:['Cenyr','Bräuche'],entries:[{id:'dance',pages:[{},{}]}]}
  ], 'Kultur');
  assert.deepEqual(Array.from(context.getArchiveHierarchySection(model.root, 'Kultur').entries, entry => entry.id), ['root','cenyr','dance']);
  const selected = context.findArchiveHierarchyNode(model.root, ['Cenyr','Bräuche']);
  assert.deepEqual(Array.from(selected.entries, entry => entry.id), ['dance']);
  const heading = context.renderArchiveHierarchyContentHeading(selected, model);
  assert.match(heading, /Aktueller Archivpfad/);
  assert.match(heading, /data-section-path="%5B%5D"/);
  assert.match(heading, /1 Modul · 2 Seiten/);
  assert.doesNotMatch(heading, /Inhalte anzeigen|archive-hierarchy-preview/);
  assert.match(context.renderArchiveHierarchyContentHeading(model.root, model), /src="parchment-category.png"/);
});

test('a selected folder stays collapsed while its ancestors remain reachable', () => {
  const context = createContext();
  const model = context.buildArchiveHierarchyModel([
    {key:'Bräuche',tab:'Kultur',path:['Cenyr','Bräuche'],entries:[{id:'dance',pages:[{}]}]}
  ], 'Kultur');
  const path = ['Cenyr','Bräuche'];
  context.expandArchiveHierarchyPath('Kultur', path);
  context.renderArchiveHierarchyBrowser(model, path, {navigationOpen:true});
  context.toggleArchiveHierarchyNode('Kultur', path);
  context.renderArchiveHierarchyBrowser(model, path, {navigationOpen:true});
  const node = context.findArchiveHierarchyNode(model.root, path);
  const html = context.renderArchiveHierarchyNode(node, model, path);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /data-entry-id="dance"/);
});
