import { getActionIcon, getActionIcons, normalizeActionIconId } from './comment-action-icons.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderActionIconBadge(source = {}) {
  const icon = getActionIcon(source);
  return `<img class="comment-action-badge" src="${icon.image}" alt="${escape(icon.label)}" title="${escape(icon.label)}" width="26" height="26" loading="lazy" decoding="async">`;
}

export function renderActionIconPicker(source = {}, { fieldAttribute = 'data-comment-action-icon', group = source.kind === 'consume' ? 'consume' : 'interact' } = {}) {
  const available = getActionIcons(group);
  const selected = available.some(icon => icon.id === normalizeActionIconId(source.actionIconId)) ? source.actionIconId : '';
  const automatic = getActionIcon({ ...source, actionIconId: '' });
  const choices = [{ id: '', label: `Automatisch · ${automatic.label}`, image: automatic.image }, ...available];
  return `<details class="comment-action-picker" data-comment-action-picker><summary><img src="${getActionIcon(source).image}" alt="" width="24" height="24"><span>Aktionssymbol wählen</span><small>${escape(selected ? getActionIcon(source).label : 'Automatisch')}</small></summary><div class="comment-action-choices" role="group" aria-label="Aktionssymbol">${choices.map(icon => `<button type="button" class="comment-action-choice" ${fieldAttribute}="${icon.id}" aria-pressed="${selected === icon.id}" title="${escape(icon.label)}"><img src="${icon.image}" alt="" width="36" height="36" loading="lazy" decoding="async"><span>${escape(icon.label)}</span></button>`).join('')}</div></details>`;
}

export function refreshActionIconPicker(picker, source, options = {}) {
  if (!picker) return;
  const host = document.createElement('div');
  host.innerHTML = renderActionIconPicker(source, options);
  const replacement = host.firstElementChild;
  replacement.open = picker.open;
  picker.replaceWith(replacement);
  replacement.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
}
