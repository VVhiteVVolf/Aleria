import { normalizeDocument, safeImageUrl } from './document-schema.js';
import { readableText } from './document-content.js';
import { readFontFile } from './fonts/document-fonts.js';
import { PAPER_COLORS, createPaperCanvas } from './paper/paper-generator.js';
import { exportPng } from './export/document-export.js';
import { blobDataUrl, canvasBlob, downloadBlob } from './export/document-download.js';
import { readBookPosition } from './book/workshop-book.js';

const CONTROLS = {
  lineHeight: 'doc-line-height', letterSpacing: 'doc-letter-spacing', padding: 'doc-padding', ink: 'doc-ink',
  paperColor: 'doc-paper-color', paperEdge: 'doc-paper-edge', paperAge: 'doc-paper-age', paperSeed: 'doc-paper-seed',
  translation: 'doc-translation', category: 'doc-category'
};

export function createEnhancements(root, { getMeta, refresh, setStatus }) {
  let customFont = null;
  let exporting = false;
  const field = id => root.querySelector(`#${id}`);
  const controls = Object.fromEntries(Object.entries(CONTROLS).map(([key, id]) => [key, field(id)]));
  const updateExportSize = meta => {
    const scale = Number(field('png-scale').value);
    root.querySelector('[data-role="png-size"]').textContent = meta.template === 'book'
      ? `${Math.floor(Math.min(960, meta.width) / 2) * scale} × ${Math.max(560, Math.min(720, meta.height)) * scale} Pixel je Buchseite. Der Text wird mit dem Bestiarium-Seitenumbruch gesetzt.`
      : `${meta.width * scale} × mindestens ${meta.height * scale} Pixel. Lange Inhalte vergrößern die Bildhöhe.`;
  };
  root.querySelector('[data-role="paper-palette"]').innerHTML = Object.entries(PAPER_COLORS).map(([key, palette]) =>
    `<button type="button" class="paper-swatch" style="--swatch:${palette.color}" data-enhance-action="paper-color" data-color="${key}" aria-label="${palette.name}" title="${palette.name}"><span>${palette.name}</span></button>`).join('');
  const update = event => {
    if (Object.values(controls).includes(event.target)) refresh();
  };
  root.addEventListener('input', update);
  root.addEventListener('change', async event => {
    const input = event.target;
    if (input.id === 'doc-font' && input.value === "'Workshop Custom'" && !customFont) {
      input.value = "'Eagle Lake'"; refresh(); setStatus('Bitte zuerst eine eigene Schriftdatei laden.');
    }
    if (input.id === 'png-scale') updateExportSize(getMeta());
    if (input.dataset.enhanceFile === 'font' && input.files[0]) {
      try {
        customFont = await readFontFile(input.files[0]); field('doc-font').value = "'Workshop Custom'";
        field('custom-font-name').textContent = customFont.name; refresh(); setStatus('Eigene Schrift geladen. Sie wird mit dem Dokument gespeichert.');
      } catch (error) { setStatus(error.message); } finally { input.value = ''; }
    }
    if (input.dataset.enhanceFile === 'image' && input.files[0]) {
      try {
        const file = input.files[0];
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2000000) throw new Error('Bitte PNG, JPEG oder WebP bis 2 MB wählen.');
        const data = safeImageUrl(await blobDataUrl(file));
        if (!data) throw new Error('Ungültiges Bildformat.');
        const image = new Image(); image.src = data; await image.decode();
        const target = input.dataset.target || field('image-upload-target').value;
        field(target).value = data;
        if (target === 'doc-texture') field('doc-background').value = 'custom';
        refresh(); setStatus('Bild eingebunden und im Dokument vorgemerkt.');
      } catch (error) { setStatus(error.message); } finally { input.value = ''; }
    }
  });
  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-enhance-action]');
    if (!button) return;
    try {
      switch (button.dataset.enhanceAction) {
        case 'paper-color': controls.paperColor.value = button.dataset.color; field('doc-background').value = 'generated'; refresh(); break;
        case 'generate-paper': controls.paperSeed.value = String(1 + crypto.getRandomValues(new Uint32Array(1))[0] % 999999); field('doc-background').value = 'generated'; refresh(); setStatus('Neues Pergament erzeugt. Die Variante bleibt im Dokument gespeichert.'); break;
        case 'download-paper': downloadBlob('aleria-pergament.png', await canvasBlob(createPaperCanvas(getMeta(), 2048, 3072))); setStatus('Pergament als PNG mit 2048 × 3072 Pixeln exportiert.'); break;
        case 'translate': {
          const panel = root.querySelector('[data-role="reading-panel"]'); panel.hidden = !panel.hidden;
          button.setAttribute('aria-expanded', String(!panel.hidden));
          if (!panel.hidden) panel.querySelector('.reading-text').textContent = readableText(getMeta());
          break;
        }
        case 'export-png': {
          if (exporting) return;
          exporting = true;
          const buttons = root.querySelectorAll('[data-enhance-action="export-png"]'); buttons.forEach(control => { control.disabled = true; });
          setStatus('PNG wird in hoher Auflösung erzeugt …');
          try { setStatus(await exportPng(getMeta(), { scale: Number(field('png-scale').value), allPages: field('png-pages').value === 'all', readable: field('png-readable').checked, position: readBookPosition(root), onProgress: setStatus })); }
          finally { exporting = false; buttons.forEach(control => { control.disabled = false; }); }
          break;
        }
      }
    } catch (error) { setStatus(error.message); }
  });
  field('doc-background').addEventListener('change', () => {
    const presets = { parchment: ['ivory', 25], aged: ['honey', 75], fibers: ['ivory', 45], plain: ['ivory', 0], dark: ['ash', 60] };
    const preset = presets[field('doc-background').value];
    if (preset) { controls.paperColor.value = preset[0]; controls.paperAge.value = preset[1]; if (preset[0] === 'ash') controls.ink.value = '#f3e7c9'; }
    refresh();
  });
  return {
    getMeta: () => ({ ...Object.fromEntries(Object.entries(controls).map(([key, control]) => [key, control.value])), customFont }),
    setMeta: input => {
      const meta = normalizeDocument(input); customFont = meta.customFont;
      for (const [key, control] of Object.entries(controls)) control.value = meta[key];
      field('custom-font-name').textContent = customFont?.name || 'WOFF2, WOFF, TTF oder OTF · bis 1,4 MB';
    },
    render: meta => {
      root.querySelectorAll('[data-enhance-action="paper-color"]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === meta.paperColor)));
      root.querySelector('[data-role="document-metrics"]').textContent = meta.template === 'book' ? `${meta.pages.length} Aufzeichnungen · Buchansicht` : `${meta.width} × ${meta.height} px · ${meta.pages.length} ${meta.pages.length === 1 ? 'Seite' : 'Seiten'}`;
      root.querySelector('[data-role="reading-panel"] .reading-text').textContent = readableText(meta);
      updateExportSize(meta);
    }
  };
}
