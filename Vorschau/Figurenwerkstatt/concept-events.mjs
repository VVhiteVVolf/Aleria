import { renderMedia, safeConceptUrl, updateMediaFormat } from './concept-media.mjs';
import { variantTitle } from './concept-schema.mjs';
import { canConfirmDecision } from './concept-decisions.mjs';

function refreshImage(element) {
  const row = element.closest('[data-row]');
  const label = row.querySelector('h4')?.textContent || row.querySelector('[data-field="name"]')?.value || 'Bildreferenz';
  const media = row.querySelector('.concept-row-media');
  if (media) media.hidden = !element.value.trim();
  const frame = row.querySelector('[data-media]');
  frame.outerHTML = renderMedia(element.value, label, {
    empty: row.dataset.collection === 'images' ? 'Bildlink einfügen' : 'Optionales Bild',
    format: row.querySelector('[data-field="format"]').value,
    fallbackFormat: frame.dataset.mediaDefault
  });
}

function renameVariant(element, card) {
  const title = variantTitle({ name: element.value }, [...card.parentElement.children].indexOf(card));
  card.querySelector('h4').textContent = title;
  card.querySelector('[data-role="favorite"]').setAttribute('aria-label', `${title} als Favorit`);
  const link = card.querySelector('[data-media-input]');
  if (link.value) refreshImage(link);
}

function refreshImageDecision(element) {
  const card = element.closest('.variant-card');
  if (!card) return;
  const url = safeConceptUrl(element.value);
  card.querySelector('[data-action="choose-main-image"]').disabled = !url;
  card.dataset.mainImage = String(Boolean(url && url === card.dataset.selectedUrl));
}

function refreshDecisionControl(element) {
  if (!['name', 'result'].includes(element.dataset.field)) return;
  const row = element.closest('[data-collection="decisions"][data-row]');
  if (!row) return;
  const name = row.querySelector('[data-field="name"]').value;
  const result = row.querySelector('[data-field="result"]').value;
  row.querySelector('[data-action="confirm-decision"]').disabled = !canConfirmDecision({ name, result });
  row.querySelector('[data-role="decision-heading"]').textContent = name.trim() || 'Entscheidung';
}

function moveTab(event, changeTab) {
  const current = event.target.closest('[role="tab"]');
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!current || !keys.includes(event.key)) return;
  const tabs = [...current.parentElement.querySelectorAll('[role="tab"]')];
  const index = tabs.indexOf(current);
  const next = {
    ArrowLeft: (index + tabs.length - 1) % tabs.length,
    ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1
  }[event.key];
  event.preventDefault();
  changeTab(tabs[next].dataset.id, tabs[next].dataset.action);
}

function showImageError(event) {
  const media = event.target.closest?.('[data-media]');
  const message = media?.querySelector('[data-role="image-error"]');
  if (!message) return;
  (event.target.closest('button') || event.target).hidden = true;
  media.classList.add('concept-media--empty');
  message.hidden = false;
}

export function bindConceptEvents(root, { actions, updateField, chooseFavorite, changeTab, importFile }) {
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (button) actions[button.dataset.action]?.(button);
  });
  root.addEventListener('input', event => {
    const element = event.target;
    if (element.matches('[data-field]:not(select)') && !element.readOnly) updateField(element);
    if (element.matches('[data-media-input]')) refreshImageDecision(element);
    if (element.matches('[data-field]')) refreshDecisionControl(element);
  });
  root.addEventListener('change', event => {
    const element = event.target;
    if (element.matches('[data-role="import-file"]') && element.files[0]) {
      const [file] = element.files;
      element.value = '';
      importFile(file);
    }
    if (element.matches('select[data-field]')) updateField(element);
    if (element.matches('select[data-field="format"]')) {
      updateMediaFormat(element.closest('[data-row]').querySelector('[data-media]'), element.value);
    }
    if (element.matches('[data-role="favorite"]')) chooseFavorite(element.value);
    if (element.matches('[data-media-input]')) refreshImage(element);
    const variant = element.matches('[data-field="name"]') && element.closest('.variant-card');
    if (variant) renameVariant(element, variant);
  });
  root.addEventListener('keydown', event => moveTab(event, changeTab));
  root.addEventListener('load', event => {
    if (!event.target.matches?.('[data-action="show-image"] img')) return;
    const frame = event.target.closest('[data-media-auto]');
    if (frame) updateMediaFormat(frame, '');
  }, true);
  root.addEventListener('error', showImageError, true);
}
