import '../image-library/image-library-model.js';

export const CHALLENGE_IMAGE_FORMATS = Object.freeze([
  ['original', 'Originalformat'], ['16:9', 'Querformat · 16:9'], ['3:2', 'Querformat · 3:2'],
  ['4:3', 'Querformat · 4:3'], ['1:1', 'Quadrat · 1:1'], ['2:3', 'Hochformat · 2:3'],
  ['9:16', 'Hochformat · 9:16'], ['21:9', 'Panorama · 21:9']
]);
export const CHALLENGE_IMAGE_FITS = Object.freeze([
  ['contain', 'Vollständig anzeigen'], ['cover', 'Rahmen ausfüllen · zuschneiden']
]);
export const EMPTY_CHALLENGE_SCENE_IMAGE = Object.freeze({ url: '', alt: '', caption: '', format: 'original', fit: 'contain' });
const LIMITS = Object.freeze({ url: 2048, alt: 240, caption: 500 });

export function normalizeChallengeImageUrl(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || raw.length > LIMITS.url || /[\u0000-\u001f\u007f\\]/.test(raw)) return '';
  const accepted = globalThis.AleriaCharacterImageSets.normalizeImageUrl(raw);
  if (!accepted) return '';
  try {
    const url = new URL(accepted, 'https://aleria.invalid/AleriaAlmanach/');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    const imgur = /^(?:www\.)?imgur\.com$/i.test(url.hostname)
      && url.pathname.match(/^\/([a-z0-9]+)(\.(?:png|jpe?g|webp|gif|avif))?\/?$/i);
    return imgur ? `https://i.imgur.com/${imgur[1]}${imgur[2] || '.jpg'}` : accepted;
  } catch { return ''; }
}

export function validateChallengeSceneImage(value) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) return 'Das Szenenbild muss ein Bildobjekt oder null sein.';
  for (const [field, maximum] of Object.entries(LIMITS)) {
    if (value[field] != null && (typeof value[field] !== 'string' || value[field].length > maximum)) return `Szenenbild: ${field} muss ein Text mit höchstens ${maximum} Zeichen sein.`;
  }
  if (value.url?.trim() && !normalizeChallengeImageUrl(value.url)) return 'Für das Szenenbild einen gültigen direkten HTTP(S)-Bildlink oder Projektpfad eintragen.';
  if (value.format != null && !CHALLENGE_IMAGE_FORMATS.some(([id]) => id === value.format)) return 'Das Bildformat des Szenenbilds ist unbekannt.';
  if (value.fit != null && !CHALLENGE_IMAGE_FITS.some(([id]) => id === value.fit)) return 'Die Bildanpassung des Szenenbilds ist unbekannt.';
  return null;
}

export function normalizeChallengeSceneImage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const url = normalizeChallengeImageUrl(value.url);
  if (!url) return null;
  return { url, alt: String(value.alt || '').trim().slice(0, LIMITS.alt), caption: String(value.caption || '').trim().slice(0, LIMITS.caption),
    format: CHALLENGE_IMAGE_FORMATS.some(([id]) => id === value.format) ? value.format : 'original',
    fit: CHALLENGE_IMAGE_FITS.some(([id]) => id === value.fit) ? value.fit : 'contain' };
}
