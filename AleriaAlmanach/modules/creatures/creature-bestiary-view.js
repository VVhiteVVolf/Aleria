import { isHumanCreature, resolveCreatureBestiaryReference } from './creature-bestiary-reference.js?v=20261012-carreg-v1';

export function renderCreatureBestiaryReference(creature, escapeHtml) {
  if (isHumanCreature(creature)) return '';
  const reference = resolveCreatureBestiaryReference(creature);
  return reference
    ? `<p class="creature-bestiary-reference">Rasse / Art: <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.name)} im Bestiarium ↗</a></p>`
    : '<p class="creature-bestiary-reference">Kein eindeutiger Bestiarium-Eintrag für diese Rasse / Art vorhanden.</p>';
}
