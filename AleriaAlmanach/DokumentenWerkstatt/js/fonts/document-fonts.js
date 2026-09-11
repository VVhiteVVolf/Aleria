import { PROJECT_FONTS } from './font-catalog.js';
import { FONT_DATA } from '../document-schema.js';

const loaded = new Map();
export function installFontOptions(select) {
  const group = document.createElement('optgroup'); group.label = 'Schriften Alerias';
  PROJECT_FONTS.forEach(font => group.append(new Option(font.label, `'${font.family}'`)));
  select.append(group, new Option('Eigene Schriftdatei', "'Workshop Custom'"));
}

export async function ensureDocumentFont(meta) {
  const font = PROJECT_FONTS.find(entry => `'${entry.family}'` === meta.font);
  const custom = meta.font === "'Workshop Custom'" && meta.customFont;
  const source = custom ? meta.customFont.data : font?.url;
  const family = custom ? 'Workshop Custom' : font?.family;
  if (!source || !family) { await document.fonts.load(`${meta.fontSize}px ${meta.font}`); return; }
  if (loaded.get(family)?.source === source) return loaded.get(family).ready;
  const previous = loaded.get(family)?.face;
  const face = new FontFace(family, `url("${source}")`);
  const ready = face.load().then(() => {
    if (loaded.get(family)?.face !== face) return;
    if (previous) document.fonts.delete(previous); document.fonts.add(face);
  });
  loaded.set(family, { source, face, ready });
  try { await ready; } catch (error) { loaded.delete(family); throw new Error(`Die Schrift „${family}“ konnte nicht geladen werden.`); }
}

export async function readFontFile(file) {
  const extension = file.name.split('.').at(-1).toLowerCase();
  if (!['woff2', 'woff', 'ttf', 'otf'].includes(extension) || file.size > 1400000) throw new Error('Bitte WOFF2, WOFF, TTF oder OTF bis 1,4 MB wählen.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = String.fromCharCode(...bytes.slice(0, 4));
  if (!['wOF2', 'wOFF', 'OTTO', '\u0000\u0001\u0000\u0000', 'true'].includes(signature)) throw new Error('Die Datei enthält keine unterstützte Schrift.');
  let binary = ''; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const data = `data:font/${extension};base64,${btoa(binary)}`;
  if (!FONT_DATA.test(data)) throw new Error('Ungültige Schriftdatei.');
  const customFont = { name: file.name, data };
  await ensureDocumentFont({ font: "'Workshop Custom'", fontSize: 20, customFont });
  return customFont;
}

export async function exportFontCss(meta) {
  const font = PROJECT_FONTS.find(entry => `'${entry.family}'` === meta.font);
  let source = meta.font === "'Workshop Custom'" ? meta.customFont?.data : '';
  if (font) {
    const response = await fetch(font.url);
    if (!response.ok) throw new Error('Die Schrift konnte nicht in den Export eingebettet werden.');
    source = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject;
      response.blob().then(blob => reader.readAsDataURL(blob), reject);
    });
  }
  return source ? `@font-face{font-family:${meta.font};src:url("${source}");font-display:block}` : '';
}
