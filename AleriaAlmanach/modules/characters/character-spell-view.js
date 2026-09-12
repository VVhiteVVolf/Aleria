import { getCharacterSpellPresentation } from './character-spell-presentation.js';
import { getSpellLevelLabel } from '../combat/combat-spell-slots.js';

// Update derived labels in place so editing an attribute preserves open cards,
// focused fields and the rest of the character draft.
export function updateCharacterSpellPresentations(root, profile) {
  if (!root) return;
  const spells = new Map((profile.magic?.spells || []).map(spell => [spell.id, spell]));
  const manaName = profile.resources.find(resource => resource.id === profile.magic?.manaResourceId)?.name || 'Mana';
  root.querySelectorAll('[data-spell-id]').forEach(card => {
    const spell = spells.get(card.dataset.spellId);
    if (!spell) return;
    const presentation = getCharacterSpellPresentation(spell, profile, manaName);
    const damage = card.querySelector('[data-role="spell-damage-value"]');
    const costs = card.querySelector('[data-role="spell-cost-value"]');
    if (damage) damage.textContent = presentation.damage.label;
    if (costs) costs.textContent = `${presentation.costs} · ${getSpellLevelLabel(spell.level)}`;
    card.querySelectorAll('[data-role="spell-higher-form"]').forEach((row, index) => {
      if (presentation.higherForms[index]) row.textContent = presentation.higherForms[index];
    });
  });
}
