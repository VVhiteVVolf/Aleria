import { escapeHtml, safeImageUrl, clampNumber, normalizeDocument } from './document-schema.js';
import { sanitizeContent } from './document-content.js';
import { buildWorkshopBook } from './book/workshop-book.js';
import { paperBackground } from './paper/paper-generator.js';

export function buildShellStyle(meta) {
  const borders = { none: '0 solid transparent', thin: '1px solid #977747', double: '4px double #785c32', heavy: '4px solid #42311e', ornate: '8px ridge #a58450' };
  return [
    `--preview-font:${meta.font}`, `--preview-size:${meta.fontSize}px`,
    `--doc-width:${meta.width}px`, `--doc-height:${meta.height}px`,
    `--doc-padding:${meta.padding}px`, `--doc-line-height:${meta.lineHeight}`,
    `--doc-letter-spacing:${meta.letterSpacing}px`, `--ink:${meta.ink}`,
    `--ink-soft:${meta.ink}`,
    '--document-background-size:100% 100%',
    `--document-border:${meta.paperEdge === 'straight' ? borders[meta.border] || borders.thin : '0 solid transparent'}`,
    '--document-frame-shadow:none'
  ].join(';');
}

export function buildDocumentHtml(input, options = {}) {
  const meta = normalizeDocument(input);
  if (meta.template === 'book') return `<div class="doc-shell workshop-book-shell" style="${escapeHtml(buildShellStyle(meta))}">${buildWorkshopBook(meta)}</div>`;
  const paperStyle = escapeHtml(`background-image:${paperBackground(meta)};background-size:100% 100%`);
  const body = buildDocumentBody(meta, options).replace('class="document', `style="${paperStyle}" class="document`);
  return `<div class="doc-shell paper-shell" style="${escapeHtml(buildShellStyle(meta))}">${body}</div>`;
}

function buildMetaLine(meta) {
  return [
    meta.location,
    meta.date,
    meta.author ? `Von ${meta.author}` : "",
    meta.recipient ? `An ${meta.recipient}` : ""
  ].filter(Boolean).map(item => `<span>${escapeHtml(item)}</span>`).join("");
}

function buildImageSlot(slot, label = "Bildplatz", extraClass = "") {
  const image = safeImageUrl(slot?.image);
  const position = ["left", "center", "right", "watermark"].includes(slot?.position) ? slot.position : "right";
  const frame = ["plain", "none", "heavy"].includes(slot?.frame) ? slot.frame : "plain";
  const size = clampNumber(slot?.size, 240, 80, 900);
  return `<div class="doc-image-slot ${extraClass} position-${position} frame-${frame}${image ? " filled" : " empty"}" style="--slot-image-size:${size}px">${image ? `<img src="${escapeHtml(image)}" alt="">` : `<span>${escapeHtml(label)}</span>`}</div>`;
}

function buildFilledImageSlot(slot, label, extraClass = "") {
  return safeImageUrl(slot?.image) ? buildImageSlot(slot, label, extraClass) : "";
}

function buildDocumentMedia(meta, keys = ["main", "signature", "emblem", "watermark"]) {
  const labels = {
    main: "Hauptbild",
    signature: "Signatur",
    emblem: "Siegel / Emblem",
    watermark: "Wasserzeichen"
  };
  return keys.map(key => buildFilledImageSlot(meta.media?.[key], labels[key], `slot-${key}`)).join("");
}

function buildDocumentBody(meta, options = {}) {
  if (meta.template === 'wanted') return buildWantedPoster(meta);
  const metaLine = buildMetaLine(meta);
  const head = meta.template === "note" ? "" : `
    <div class="doc-meta">${metaLine}</div>
    <h1 class="doc-title">${escapeHtml(meta.title)}</h1>
    ${meta.subtitle ? `<div class="doc-subtitle">${escapeHtml(meta.subtitle)}</div>` : ""}
    <div class="doc-divider"></div>`;
  const bottomMedia = meta.template === "note" ? "" : buildDocumentMedia(meta);
  return `
    <div class="document">
      ${head}
      <div class="doc-content">${sanitizeContent(meta.pages[meta.currentPage] || meta.pages[0] || "")}</div>
      ${meta.template !== "note" && meta.author ? `<div class="signature">${escapeHtml(meta.author)}</div>` : ""}
      ${bottomMedia}
    </div>`;
}

function buildWantedPoster(meta) {
  const sketch = meta.media.main.image;
  const signature = buildFilledImageSlot(meta.media.signature, 'Unterschrift', 'wanted-signature-image');
  const seal = meta.media.emblem.image
    ? buildFilledImageSlot({ ...meta.media.emblem, position: 'right', frame: 'none' }, 'Wachssiegel', 'wanted-wax-seal')
    : '<div class="wanted-seal-space" aria-label="Platz für ein Wachssiegel"><span>Siegel</span></div>';
  return `<div class="document wanted-poster">
    <header class="wanted-header${sketch ? ' has-sketch' : ''}"><div class="wanted-heading">
      <h1 class="doc-title">${escapeHtml(meta.title)}</h1>
      ${meta.subtitle ? `<p class="doc-subtitle">${escapeHtml(meta.subtitle)}</p>` : ''}
      ${meta.location || meta.date ? `<p class="wanted-origin">${escapeHtml([meta.location, meta.date].filter(Boolean).join(' · '))}</p>` : ''}
    </div>${sketch ? `<figure class="wanted-sketch" style="width:${Math.min(300, meta.media.main.size)}px"><img src="${escapeHtml(sketch)}" alt="Skizze zum Aushang"></figure>` : ''}</header>
    <div class="wanted-rule" aria-hidden="true"></div>
    <div class="doc-content">${sanitizeContent(meta.pages[meta.currentPage] || meta.pages[0] || '')}</div>
    <footer class="wanted-footer"><div class="wanted-signoff">${signature}${meta.author ? `<div class="signature">${escapeHtml(meta.author)}</div>` : '<div class="wanted-signature-line" aria-label="Platz für die Unterschrift"></div>'}</div>${seal}</footer>
    ${buildFilledImageSlot(meta.media.watermark, 'Wasserzeichen', 'slot-watermark')}
  </div>`;
}
