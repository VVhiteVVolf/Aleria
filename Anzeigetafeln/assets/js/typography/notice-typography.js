import { NOTICE_HANDWRITING, noticeLanguageFonts, normalizeNoticeTypography } from './notice-font-catalog.mjs';
import { ensureNoticeFont } from './notice-font-loader.mjs';

const esc = value => window.TafelRuntime.esc(value);
const buttons = new WeakMap();
const sampleRequests = new WeakMap();
const languages = () => noticeLanguageFonts(window.AleriaLanguageScripts?.entries);
const normalize = value => normalizeNoticeTypography(value, languages());
const hand = id => NOTICE_HANDWRITING.find(font => font.id === id);
const language = id => languages().find(font => font.id === id);
const sampleText = 'Die flinke Füchsin läuft über den großen Markt. Bitte bringt fünf Krüge mit!';

function options(value, heading = false) {
  return `${heading ? `<option value="inherit" ${value === 'inherit' ? 'selected' : ''}>Wie der Text</option>` : ''}<option value="template" ${value === 'template' ? 'selected' : ''}>Schrift der Vorlage</option>${NOTICE_HANDWRITING.map(font => `<option value="${font.id}" ${value === font.id ? 'selected' : ''}>${esc(font.label)} · ${esc(font.family)}</option>`).join('')}`;
}

function controls(notice) {
  const style = normalize(notice.typography);
  return `<details class="notice-typography-controls" open><summary>Handschrift & Sprache</summary>
    <div class="notice-font-fields"><label>Textschrift<select class="e-sel" data-input-action="notice-typography-field" data-notice-id="${esc(notice.id)}" data-font-field="font">${options(style.font)}</select></label>
    <label>Überschrift<select class="e-sel" data-input-action="notice-typography-field" data-notice-id="${esc(notice.id)}" data-font-field="heading">${options(style.heading, true)}</select></label>
    <label class="notice-script-field">Sprache / Zeichenschrift<select class="e-sel" data-input-action="notice-typography-field" data-notice-id="${esc(notice.id)}" data-font-field="script"><option value="common" ${style.script === 'common' ? 'selected' : ''}>Lesbare Schrift</option>${languages().map(font => `<option value="${font.id}" ${style.script === font.id ? 'selected' : ''}>${esc(font.label)}</option>`).join('')}</select></label></div>
    <p class="notice-font-editor-note">Den Wortlaut lesbar eingeben. Im Aushang erscheint die gewählte Schrift; der Lesebutton zeigt wieder die lesbare Fassung.</p>
    <div class="notice-font-sample" data-notice-font-sample aria-label="Schriftprobe">${sampleText}</div>
  </details>`;
}

function field(element) {
  const notice = window.TafelRuntime.state().zettel.find(item => item.id === element.dataset.noticeId);
  const key = element.dataset.fontField;
  if (!notice || !window.TafelRuntime.canEditZettel() || !['font', 'heading', 'script'].includes(key)) return;
  const current = normalize(notice.typography);
  const next = normalize({ ...current, [key]: element.value });
  if (JSON.stringify(current) === JSON.stringify(next)) return;
  notice.typography = next;
  updateSample(document.querySelector('#sidebar [data-notice-font-sample]'), notice);
  window.TafelRuntime.renderEditorPreview();
  window.TafelState.save();
}

async function updateSample(element, notice) {
  if (!element) return;
  const token = {};
  sampleRequests.set(element, token);
  const style = normalize(notice.typography);
  const font = language(style.script) || hand(style.font);
  element.textContent = sampleText;
  element.style.fontFamily = font ? `"${font.family}", serif` : '"EB Garamond", Georgia, serif';
  element.dir = language(style.script)?.direction || 'ltr';
  try {
    await ensureNoticeFont(font);
    if (element.isConnected && sampleRequests.get(element) === token && style.script !== 'common') {
      element.textContent = window.AleriaLanguageScripts.display(sampleText, style.script);
    }
  } catch {
    if (element.isConnected && sampleRequests.get(element) === token) element.textContent = 'Die Schriftprobe ist gerade nicht verfügbar. Der gespeicherte Wortlaut bleibt erhalten.';
  }
}

function regions(article) {
  const selector = '.quest-header h2, .quest-header > p, .notice-heading h2, .notice-subtitle, .notice-copy, .notice-scroll-copy, .notice-news-article > h3, .notice-fact dd, .medieval-info-table td, .notice-person-name, .notice-subject-portrait figcaption';
  return [...article.querySelectorAll(selector)].filter(element => !element.matches('.notice-copy') || !element.querySelector('.notice-scroll-copy')).map(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest('button, a, .notice-money, .notice-reward-button')) nodes.push([node, node.nodeValue]);
    }
    return { element, heading: element.matches('h2,h3'), nodes,
      fontFamily: element.style.fontFamily, fontWeight: element.style.fontWeight,
      fontStyle: element.style.fontStyle, fontSynthesis: element.style.fontSynthesis,
      direction: element.getAttribute('dir') };
  });
}

function mount(root, notice) {
  const article = root.querySelector('[data-notice-layout]');
  const style = normalize(notice.typography);
  if (!article || (style.font === 'template' && ['inherit', 'template'].includes(style.heading) && style.script === 'common')) return () => {};
  let disposed = false;
  let ready = false;
  let readable = false;
  let failed = false;
  const script = language(style.script);
  const targets = regions(article);
  const bar = document.createElement('div');
  bar.className = 'notice-lettering-bar';
  bar.innerHTML = `<span data-lettering-label></span><button type="button" data-action="notice-font-readable" aria-pressed="false">${script ? 'Übersetzen' : 'Lesbar anzeigen'}</button>`;
  article.prepend(bar);
  const button = bar.querySelector('button');
  const label = bar.querySelector('[data-lettering-label]');

  function paint() {
    if (disposed) return;
    article.dataset.letteringState = ready ? 'ready' : 'loading';
    for (const target of targets) {
      const selected = script || hand(target.heading && style.heading !== 'inherit' ? style.heading : style.font);
      const family = readable ? (target.heading ? '"Cinzel", Georgia, serif' : '"EB Garamond", Georgia, serif') : selected ? `"${selected.family}", serif` : target.fontFamily;
      target.element.style.fontFamily = family;
      if (selected || readable) {
        target.element.style.fontWeight = '400';
        target.element.style.fontStyle = 'normal';
        target.element.style.fontSynthesis = 'none';
      } else {
        target.element.style.fontWeight = target.fontWeight;
        target.element.style.fontStyle = target.fontStyle;
        target.element.style.fontSynthesis = target.fontSynthesis;
      }
      if (script && !readable) target.element.setAttribute('dir', script.direction);
      else if (target.direction) target.element.setAttribute('dir', target.direction);
      else target.element.removeAttribute('dir');
      for (const [node, text] of target.nodes) node.nodeValue = script && ready && !readable ? window.AleriaLanguageScripts.display(text, style.script) : text;
    }
    label.textContent = failed ? 'Schrift nicht verfügbar · lesbare Fassung' : readable ? 'Lesbare Fassung' : `${script?.label || hand(style.font)?.label || hand(style.heading)?.label || 'Eigene Handschrift'}${ready ? '' : ' · Schrift wird geladen'}`;
    button.textContent = readable ? 'Originalschrift' : script ? 'Übersetzen' : 'Lesbar anzeigen';
    button.setAttribute('aria-pressed', String(readable));
    button.disabled = failed;
  }

  buttons.set(button, () => { readable = !readable; paint(); });
  paint();
  Promise.all([script || hand(style.font), !script && hand(style.heading)].filter(Boolean).map(ensureNoticeFont)).then(() => {
    if (disposed) return;
    ready = true;
    paint();
  }).catch(() => {
    if (disposed) return;
    ready = true;
    failed = true;
    readable = true;
    paint();
  });
  return () => { disposed = true; buttons.delete(button); };
}

export function initializeNoticeTypography() {
  window.TafelNoticeTypography = Object.freeze({ controls, field, mount, updateSample,
    toggle: element => buttons.get(element)?.(), normalize });
}
