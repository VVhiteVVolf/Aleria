import { getSpellCatalogEntry } from './spell-catalog.js';

// Recorded target restrictions are checked before any costs. Unrecorded
// anatomy and consent remain explicit prerequisites at the table.
export function validateSpellCatalogTarget(action = {}, target = {}) {
  const reference = action.catalogReference;
  if (!reference) return;
  const entry = getSpellCatalogEntry(reference.id, reference.revision);
  if (!entry?.targetPolicy) return;
  const conditions = [...(target.conditions || []), ...(target.temporaryConditions || [])].filter(condition => condition.active !== false);
  const dead = target.dead === true || conditions.some(condition =>
    /^(tot|dead)$/i.test(String(condition.name || '')) || /^(dead|tot)$/.test(String(condition.statusId || '')));
  if (entry.targetPolicy === 'living' && dead) throw new Error(`${entry.name} kann keinen bestätigten Tod aufheben.`);
  if (Number(target.currentHitPoints) < Number(entry.minimumHitPoints || 0)) {
    throw new Error(`${entry.name} benötigt ein Ziel mit mindestens ${entry.minimumHitPoints} regulären TP.`);
  }
}
