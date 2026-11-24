import { getCombatProfileSummary, renderCombatProfileResource } from '../combat-status/combat-profile-summary-view.js';
import { renderCombatArsenalSummary } from '../combat-status/combat-profile-actions-view.js';
import { renderCombatProfileAttributes, renderCombatProfileTraits } from '../combat-status/combat-profile-details-view.js';
import { escapeCombatMarkup as e, formatCombatModifier as signed, renderCombatCondition, renderCombatIcon, safeCombatImage } from '../combat-status/combat-status-view.js';
import { getCombatConditionIconSource, getCombatResourceDiamond } from '../combat-status/combat-condition-icons.js';
import { getVoluntaryCombatActionBlock } from '../combat/combat-action-permission.js';
import { summarizeRuleEffects } from '../combat/ui/combat-rule-presentation.js';

export { escapeCombatMarkup, safeCombatImage } from '../combat-status/combat-status-view.js';

const regularIds = new Set(['action', 'bonus-action', 'reaction']);
const voluntaryIds = new Set([...regularIds, 'special-action', 'aura-focus']);
const section = (title, content) => content ? `<section class="comment-combat-profile-section"><h4>${title}</h4>${content}</section>` : '';

function identity(profile, name, summary, options) {
  const portrait = safeCombatImage(options.portrait) || safeCombatImage(profile.portrait);
  const initials = String(name).trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toLocaleUpperCase('de');
  const label = profile.creatureSpecies || profile.identity?.archetype;
  const level = (Number(profile.progression?.level) || Number(profile.effectiveLevel) || 1) + (Number(profile.progression?.specialLevels) || 0);
  const context = options.contextLabel || (options.historical ? 'Vor diesem Beitrag' : 'Aktueller Szenenstand');
  return `<header class="comment-combat-card-header">
    <h3>${e(name)}</h3><div class="comment-combat-card-avatar" aria-hidden="true"><span>${e(initials || '?')}</span>
      ${portrait ? `<img src="${e(portrait)}" alt="" data-combat-avatar decoding="async">` : ''}</div>
    <p>Stufe ${e(level)}${label ? ` · ${e(label)}` : ''}</p>
    <p class="comment-combat-card-context">${e(context)}${summary.incapacitated ? ' · Kampfunfähig' : ''}</p>
  </header>`;
}

function vitals(profile, summary) {
  const { maximum, current, temporary, attackModifier, damageModifier, held, weapon } = summary;
  return `<section class="comment-combat-card-vitals" aria-label="Kampfwerte">
    <div class="comment-combat-card-hp"><div><span>Lebenspunkte</span><b>${e(current)}/${e(maximum)}</b>${temporary ? `<em>+${e(temporary)} temporär</em>` : ''}</div>
      <meter min="0" max="${e(maximum || 1)}" value="${e(current)}" aria-label="Lebenspunkte"></meter></div>
    <dl class="comment-combat-card-stats"><div><dt>RK</dt><dd><b>${e(profile.totalDefense ?? '–')}</b></dd></div>
      <div><dt>Angriff</dt><dd><b>${held.length ? e(signed(attackModifier)) : '–'}</b></dd></div>
      <div><dt>Initiative</dt><dd><b>${e(signed(profile.initiative))}</b></dd></div>
      <div><dt>Bewegung</dt><dd><b>${e(profile.movement ?? profile.combat?.movement ?? 0)} m</b></dd></div></dl>
    <div class="comment-combat-profile-weapon">${renderCombatIcon(weapon.icon || weapon.image, '⚔')}
      <span><small>Geführte Waffe</small>${e(weapon.name || 'Keine Waffe')}</span>
      <b>${e(weapon.damageFormula || '')}${damageModifier ? ` ${e(signed(damageModifier))}` : ''}</b></div>
  </section>`;
}

function renderResources(profile, { mainResources, otherResources, spellSlots, abilities }, wide) {
  const conditions = [...(profile.conditions || []), ...(profile.temporaryConditions || [])];
  const actionsBlocked = getVoluntaryCombatActionBlock({ ...profile, conditions, profileActionKind: '' });
  const blocked = new Set(conditions.filter(condition => condition.active !== false).map(condition => condition.blockedResource));
  const pools = (items, extraClass = '') => items.length ? `<ul class="comment-combat-profile-resources ${extraClass}">${items.map(resource =>
    renderCombatProfileResource(resource, { diamond: getCombatResourceDiamond(resource), blocked: blocked.has(resource.id)
      || Boolean(actionsBlocked && voluntaryIds.has(resource.id)) })).join('')}</ul>` : '';
  const regular = mainResources.filter(resource => regularIds.has(resource.id));
  const rest = mainResources.filter(resource => !regularIds.has(resource.id));
  return `<section class="comment-combat-profile-section"><h4>Aktionsökonomie</h4>
    ${pools(regular, 'comment-combat-card-regular')}${pools(rest)}
    ${wide && otherResources.length ? `<details data-profile-details-key="resources"><summary>Weitere Vorräte (${otherResources.length})</summary>${pools(otherResources)}</details>` : ''}
    ${wide && spellSlots.length ? `<details data-profile-details-key="spell-slots"><summary>Zauberplätze (${spellSlots.length})</summary>${pools(spellSlots)}</details>` : ''}
    ${wide && abilities.length ? `<details data-profile-details-key="abilities"><summary>Begrenzte Fähigkeiten (${abilities.length})</summary>${pools(abilities.map(ability => ({ ...ability, current: ability.usesCurrent, maximum: ability.usesMaximum })))}</details>` : ''}
  </section>`;
}

function renderEffects(profile, { temporaryConditions, permanentConditions }, { canManage, wide }) {
  const channel = profile.channeling;
  const concentration = profile.concentration;
  const focus = [concentration && ['concentration', `Konzentration · ${concentration.name || concentration.actionName || 'Aktiv'}`],
    channel && ['channeling', `Kanalisierung · ${channel.actionName || channel.name || 'Aktiv'}${channel.requiredComments ? ` · ${channel.progress || 0}/${channel.requiredComments} Beiträge` : ''}`]]
    .filter(Boolean).map(([id, label]) => `<p class="comment-combat-profile-focus">${renderCombatIcon(getCombatConditionIconSource({ presetId: id }), '◆')} ${e(label)}</p>`).join('');
  return `<section class="comment-combat-profile-section comment-combat-card-effects">
    <div class="comment-combat-profile-section-head"><h4>Szenenzustände <span>${temporaryConditions.length}</span></h4>
      ${canManage ? '<button type="button" data-action="add-comment-combat-condition">+ Hinzufügen</button>' : ''}</div>
    ${focus}
    ${temporaryConditions.length ? `<ul class="comment-combat-conditions">${temporaryConditions.map(condition => renderCombatCondition(condition, {
      temporary: true, removable: canManage && !condition.encounterAura && !condition.restraint
    })).join('')}</ul>` : '<p class="comment-combat-profile-empty">Keine aktiven Szenenzustände</p>'}
    ${wide && permanentConditions.length ? `<details data-profile-details-key="permanent"><summary>Dauerhafte Zustände (${permanentConditions.length})</summary><ul class="comment-combat-conditions">${permanentConditions.map(condition => renderCombatCondition(condition, { diamond: true })).join('')}</ul></details>` : ''}
  </section>`;
}

function renderExtendedProfile(profile, summary) {
  const { held, shield, mountLabel, activeProtection, protectionSources, documentation } = summary;
  const equipment = [profile.armor?.name && ['Rüstung', profile.armor.name], held[1] && ['Zweite Hand', held[1].name],
    shield && ['Schild', shield.name], mountLabel && ['Reitsitz', mountLabel],
    profile.droppedWeapons?.length && ['Entwaffnet', profile.droppedWeapons.map(entry => entry.item?.name || entry.weaponName || 'Waffe').join(', ')],
    activeProtection && ['Magischer Schutz', `−${activeProtection} Schaden · ${protectionSources.join(', ')}`]]
    .filter(Boolean).map(([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('');
  const limitedRules = (documentation.limitedRules || []).map(rule => `<li class="comment-combat-condition"><div><strong>${e(rule.name)}</strong>
    <small>${e(rule.source)} · ${e(rule.period)} · ${rule.spent ? 'verbraucht' : 'verfügbar'}</small><small>${e(summarizeRuleEffects(rule.effects))}</small></div></li>`).join('');
  const activity = (documentation.activity || []).map(entry => `<li><strong>${e(entry.name)}</strong>${entry.actorName ? `<small>${e(entry.actorName)}</small>` : ''}
    ${entry.details?.length ? `<small>${entry.details.map(e).join(' · ')}</small>` : ''}</li>`).join('');
  const arsenal = renderCombatArsenalSummary(profile);
  const stats = `${renderCombatProfileAttributes(profile)}${renderCombatProfileTraits(profile)}`;
  return `<div class="comment-combat-card-details">
    ${section('Ausrüstung', `${equipment ? `<dl class="comment-combat-card-equipment">${equipment}</dl>` : ''}${arsenal}`)}
    ${section('Ausbildung', stats)}
    ${section('Szenenverlauf', `${limitedRules ? `<details data-profile-details-key="item-rules"><summary>Begrenzte Ausrüstungseffekte</summary><ul class="comment-combat-conditions">${limitedRules}</ul></details>` : ''}
      ${activity ? `<details data-profile-details-key="activity"><summary>Letzte bestätigte Vorgänge</summary><ol class="comment-combat-profile-activity">${activity}</ol></details>` : ''}`.trim())}
  </div>`;
}

export function renderMiniCombatProfile(profile, displayName, options = {}) {
  const summary = getCombatProfileSummary(profile);
  const canManage = options.canManage && !options.historical;
  return `${identity(profile, displayName || profile.name || 'Figur', summary, options)}
    <div class="comment-combat-card-columns">
      <div>${vitals(profile, summary)}${renderResources(profile, summary, options.wide)}</div>
      ${renderEffects(profile, summary, { canManage, wide: options.wide })}
    </div>${options.wide ? renderExtendedProfile(profile, summary) : ''}
    ${canManage ? `<footer class="comment-combat-profile-footer"><span>${options.encounter ? 'Kampfphase läuft' : 'Szenenwerte'}</span>
      <button type="button" data-action="reset-comment-combat-profile" ${options.encounter ? 'disabled title="Erst nach Ende der Kampfphase verfügbar"' : ''}>Zurücksetzen</button></footer>` : ''}`;
}
