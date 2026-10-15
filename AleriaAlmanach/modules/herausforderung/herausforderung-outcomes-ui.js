import { rewardSummary } from './herausforderung-rewards-ui.js?v=20261015-graded-challenges-v1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const bindings = new WeakMap();
const selector = row => row.natural ? `Natürliche ${row.natural}` : row.minimumTotal == null ? 'Unter der niedrigsten Schwelle' : `Ab Gesamtwert ${row.minimumTotal}`;

// This owns the graded authoring surface. Reward definitions survive edits and
// round trips; the regular reward editor continues to own legacy bundles.
export function renderChallengeOutcomesEditor(approach, index) {
  if (!approach.outcomeTable?.length) return '';
  return `<details class="herausforderung-outcomes" open data-ho-approach="${index}"><summary>Ergebnisstaffel · ${approach.outcomeTable.length} Stufen</summary><p>Natürliche 20 und 1 haben Vorrang. Sonst zählt nur die höchste erreichte Schwelle. ${approach.attemptLimit === 1 ? 'Ein Versuch für diesen Lösungsweg.' : ''}</p>${approach.outcomeTable.map((row, rowIndex) => `<fieldset data-ho-row="${rowIndex}"><legend>${escape(selector(row))}</legend><label>Bezeichnung<input data-ho-field="label" maxlength="160" value="${escape(row.label)}"></label>${!row.natural && row.minimumTotal != null ? `<label>Gesamtwert ab<input data-ho-field="minimumTotal" type="number" min="-100" max="100" value="${row.minimumTotal}"></label>` : ''}<label>Verdeckter Ergebnistext<textarea data-ho-field="text" maxlength="2000" rows="3">${escape(row.text)}</textarea></label><p>${escape(rewardSummary(row.benefits) || 'Keine mechanische Wirkung.')}</p></fieldset>`).join('')}</details>`;
}

export function mountChallengeOutcomesEditor(root, { approaches, onChange }) {
  const previous = bindings.has(root);
  bindings.set(root, { approaches, onChange });
  if (previous) return;
  root.addEventListener('input', event => {
    const field = event.target.dataset.hoField;
    if (!field || root.getAttribute('aria-busy') === 'true') return;
    const binding = bindings.get(root);
    const approachIndex = Number(event.target.closest('[data-ho-approach]')?.dataset.hoApproach);
    const rowIndex = Number(event.target.closest('[data-ho-row]')?.dataset.hoRow);
    const row = binding.approaches[approachIndex]?.outcomeTable?.[rowIndex];
    if (!row) return;
    row[field] = field === 'minimumTotal' ? Number(event.target.value) : event.target.value;
    binding.onChange();
  });
}
