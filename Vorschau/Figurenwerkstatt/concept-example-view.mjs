import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { CONCEPT_TYPES } from './concept-schema.mjs';
import { CAER_YSGELLFOR_PITCH, CONCEPT_EXAMPLES } from './concept-example-catalog.mjs';

export function renderExampleChoices() {
  const entries = [...Object.entries(CONCEPT_EXAMPLES), ['place', CAER_YSGELLFOR_PITCH]];
  return `<ul class="concept-example-choices">${entries.map(([kind, example]) => `
    <li><button class="workshop-button concept-sample-button" type="button" data-action="examples" data-kind="${kind}" data-id="${e(example.reference.id)}">
      <img src="${e(example.image)}" alt="" width="${example.width}" height="42" loading="lazy" decoding="async">
      <span><strong>${e(example.reference.name)}</strong><small>${example === CAER_YSGELLFOR_PITCH ? 'Orts-Pitch' : e(CONCEPT_TYPES[kind].label)}</small></span>
    </button></li>`).join('')}</ul>`;
}
