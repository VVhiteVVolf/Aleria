import { DEVELOPMENT_TRAITS } from '../../modules/character-development/development-traits.js';

// A growing catalogue is larger than one character's supported trait collection.
export function getDevelopmentTraitTestBatches() {
  const batches = [];
  for (let offset = 0; offset < DEVELOPMENT_TRAITS.length; offset += 100) {
    batches.push(DEVELOPMENT_TRAITS.slice(offset, offset + 100));
  }
  return batches;
}
