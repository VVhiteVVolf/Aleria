import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { MAX_TITLE_LENGTH } from './draft-office-titles.mjs';
import { officeIcon } from '../../shared/cenyr-administration/office-icons.mjs';
import { previewAttribute } from './preview-url.mjs';

export function renameButton(key, name, kind, anchor = key) {
  const label = `${kind} „${name}“ umbenennen`;
  return `<button type="button" class="rename-title-button" data-action="rename-title"
    data-title-key="${e(key)}" data-title-anchor="${e(anchor)}"
    data-title-name="${e(name)}" data-title-kind="${e(kind)}" aria-label="${e(label)}" title="${e(label)}"><img alt="" width="18" height="18" src="${previewAttribute(officeIcon('quill'))}"></button>`;
}

export function bindOfficeTitleEditor(dialog, { onRename, hasOverride, findTrigger }) {
  const form = dialog.querySelector('form');
  const input = form.elements.name;
  const heading = dialog.querySelector('h2');
  const hint = dialog.querySelector('[data-role="rename-hint"]');
  const reset = form.querySelector('[data-action="reset-title"]');
  const error = form.querySelector('[data-role="rename-error"]');
  input.maxLength = MAX_TITLE_LENGTH;
  let target;

  function apply(value) {
    try {
      if (value === null || value.trim() !== target.titleName) onRename(target.titleKey, value);
      dialog.close();
    } catch (problem) {
      error.textContent = problem.message;
      input.focus();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    apply(input.value);
  });
  form.addEventListener('click', event => {
    switch (event.target.closest('button')?.dataset.action) {
      case 'cancel-rename': dialog.close(); break;
      case 'reset-title': apply(null); break;
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (target) findTrigger(target.titleAnchor)?.focus({ preventScroll: true });
    target = undefined;
  });

  return {
    open(trigger) {
      target = { ...trigger.dataset };
      heading.textContent = `${target.titleKind} umbenennen`;
      hint.hidden = target.titleKind !== 'Rolle';
      reset.hidden = !hasOverride(target.titleKey);
      error.textContent = '';
      input.value = target.titleName;
      dialog.showModal();
      input.focus();
      input.select();
    },
  };
}
