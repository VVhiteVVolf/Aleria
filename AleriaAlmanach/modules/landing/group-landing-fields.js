import { html, groupIcon } from './group-landing-markup.js';

export const field = (label, name, value = '', type = 'text') => `<label><span>${html(label)}</span><input name="${html(name)}" type="${type}" value="${html(value)}"></label>`;
export const select = (label, name, options, selected = '') => `<label><span>${html(label)}</span><select name="${html(name)}">${options.map(([id, title]) => `<option value="${html(id)}"${id === selected ? ' selected' : ''}>${html(title)}</option>`).join('')}</select></label>`;
export const iconField = (label, name, value = '') => `<label><span>${html(label)}</span><span class="group-icon-field"><span data-group-icon-preview>${groupIcon(value)}</span><input name="${html(name)}" value="${html(value)}" placeholder="Icon oder Bildpfad"><button type="button" data-group-pick-icon>Icon wählen</button><button type="button" data-group-clear-icon aria-label="${html(label)} zurücksetzen">×</button></span></label>`;

// Only the currently open editor owns the icon-directory result listener.
export function mountGroupIconFields(overlay) {
  const abort = new AbortController();
  let target = null;
  function preview(input) {
    const node = input?.closest('.group-icon-field')?.querySelector('[data-group-icon-preview]');
    if (node) node.innerHTML = groupIcon(input.value);
  }
  overlay.addEventListener('click', event => {
    const pick = event.target.closest?.('[data-group-pick-icon], [data-group-clear-icon]');
    if (!pick) return;
    const input = pick.closest('.group-icon-field')?.querySelector('input');
    if (pick.hasAttribute('data-group-clear-icon')) { input.value = ''; preview(input); return; }
    if (!globalThis.openIconDirectory) return;
    target = input; globalThis.openIconDirectory();
  }, { signal: abort.signal });
  overlay.addEventListener('input', event => preview(event.target), { signal: abort.signal });
  document.addEventListener('almanach-icon-selected', event => {
    if (!target?.isConnected || !event.detail?.src) return;
    target.value = event.detail.src; preview(target); target.dispatchEvent(new Event('change', { bubbles: true }));
    globalThis.closeIconDirectory?.(); target.focus(); target = null;
  }, { signal: abort.signal });
  return () => { target = null; abort.abort(); };
}
