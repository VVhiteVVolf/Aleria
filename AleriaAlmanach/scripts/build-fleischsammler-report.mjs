import { readFile, writeFile } from 'node:fs/promises';
import { buildReportBook } from '../modules/fleischsammler-report/report-book.mjs';
import { REPORT_DOCUMENT_ID } from '../modules/fleischsammler-report/case-records.mjs';
const check = process.argv.includes('--check');
if (process.argv.slice(2).some(arg => arg !== '--check')) throw Error('Nur --check ist als Prüfparameter erlaubt.');
const root = new URL('../../Dokumente%20aus%20der%20Werkstatt/', import.meta.url);
const document = buildReportBook();
const registry = JSON.parse(await readFile(new URL('registry.json', root), 'utf8'));
const entry = { id: REPORT_DOCUMENT_ID, title: document.title, category: document.category, template: 'book', revision: 1,
  pageCount: document.pages.length, link: `dokument.html?id=${REPORT_DOCUMENT_ID}` };
const index = registry.documents.findIndex(row => row.id === REPORT_DOCUMENT_ID);
if (index >= 0) registry.documents[index] = entry;
else registry.documents.push(entry);
for (const [path, data] of [[`data/${REPORT_DOCUMENT_ID}.json`, { schemaVersion: 2, id: REPORT_DOCUMENT_ID, revision: 1, document }], ['registry.json', registry]]) {
  const content = JSON.stringify(data, null, 2) + '\n';
  if (check) { if (await readFile(new URL(path, root), 'utf8') !== content) throw Error(`Veraltete Ermittlungsbuch-Ausgabe: ${path}`); }
  else await writeFile(new URL(path, root), content);
}
console.log(`${document.pages.length} Buchabschnitte; sechzehn Fälle, acht Familienberichte und abschließende Notizseite.`);
