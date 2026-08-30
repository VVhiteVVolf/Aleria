import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'modules/archive/archive-dashboard.js'), 'utf8');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function createContext() {
  const sections = [{
    key: 'Chroniken',
    tab: 'Chroniken',
    entries: [{
      id: 'scene-court',
      title: 'Der Hof von Celtigerns Wacht',
      pages: [{
        pageTitle: 'Die Anhörung',
        sessionPage: true,
        description: 'Im großen Saal versammelt sich der Hof, während die Banner über den Reihen der Gäste ruhen.'
      }]
    }, {
      id: 'lore-cenyr',
      title: 'Die Chronik von Cenyr',
      pages: [{
        description: 'Die Chronik verzeichnet Herrscherhäuser, Bündnisse und Wendepunkte des Königreichs über mehrere Zeitalter.'
      }]
    }]
  }];
  const context = vm.createContext({
    console,
    Date,
    Intl,
    document: { addEventListener() {}, querySelector() { return null; } },
    escapeHtml,
    getArchiveEntryPageCount(entry) { return entry.pages.length; },
    getArchiveEntryPreviewImage(entry) { return entry.id === 'lore-cenyr' ? 'chronik.png' : 'court.png'; },
    getSectionOptionLabel(section) { return section.tab || section.key; },
    getThemeMetaForSection() { return { slug: 'chroniken' }; },
    getArchiveSectionStats(_section, entries) {
      return { moduleCount: entries.length, pageCount: entries.reduce((sum, entry) => sum + entry.pages.length, 0) };
    },
    sanitizeImageSrc(value) { return String(value || ''); },
    getInitialChar(value) { return String(value || '?').charAt(0); },
    getAlmanachDashboardRecentEntries() { return []; },
    getAlmanachDashboardContinuation() { return null; },
    getArchiveDashboardInsights() { return []; },
    renderArchiveDashboardInsightCards() { return ''; },
    getValidSections() { return sections; }
  });
  vm.runInContext(source, context, { filename: 'archive-dashboard.js' });
  return { context, sections };
}

test('Dashboard rendert echte Archivdaten ohne leere Platzhaltertexte', () => {
  const { context, sections } = createContext();
  const html = context.renderArchiveDashboard(sections);

  assert.match(html, /Fundstück des Tages/);
  assert.match(html, /Die Chronik von Cenyr/);
  assert.match(html, /Zuletzt kommentiert/);
  assert.match(html, /Der Hof von Celtigerns Wacht/);
  assert.match(html, /Wusstest du schon\?/);
  assert.doesNotMatch(html, /Noch keine|Keine interaktiven Szenen|Lorem ipsum|Platzhalter|Placeholder/i);
});

test('Platzhalterbilder und Platzhaltertexte werden nicht als Fundstück verwendet', () => {
  const { context } = createContext();
  context.getArchiveEntryPreviewImage = () => 'assets/Platzhalter.png';
  assert.equal(context.getArchiveDashboardEntryImage({ id: 'x', pages: [] }), '');
  assert.equal(context.isArchiveDashboardPlaceholderText('TODO: Noch ausfüllen'), true);
  assert.equal(context.isArchiveDashboardPlaceholderText('Ein belegter Satz aus der Chronik.'), false);
});
