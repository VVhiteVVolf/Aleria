import { posix } from 'node:path';
import { COASTAL_ARCHIVE, emptySourceText } from './coastal-sources.mjs';

export const escapeRecordText = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const recordHref = (from, to) => posix.relative(posix.dirname(from), to) || './';
export const recordParagraphs = blocks => blocks.map(block => `<p>${escapeRecordText(block.text)}</p>`).join('\n');
const e = escapeRecordText;
export function recordFacts(facts) {
  return `<table class="record-facts"><tbody>${facts.map(([label, value]) => `<tr><th scope="row">${e(label)}</th><td>${e(value)}</td></tr>`).join('')}</tbody></table>`;
}
function sourceTable(block) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = block.rows.flat().reduce((value, cell) => gcd(value, cell.colspan), 0) || 1;
  return `<div class="record-table-scroll" tabindex="0" role="region" aria-label="Quellentabelle"><table><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td${cell.colspan > divisor ? ` colspan="${cell.colspan / divisor}"` : ''}${cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : ''}>${emptySourceText(cell.text) ? '<span class="record-muted">Offen</span>' : e(cell.text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function recordSourceBook(source, file) {
  const base = recordHref(file, `${COASTAL_ARCHIVE}/${source.file}`);
  return `<details class="record-source-book" id="quellen"><summary>Quellenbuch aufschlagen <small>Texte, Tabellen und offene Vorlagenfelder</small></summary><p>Archivquelle ${e(source.id)} · <a href="${base.replace('.html', '.txt')}">Original als Text</a> · <a href="${base}" download>Unverändertes Original</a> · <a href="${recordHref(file, 'shared/coastal-history/redaktion.html')}">Abgleich und Bildnachweise</a>${source.id === 'coastal-11' ? ` · identische Zweitvorlage <a href="${recordHref(file, `${COASTAL_ARCHIVE}/15.txt`)}">15</a>` : ''}</p>${source.blocks.map((block, index) => {
    if (!index) return '';
    if (block.type === 'table') return /^Inhalt:/i.test(block.rows[0]?.[0]?.text) ? '' : sourceTable(block);
    if (emptySourceText(block.text)) return '';
    return block.type === 'heading' ? `<h3>${e(block.text.replace(/Übersi\s+cht/g, 'Übersicht'))}</h3>` : `<p>${e(block.text)}</p>`;
  }).join('\n')}</details>`;
}
export function recordShell({ file, title, subtitle, period, type, image, imageNote, contain = false, lead, content, facts, aside = '', navigation = '' }) {
  const href = target => recordHref(file, target);
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(lead)}"><title>${e(title)} · Aleria</title><link rel="stylesheet" href="${href('shared/coastal-history/record.css')}"></head>
<body class="coastal-record"><a class="record-skip" href="#chronik">Zum Text</a>
<header class="record-masthead"><a href="${href('Ereignisse/index.html')}">ALERIA <span>Chroniken & Küsten</span></a><nav aria-label="Hauptnavigation"><a href="${href('Ereignisse/Kriege/invasion-von-vennyr/index.html')}">Vennyr</a><a href="${href('Ereignisse/Kriege/raubzug-durch-leitheach/index.html')}">Leitheach</a><a href="${href('Piraterie/index.html')}">Piraterie</a><a href="${href('Fraktionen/index.html')}">Fraktionen</a><a href="${href('AleriaAlmanach/AleriaAlmanach.html')}">Almanach</a></nav></header>
<main><section class="record-hero${contain ? ' record-hero--figure' : ''}"><div class="record-hero-text"><p class="record-kicker">${e(type)} <span>◆</span> ${e(period)}</p><h1>${e(title)}</h1><p class="record-subtitle">${e(subtitle)}</p><a href="#chronik" class="record-read-link">Die Akte lesen <span aria-hidden="true">↓</span></a></div><figure><img src="${href(image)}" alt="${e(imageNote)}" fetchpriority="high" width="1024" height="1536"><figcaption>${e(imageNote)}</figcaption></figure></section>
<div class="record-status">Experimenteller Themenbereich · lokale Vorbereitung</div>
<div class="record-reading"><article id="chronik"><p class="record-lead">${e(lead)}</p>${content}</article><aside class="record-aside" aria-label="Kompakte Infotabelle"><div class="record-aside-inner"><p class="record-kicker">Die Akte</p>${recordFacts(facts)}${navigation ? `<nav class="record-toc" aria-label="Auf dieser Seite">${navigation}</nav>` : ''}${aside}</div></aside></div>
</main><footer class="record-footer">Alerias Küstenchroniken · Vorbereitete Fassung vom 24. Oktober 2026 · <a href="${href('shared/coastal-history/redaktion.html')}">Quellen & Bildnachweise</a></footer><script type="module" src="${href('shared/coastal-history/record-dialogs.mjs')}"></script></body></html>\n`;
}
