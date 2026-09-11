import { loadPublishedDocument } from './library/document-publisher.js';
import { normalizeDocument } from './document-schema.js';
import { buildDocumentHtml } from './document-renderer.js';
import { readableText } from './document-content.js';
import { preparePaperAssets } from './paper/paper-generator.js';
import { ensureDocumentFont } from './fonts/document-fonts.js';
import { exportPng } from './export/document-export.js';
import { createWorkshopBookMount, readBookPosition } from './book/workshop-book.js';

const root = document.querySelector('[data-role="document-reader"]');
const status = root.querySelector('[data-role="reader-status"]');
const output = root.querySelector('[data-role="reader-document"]');
const bookMount = createWorkshopBookMount(output);
let meta;
try {
  const id = new URLSearchParams(location.search).get('id');
  const envelope = await loadPublishedDocument(id);
  meta = normalizeDocument(envelope.document);
  await preparePaperAssets(); await ensureDocumentFont(meta);
  document.title = `${meta.title} · Aleria`;
  root.querySelector('[data-role="reader-title"]').textContent = meta.title;
  root.querySelector('[data-role="reader-text"]').textContent = readableText(meta);
  root.querySelector('[data-role="reader-edit"]').href += `?document=${encodeURIComponent(id)}`;
  output.classList.add(`template-${meta.template}`);
  output.innerHTML = buildDocumentHtml(meta);
  await bookMount.update(meta);
  root.querySelector('[data-reader-action="png"]').disabled = false;
} catch (error) { status.textContent = error.message; root.querySelector('[data-role="reader-title"]').textContent = 'Dokument nicht verfügbar'; }

root.addEventListener('click', async event => {
  if (!meta) return;
  const png = event.target.closest('[data-reader-action="png"]');
  if (png && !png.disabled) {
    png.disabled = true; status.textContent = 'PNG wird erzeugt …';
    try { status.textContent = await exportPng(meta, { position: readBookPosition(output) }); } catch (error) { status.textContent = error.message; }
    finally { png.disabled = false; }
  }
});
