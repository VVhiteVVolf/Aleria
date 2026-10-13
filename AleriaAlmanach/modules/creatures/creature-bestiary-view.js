import { isHumanCreature, resolveCreatureBestiaryReference, resolveCreatureBestiaryAncestry } from './creature-bestiary-reference.js?v=20261013-draig-breeds-v2';

export function renderCreatureBestiaryReference(creature, escapeHtml) {
  if (isHumanCreature(creature)) return '';
  const reference = resolveCreatureBestiaryReference(creature);
  const ancestry = resolveCreatureBestiaryAncestry(creature);
  if (!reference && ancestry) {
    const links = ancestry.references.map(item => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} im Bestiarium ↗</a>`).join(' · ');
    return `<p class="creature-bestiary-reference">Mischling · Abstammungsverweise: ${links}${ancestry.notes ? `<br>${escapeHtml(ancestry.notes)}` : ''}</p>`;
  }
  return reference
    ? `<p class="creature-bestiary-reference">Rasse / Art: <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.name)} im Bestiarium ↗</a></p>`
    : '<p class="creature-bestiary-reference">Kein eindeutiger Bestiarium-Eintrag für diese Rasse / Art vorhanden.</p>';
}
