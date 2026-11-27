import { personalityIcons } from './concept-catalogs.mjs';
import { selectMainImage } from './concept-decisions.mjs';
import { createConcept } from './concept-drafts.mjs';
import { CONCEPT_EXAMPLES } from './concept-example-catalog.mjs';

export function createExampleDraft(kind, fields, rows, now, { sample = CONCEPT_EXAMPLES[kind], mainImage = 'a' } = {}) {
  const { id, name } = sample.reference;
  const template = createConcept(kind, id, now);
  const draft = {
    ...template,
    fields: { name, author: 'Fiktives Muster', stage: 'review', ...fields },
    rows: { ...template.rows, ...rows },
    favorite: 'a'
  };
  return mainImage ? selectMainImage(draft, mainImage) : draft;
}

export function exampleTraitIcon(id) {
  const { name, src } = personalityIcons.find(icon => icon.id === id);
  return { name, src };
}

export function exampleTraits(entries) {
  return entries.map(([name, note, iconId], index) => ({
    id: `merkmal-${index + 1}`, name, note, icon: exampleTraitIcon(iconId)
  }));
}
