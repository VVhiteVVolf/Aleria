const fs = require('fs');
const path = require('path');
const vm = require('vm');

const almanachRoot = path.resolve(__dirname, '..');
const context = vm.createContext({
  sanitizeImageSrc: value => String(value || '').trim(),
  escapeHtml: value => String(value || ''),
  getSectionOptionLabel: () => '',
  document: { addEventListener() {} },
  console
});

function load(relativePath) {
  const filename = path.resolve(almanachRoot, relativePath);
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}

load('modules/archive/archive-card-meta.js');
load('modules/archive/archive-dashboard.js');
load('modules/name-list/name-list-data.js');
load('modules/script-table/script-table-data.js');
load('modules/language/language-reference-entries.js');
load('data/sections.js');

const results = vm.runInContext(`(() => {
  const entry = {
    image: 'entry-image.png',
    pages: [
      { image: 'page-one.png' },
      { image: 'page-two.png' },
      { _commentsPage: true, image: 'comments.png' }
    ]
  };
  const languageEntries = SECTIONS.find(section => section.key === 'Sprachen')?.entries || [];
  const actualPageOneImages = languageEntries
    .filter(candidate => candidate?.pages?.[0]?.image)
    .map(candidate => ({
      id: candidate.id,
      expected: candidate.pages[0].image,
      actual: getArchiveEntryPreviewImage(candidate)
    }));
  return {
    preview: getArchiveEntryPreviewImage(entry),
    dashboard: getArchiveDashboardEntryImage(entry),
    entryFallback: getArchiveEntryPreviewImage({ image: 'entry-image.png', pages: [{ image: '' }] }),
    laterPageFallback: getArchiveEntryPreviewImage({ pages: [{ image: '' }, { image: 'page-two.png' }] }),
    nestedFallback: getArchiveEntryPreviewImage({ pages: [{ image: '' }, { wanted: [{ img: 'wanted.png' }] }] }),
    actualPageOneImages
  };
})()`, context);

const failures = [];
if (results.preview !== 'page-one.png') failures.push('Die Archivliste bevorzugt nicht das Hauptbild von Seite I.');
if (results.dashboard !== 'page-one.png') failures.push('Das Archivdashboard verwendet eine abweichende Bildpriorität.');
if (results.entryFallback !== 'entry-image.png') failures.push('Das Eintragsbild funktioniert nicht als Fallback.');
if (results.laterPageFallback !== 'page-two.png') failures.push('Spätere Seitenbilder funktionieren nicht als letzter Fallback.');
if (results.nestedFallback !== 'wanted.png') failures.push('Spezialisierte Seitenbilder funktionieren nicht als letzter Fallback.');
results.actualPageOneImages.forEach(item => {
  if (item.actual !== item.expected) failures.push(`Sprachmodul ${item.id} verwendet nicht das Bild von Seite I.`);
});

if (failures.length) {
  console.error(`Archivbild-Prüfung fehlgeschlagen:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Archivbild-Prüfung OK: Seite I wird in Liste und Dashboard bevorzugt.');
