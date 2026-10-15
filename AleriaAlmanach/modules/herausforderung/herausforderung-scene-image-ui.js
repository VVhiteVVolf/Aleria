import { CHALLENGE_IMAGE_FORMATS, CHALLENGE_IMAGE_FITS, EMPTY_CHALLENGE_SCENE_IMAGE, normalizeChallengeSceneImage, validateChallengeSceneImage } from './herausforderung-scene-image-model.js';

const boundRoots = new WeakSet();
const escape = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const options = values => values.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');

export function renderChallengeSceneImageEditor() {
  return `<details class="herausforderung-image-editor" data-ha-image-editor>
    <summary>Szenenbild <small>Optional · öffentliches Stimmungsbild</small></summary>
    <div class="herausforderung-fields">
      <p class="herausforderung-note">Ein direkter Bildlink, z. B. von Imgur. PNG, JPG, WebP, GIF und AVIF sind möglich. Das Bild ist für alle sichtbar und sollte keine verdeckte Lösung verraten.</p>
      <label><span>Bildlink</span><input type="url" maxlength="2048" data-ha-image-field="url" data-herausforderung-field="sceneImage" placeholder="https://i.imgur.com/…" aria-describedby="herausforderung-image-status"></label>
      <div class="herausforderung-image-options">
        <label><span>Format</span><select data-ha-image-field="format" data-herausforderung-field="sceneImage">${options(CHALLENGE_IMAGE_FORMATS)}</select></label>
        <label><span>Darstellung</span><select data-ha-image-field="fit" data-herausforderung-field="sceneImage">${options(CHALLENGE_IMAGE_FITS)}</select></label>
      </div>
      <label><span>Bildbeschreibung · für Screenreader</span><input maxlength="240" data-ha-image-field="alt" data-herausforderung-field="sceneImage" placeholder="Was ist auf dem Bild zu sehen?"></label>
      <label><span>Bildunterschrift · optional</span><input maxlength="500" data-ha-image-field="caption" data-herausforderung-field="sceneImage" placeholder="Ein kurzer stimmungsvoller Begleittext"></label>
      <div class="herausforderung-image-toolbar"><p id="herausforderung-image-status" data-ha-image-status role="status"></p><button type="button" class="herausforderung-button" data-herausforderung-action="clear-image">Bild entfernen</button></div>
    </div>
  </details>`;
}

export function readChallengeSceneImage(root) {
  return Object.fromEntries(Object.keys(EMPTY_CHALLENGE_SCENE_IMAGE).map(field => [field, root?.querySelector(`[data-ha-image-field="${field}"]`)?.value ?? EMPTY_CHALLENGE_SCENE_IMAGE[field]]));
}

export function setChallengeSceneImage(root, value) {
  const image = normalizeChallengeSceneImage(value) || EMPTY_CHALLENGE_SCENE_IMAGE;
  for (const [field, content] of Object.entries(image)) {
    const input = root?.querySelector(`[data-ha-image-field="${field}"]`);
    if (input) input.value = content;
  }
  const editor = root?.querySelector('[data-ha-image-editor]');
  if (editor) editor.open = !!image.url;
  refreshChallengeSceneImageEditor(root);
}

export function refreshChallengeSceneImageEditor(root) {
  const image = readChallengeSceneImage(root), error = validateChallengeSceneImage(image);
  const output = root?.querySelector('[data-ha-image-status]');
  if (output) { output.textContent = error || (image.url ? 'Vorschau rechts bzw. unter den Ansätzen. Ein Klick auf das Bild öffnet das Original.' : 'Ohne Bildlink wird kein Szenenbild angezeigt.'); output.dataset.status = error ? 'error' : 'info'; }
  root?.querySelector('[data-ha-image-field="url"]')?.setAttribute('aria-invalid', String(!!error));
  const fit = root?.querySelector('[data-ha-image-field="fit"]');
  if (fit && root?.getAttribute('aria-busy') !== 'true') fit.disabled = image.format === 'original';
}

export function renderChallengeSceneImage(value, title = 'Herausforderung') {
  const image = normalizeChallengeSceneImage(value);
  if (!image) return '';
  const label = image.alt || `Szenenbild: ${title}`;
  return `<figure class="herausforderung-scene-image" data-ha-image-format="${image.format}" data-ha-image-fit="${image.fit}">
    <a class="herausforderung-scene-image-stage" href="${escape(image.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)} · Originalbild öffnen">
      <img data-ha-scene-image src="${escape(image.url)}" alt="${escape(label)}" loading="lazy" decoding="async">
      <span class="herausforderung-image-fallback"><strong>Bild nicht verfügbar</strong><span>Originalbild öffnen ↗</span></span>
      <span class="herausforderung-image-open" aria-hidden="true">Original öffnen ↗</span>
    </a>${image.caption ? `<figcaption>${escape(image.caption)}</figcaption>` : ''}
  </figure>`;
}

export function bindChallengeSceneImageEvents(root) {
  if (!root || boundRoots.has(root)) return;
  boundRoots.add(root);
  for (const type of ['load', 'error']) root.addEventListener(type, event => {
    if (!event.target?.matches?.('[data-ha-scene-image]')) return;
    event.target.closest('.herausforderung-scene-image')?.classList.toggle('is-unavailable', type === 'error');
  }, true);
}
