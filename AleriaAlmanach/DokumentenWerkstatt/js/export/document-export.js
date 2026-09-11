import { normalizeDocument, escapeHtml } from '../document-schema.js';
import { readableText } from '../document-content.js';
import { buildDocumentHtml } from '../document-renderer.js';
import { ensureDocumentFont, exportFontCss } from '../fonts/document-fonts.js';
import { canvasBlob, blobDataUrl, downloadBlob } from './document-download.js';
import { createPngArchive } from './png-archive.js';
import { prepareBookExportPages } from '../book/book-export-pages.js';

let canvasLibrary;
function loadCanvasLibrary() {
  if (!canvasLibrary) canvasLibrary = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('../../../../Stammbäume/vendor/html2canvas/1.4.1/html2canvas.min.js', import.meta.url).href;
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => { canvasLibrary = null; reject(new Error('Der PNG-Renderer konnte nicht geladen werden.')); };
    document.head.append(script);
  });
  return canvasLibrary;
}

async function embedImages(meta) {
  const images = new Map();
  const embed = async url => {
    if (!url || url.startsWith('data:')) return url;
    if (!images.has(url)) images.set(url, (async () => {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Bild nicht erreichbar.');
      return blobDataUrl(await response.blob());
    })());
    try { return await images.get(url); }
    catch { throw new Error('Ein Bild erlaubt keinen Export. Bitte das Bild herunterladen und über „Bilddatei einfügen“ lokal einbinden.'); }
  };
  for (const slot of Object.values(meta.media)) slot.image = await embed(slot.image);
  if (meta.background === 'custom') meta.texture = await embed(meta.texture);
  return meta;
}

async function capturePng(node, html2canvas, scale) {
  await Promise.all([...node.querySelectorAll('img')].map(image => image.decode()));
  const width = Math.ceil(node.getBoundingClientRect().width), height = Math.ceil(node.getBoundingClientRect().height);
  if (width * height * scale * scale > 40000000 || height * scale > 16384) throw new Error('Diese Seite ist für die gewählte Auflösung zu lang. Bitte Text auf Buchseiten verteilen oder die Auflösung reduzieren.');
  if (node.querySelector('.book-overflow')) throw new Error('Ein Buchinhalt ist größer als eine Druckseite. Bitte lange Listen oder untrennbare Blöcke im Text aufteilen. Die vollständige HTML-Fassung bleibt verfügbar.');
  const canvas = await html2canvas(node, { backgroundColor: null, scale, logging: false, useCORS: true, allowTaint: false, width, height, scrollX: 0, scrollY: 0, windowWidth: 1600 });
  return { blob: await canvasBlob(canvas), width: canvas.width, height: canvas.height };
}

export async function renderDocumentPng(input, { scale = 3, readable = false, position = null } = {}) {
  const meta = await embedImages(normalizeDocument(input));
  await ensureDocumentFont(meta); await document.fonts.ready;
  const html2canvas = await loadCanvasLibrary();
  if (meta.template === 'book') {
    const book = prepareBookExportPages(meta, { readable, position });
    try { return await capturePng(book.leaves[book.index], html2canvas, scale); }
    finally { book.destroy(); }
  }
  const stage = document.createElement('div');
  stage.className = `document-export-stage template-${meta.template}${readable ? ' readable-document' : ''}`;
  stage.style.width = `${meta.width}px`;
  stage.innerHTML = buildDocumentHtml(meta);
  document.body.append(stage);
  try {
    const node = stage.querySelector('.doc-shell');
    return await capturePng(node, html2canvas, scale);
  } finally { stage.remove(); }
}

export async function exportPng(meta, { allPages = false, scale = 3, readable = false, position = null, onProgress = () => {} } = {}) {
  if (allPages && meta.template === 'book') {
    meta = await embedImages(normalizeDocument(meta));
    await ensureDocumentFont(meta); await document.fonts.ready;
    const html2canvas = await loadCanvasLibrary();
    const book = prepareBookExportPages(meta, { readable });
    const files = [];
    try {
      for (let page = 0; page < book.leaves.length; page++) {
        onProgress(`Buchseite ${page + 1} / ${book.leaves.length} wird exportiert …`);
        const result = await capturePng(book.leaves[page], html2canvas, scale);
        files.push({ name: `${meta.slug}-${String(page).padStart(3, '0')}.png`, blob: result.blob });
      }
    } finally { book.destroy(); }
    downloadBlob(`${meta.slug}-buchseiten.zip`, await createPngArchive(files));
    return `${files.length} Buchseiten einschließlich Einband als PNG im ZIP exportiert.`;
  }
  const result = await renderDocumentPng(meta, { scale, readable, position });
  downloadBlob(`${meta.slug}${readable ? '-lesefassung' : ''}.png`, result.blob);
  return `PNG exportiert: ${result.width} × ${result.height} Pixel, mit Transparenz.`;
}

export async function exportStandalone(input) {
  const meta = await embedImages(normalizeDocument(input));
  const css = await Promise.all(['werkstatt.css', 'document.css'].map(async name => {
    const response = await fetch(new URL(`../../css/${name}`, import.meta.url));
    if (!response.ok) throw new Error('Die Exportgestaltung konnte nicht geladen werden.');
    return response.text();
  }));
  const fontCss = await exportFontCss(meta);
  let bookScript = '';
  if (meta.template === 'book') {
    const bookCss = await fetch(new URL('../../../../Bestiarium/modules/book-reader/book-reader.css', import.meta.url));
    const runtime = await fetch(new URL('../../assets/book-reader.bundle.js', import.meta.url));
    if (!bookCss.ok || !runtime.ok) throw new Error('Die Bestiarium-Buchdateien für den Export konnten nicht geladen werden.');
    css.splice(1, 0, await bookCss.text());
    bookScript = `<script>${(await runtime.text()).replace(/<\/script/gi, '<\\/script')}</script>`;
  }
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(meta.title)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Eagle+Lake&family=EB+Garamond&family=Uncial+Antiqua&family=MedievalSharp&family=IM+Fell+English+SC&family=Pirata+One&family=Macondo&family=UnifrakturMaguntia&family=Special+Elite&family=Homemade+Apple&family=Shadows+Into+Light&family=Rock+Salt&family=Fredericka+the+Great&family=Creepster&display=swap">
  <style>${css.join('\n')}${fontCss}</style></head><body class="document-reader"><main class="reader-main"><details class="reading-panel"><summary>Übersetzen · lesbare Fassung</summary><h1>${escapeHtml(meta.title)}</h1><div class="reading-text">${escapeHtml(readableText(meta))}</div></details>
  <div class="template-${meta.template}">${buildDocumentHtml(meta).replace('data-workshop-book=""', 'data-book-reader')}</div></main>${bookScript}</body></html>`;
  downloadBlob(`${meta.slug}.html`, new Blob([html], { type: 'text/html;charset=utf-8' }));
}
