import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js';
import { escapeCombatMarkup as e, formatCombatModifier as modifier, renderCombatIcon as image, renderCombatCondition as renderMiniProfileCondition } from '../combat-status/combat-status-view.js?v=20260906-character-vitality-v1';
export { escapeCombatMarkup, safeCombatImage } from '../combat-status/combat-status-view.js?v=20260906-character-vitality-v1';

function renderResource(resource) {
  const icon = getCombatResourceIconPresentation(resource);
  return `<li class="${Number(resource.current) <= 0 ? 'is-depleted' : ''}" title="${e(resource.name)}">
    ${image(icon.source, icon.fallback)}<span>${e(resource.name)}</span><b>${e(resource.current)}/${e(resource.maximum)}</b></li>`;
}

export function renderMiniCombatProfile(profile, displayName, options = {}) {
  const maximum = Math.max(0, Number(profile.maximumHitPoints) || 0);
  const current = Math.max(0, Number(profile.currentHitPoints ?? maximum) || 0);
  const temporary = Math.max(0, Number(profile.temporaryHitPoints) || 0);
  const slotIds = new Set(profile.magic?.slotResourceIds || []);
  const resources = (profile.resources || []).filter(resource => !slotIds.has(resource.id) && !/^spell-slot-/.test(resource.id) && (resource.maximum > 0 || resource.current > 0));
  const mainResourceIds = new Set(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus', 'inspiration', 'mana-focus', 'mana', 'focus', 'pact-points', 'celestial-points', 'infernal-points']);
  const mainResources = resources.filter(resource => mainResourceIds.has(resource.id));
  const otherResources = resources.filter(resource => !mainResourceIds.has(resource.id));
  const temporaryIds = new Set((profile.temporaryConditions || []).map(condition => condition.id));
  const conditions = (profile.conditions || []).filter(condition => condition.active !== false);
  const temporaryConditions = conditions.filter(condition => temporaryIds.has(condition.id));
  const permanentConditions = conditions.filter(condition => !temporaryIds.has(condition.id));
  const abilities = (profile.abilities || []).filter(ability => ability.active !== false && ability.usesMaximum > 0);
  const canManage = options.canManage && !options.historical;
  const weapon = profile.weapon || {};
  return `<header class="comment-combat-profile-head"><strong>${e(displayName || profile.name)}</strong><span>Stufe ${e(profile.effectiveLevel || 1)}</span></header>
    <div class="comment-combat-profile-context"><span>${e(options.contextLabel || (options.historical ? 'Vor diesem Beitrag' : 'Aktueller Szenenstand'))}</span></div>
    <div class="comment-combat-profile-vitals"><span><small>Lebenspunkte</small><b>${e(current)}/${e(maximum)}${temporary ? ` <em>+${e(temporary)} temporär</em>` : ''}</b><meter min="0" max="${e(maximum || 1)}" value="${e(current)}" aria-label="Lebenspunkte"></meter></span><span><small>RK</small><b>${e(profile.totalDefense ?? 10)}</b></span></div>
    <div class="comment-combat-profile-stats"><span><small>Angriff</small><b>${e(modifier(profile.attackModifier))}</b></span><span><small>Initiative</small><b>${e(modifier(profile.initiative))}</b></span><span><small>Bewegung</small><b>${e(profile.movement ?? profile.combat?.movement ?? 0)} m</b></span></div>
    <div class="comment-combat-profile-weapon">${image(weapon.icon || weapon.image, '⚔')}<span><small>Geführte Waffe</small>${e(weapon.name || 'Keine Waffe')}</span><b>${e(weapon.damageFormula || '')}${profile.damageModifier ? ` ${e(modifier(profile.damageModifier))}` : ''}</b></div>
    <section class="comment-combat-profile-section"><h4>Ressourcen</h4><ul class="comment-combat-profile-resources">${mainResources.map(renderResource).join('')}</ul>
      <p class="comment-combat-profile-note">Aktion, Bonusaktion und Reaktion erneuern sich beim nächsten Beitrag. Die übrigen Vorräte folgen ihrer Erholungsregel.</p>
      ${otherResources.length ? `<details><summary>Weitere Vorräte (${otherResources.length})</summary><ul class="comment-combat-profile-resources comment-combat-profile-resources-wide">${otherResources.map(renderResource).join('')}</ul></details>` : ''}
      ${abilities.length ? `<details><summary>Begrenzte Fähigkeiten (${abilities.length})</summary><ul class="comment-combat-profile-resources">${abilities.map(ability => renderResource({ ...ability, current: ability.usesCurrent, maximum: ability.usesMaximum })).join('')}</ul></details>` : ''}
    </section>
    <section class="comment-combat-profile-section"><div class="comment-combat-profile-section-head"><h4>Temporäre Effekte <span>${temporaryConditions.length}</span></h4>${canManage ? '<button type="button" data-action="add-comment-combat-condition">+ Hinzufügen</button>' : ''}</div>
      ${profile.concentration ? `<p class="comment-combat-profile-focus">◎ Konzentration: ${e(profile.concentration.name || profile.concentration.actionName || 'Aktiv')}</p>` : ''}
      ${profile.channeling ? `<p class="comment-combat-profile-focus">✦ Kanalisierung: ${e(profile.channeling.actionName || profile.channeling.name || 'Aktiv')}${profile.channeling.requiredComments ? ` · ${e(profile.channeling.progress || 0)}/${e(profile.channeling.requiredComments)} Beiträge` : ''}</p>` : ''}
      ${temporaryConditions.length ? `<ul class="comment-combat-conditions">${temporaryConditions.map(condition => renderMiniProfileCondition(condition, { temporary: true, removable: canManage && !condition.encounterAura })).join('')}</ul>` : '<p class="comment-combat-profile-empty">Keine temporären Effekte</p>'}
      ${permanentConditions.length ? `<details><summary>Dauerhafte Einträge (${permanentConditions.length})</summary><ul class="comment-combat-conditions">${permanentConditions.map(condition => renderMiniProfileCondition(condition)).join('')}</ul></details>` : ''}
    </section>
    ${canManage ? `<footer class="comment-combat-profile-footer"><span>${options.encounter ? 'Kampfphase läuft' : 'Außerhalb einer Kampfphase'}</span><button type="button" data-action="reset-comment-combat-profile" ${options.encounter ? 'disabled title="Erst nach Ende der Kampfphase verfügbar"' : ''}>Zurücksetzen</button></footer>` : ''}`;
}
