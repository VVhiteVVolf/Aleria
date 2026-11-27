import { exampleFigure, exampleHouse } from './concept-celynbarth-examples.mjs';
import { examplePlace } from './concept-place-example.mjs';
import { exampleFaction } from './concept-faction-example.mjs';
import { exampleCreature } from './concept-creature-example.mjs';
import { exampleItem } from './concept-item-example.mjs';
import { createCaerYsgellforPitch } from './concept-caer-ysgellfor-pitch.mjs';
import { CAER_YSGELLFOR_PITCH, CONCEPT_EXAMPLES, exampleArtUpdates } from './concept-example-catalog.mjs';

export function createConceptExamples(now = Date.now()) {
  return [exampleFigure(now), exampleHouse(now), examplePlace(now), exampleFaction(now), exampleCreature(now), exampleItem(now)];
}

function currentExampleArt(record, field) {
  const url = exampleArtUpdates.get(record?.[field]);
  return url ? { ...record, [field]: url } : record;
}

function reviseStockImages(draft) {
  const stock = CONCEPT_EXAMPLES[draft.kind]?.reference;
  if (draft.id !== stock?.id) return draft;
  const rows = { ...draft.rows };
  let changed = false;
  for (const [list, field] of [['images', 'url'], ['companions', 'image'], ['seats', 'image']]) {
    if (!rows[list]) continue;
    const updated = rows[list].map(row => currentExampleArt(row, field));
    if (updated.some((row, index) => row !== rows[list][index])) {
      rows[list] = updated;
      changed = true;
    }
  }
  const mainImage = currentExampleArt(draft.mainImage, 'url');
  return changed || mainImage !== draft.mainImage ? { ...draft, rows, mainImage } : draft;
}

export function addConceptExamples(drafts, selectedId, now = Date.now()) {
  const existing = new Set(drafts.map(draft => draft.id));
  const pitch = selectedId === CAER_YSGELLFOR_PITCH.reference.id;
  const seeds = pitch ? [createCaerYsgellforPitch(now)] : createConceptExamples(now);
  const missing = seeds.filter(draft => !existing.has(draft.id));
  const updated = pitch ? drafts : drafts.map(reviseStockImages);
  return {
    drafts: missing.length || updated.some((draft, index) => draft !== drafts[index]) ? [...updated, ...missing] : drafts,
    addedCount: missing.length
  };
}
