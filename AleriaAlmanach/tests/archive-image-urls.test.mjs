import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const files = ['core/content-safety.js', 'archive/archive-card-meta.js', 'archive/archive-entry-card.js',
  'archive/archive-hierarchy-browser.js', 'archive/archive-dashboard.js'];
const sources = await Promise.all(files.map(file => readFile(new URL('modules/' + file, root), 'utf8')));

function createContext() {
  const context = vm.createContext({
    URL, window: { location: { href: 'https://example.test/AleriaAlmanach/AleriaAlmanach.html' } },
    document: { addEventListener() {}, querySelector() { return null; } },
    getSectionOptionLabel: section => section.tab || section.key || '',
    getSectionPathParts: section => section.path || [],
    encodeArchivePathData: value => encodeURIComponent(JSON.stringify(value)),
    getArchiveSectionStats: (_section, entries) => ({ moduleCount: entries.length, pageCount: entries.reduce((sum, entry) => sum + entry.pages.length, 0) }),
    getThemeMetaForSection: () => ({ slug: 'kultur' }),
    getThemeMetaForTab: () => ({ note: '' })
  });
  sources.forEach((source, index) => vm.runInContext(source, context, { filename: files[index] }));
  return context;
}

function imageAttributes(html) {
  return [...html.matchAll(/<img\b[^>]*\bsrc="([^"]*)"/g)].map(match => match[1]);
}

test('Firebase image query parameters survive every archive preview renderer', () => {
  const context = createContext();
  for (const suffix of ['cover.png', 'room%2Fentrance.png']) {
    const id = 'scene';
    const url = 'https://firebasestorage.googleapis.com/v0/b/example.firebasestorage.app/o/' + suffix + '?alt=media&token=preview-token';
    const expectedAttribute = url.replaceAll('&', '&amp;');
    const entry = { id, title: 'Interaktive Szene', image: url,
      pages: [{ image: url, sessionPage: true, description: 'Eine ausführliche Ortsbeschreibung für das Archiv und seine täglichen Fundstücke.' }] };
    const section = { tab: 'Kultur', entries: [entry] };
    const node = { label: 'Szenen', path: ['Szenen'], entries: [entry], children: [], section };
    const renderings = [
      context.renderArchiveEntryCard(entry, section),
      context.buildArchiveDashboardSceneCards([section]),
      context.renderArchiveHierarchyEntry(entry),
      context.renderArchiveHierarchyContentHeading(node, { tab: 'Kultur', root: { label: 'Kultur' } }),
      context.buildArchiveDashboardDiscoveryPanel([{ ...section, entries: [{ ...entry, pages: [{ image: url, description: entry.pages[0].description }] }] }])
    ];
    for (const html of renderings) {
      assert.deepEqual(imageAttributes(html), [expectedAttribute], id);
      assert.doesNotMatch(html, /&amp;amp;/, id);
    }
  }
});

test('activity portraits and section icons follow the same safe image-source contract', () => {
  const context = createContext();
  const url = 'https://example.test/image.png?size=small&token=preview&download=1';
  const expected = 'https://example.test/image.png?size=small&amp;token=preview&amp;download=1';
  context.getAlmanachDashboardSceneActivity = () => ({ authorPortrait: url, authorName: 'Erzähler', commentCount: 1, activityAt: Date.now() });
  const section = { key: 'Kultur', tab: 'Kultur', path: [], iconUrl: url, entries: [{ id: 'scene', pages: [{ sessionPage: true }] }] };
  assert.deepEqual(imageAttributes(context.buildArchiveDashboardSceneCards([section])), [expected]);
  assert.deepEqual(imageAttributes(context.buildArchiveDashboardSectionCards([section])), [expected]);
  assert.deepEqual(imageAttributes(context.renderArchiveHierarchyRowIcon({ section })), [expected]);
});

test('preview URLs remain sanitized and cannot introduce image event handlers', () => {
  const context = createContext();
  for (const image of ['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>']) {
    const entry = { id: 'unsafe', title: 'Unsafe', pages: [{ image, sessionPage: true }] };
    assert.equal(context.getArchiveEntryPreviewImage(entry), '');
    assert.deepEqual(imageAttributes(context.renderArchiveEntryCard(entry, {})), []);
    assert.deepEqual(imageAttributes(context.buildArchiveDashboardSceneCards([{ entries: [entry] }])), []);
  }
  const image = 'https://example.test/image.png?token=x" onerror="alert(1)';
  const entry = { id: 'quoted', title: 'Quoted', pages: [{ image }] };
  const html = context.renderArchiveEntryCard(entry, {});
  assert.deepEqual(imageAttributes(html), ['https://example.test/image.png?token=x&quot; onerror=&quot;alert(1)']);
  assert.doesNotMatch(html, /"\s+onerror=/);
});
