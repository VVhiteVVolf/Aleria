import {
  DEFAULT_RELATIONSHIP_COLORS,
  PARENTAGE_LABELS,
  PARTNERSHIP_LABELS
} from '../config/family-colors.js';
import { escapeHtml } from './dom.js';

const LABELS = Object.freeze({ ...PARTNERSHIP_LABELS, ...PARENTAGE_LABELS });

export function createLineColorsDialog(documentRef = document) {
  const dialog = documentRef.getElementById('line-colors-dialog');
  const form = documentRef.getElementById('line-colors-form');
  const fields = documentRef.getElementById('relationship-color-fields');

  function render(colors) {
    fields.innerHTML = Object.keys(DEFAULT_RELATIONSHIP_COLORS).map(key => `
      <label class="color-field">
        <input type="color" name="${escapeHtml(key)}" value="${escapeHtml(colors[key] || DEFAULT_RELATIONSHIP_COLORS[key])}">
        <span>${escapeHtml(LABELS[key] || key)}</span>
      </label>
    `).join('');
  }

  function open(family) {
    render(family.presentation.relationshipColors);
    dialog.showModal();
  }

  function reset() {
    render(DEFAULT_RELATIONSHIP_COLORS);
  }

  function read() {
    return Object.fromEntries(new FormData(form).entries());
  }

  return Object.freeze({ dialog, form, open, close: () => dialog.close(), reset, read });
}

