import { resolveCombatProfile } from '../combat/combat-profile-resolver.js?v=20260928-equipment-art-v4';
import { getAttributeModifier, getEffectiveCombatAttribute } from '../combat/combat-profile-model.js?v=20260928-equipment-art-v4';
import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js?v=20260803-composer-design-v1';
import { CREATURE_IMAGE_LIBRARY } from './creature-images-model.js?v=20260919-creature-pages-v1';
import { renderCreatureBestiaryReference } from './creature-bestiary-view.js?v=20261013-draig-breeds-v2';
import { renderCreatureRuleSummary } from './creature-rule-presentation.js';
import { getCombatActionAvailability } from '../combat/ui/combat-action-availability.js';
import { renderCombatCondition } from '../combat-status/combat-status-view.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const signed = value => `${value >= 0 ? '+' : ''}${value}`;

function renderAction(action, profile, resourceNames) {
  const save = action.secondarySave;
  const saveLabel = profile.attributes.find(attribute => attribute.key === save?.attributeKey)?.shortLabel || 'Rettung';
  const costs = action.costs.map(cost => `${cost.amount} ${resourceNames.get(cost.resourceId) || cost.name || cost.resourceId}`).join(' + ');
  const description = action.weapon?.notes || '';
  const availability = getCombatActionAvailability(profile, action);
  const heading = action.resolutionMode === 'automatic' ? 'Automatisch' : action.resolutionMode === 'saving-throw'
    ? `SG ${action.spellSaveDc}` : `${signed(action.attackModifier)} Treffer`;
  return `<details class="creature-dossier-action"><summary><strong>${escape(action.name)}</strong><b>${escape(heading)}</b></summary><div>
    <p>${escape((action.formula || 'Effekt').replace(/d(?=\d)/gi, 'W'))}${action.formula ? ` ${signed(action.damageModifier || 0)}` : ''}${action.maximumTargets > 1 ? ` · bis zu ${action.maximumTargets} gewählte Ziele` : ''}</p>
    <small>${escape(costs || 'Ohne Ressourcenkosten')}</small>
    ${save?.enabled ? `<p>${escape(saveLabel)}-Rettung SG ${save.dc} · bei Misslingen: ${escape(save.failureCondition.name)}</p>` : ''}
    ${description ? `<p>${escape(description)}</p>` : ''}
    ${action.requiresVoice ? '<p>Eigene Stimme erforderlich</p>' : ''}
    ${availability.available ? (availability.paymentMode !== 'standard' ? `<p>${escape(availability.reason)}</p>` : '') : `<p>Nicht verfügbar: ${escape(availability.reason)}</p>`}
  </div></details>`;
}

export function renderCreatureDossier(creature, { includePortrait = true } = {}) {
  const profile = resolveCombatProfile(creature);
  const defaults = new Set(['default-melee', 'default-unarmed', 'default-unarmed-melee', 'unarmed']);
  const hasOwnAttack = profile.actions.some(action => action.kind === 'weapon' && !defaults.has(action.sourceId));
  const actions = profile.actions.filter(action => ['weapon', 'technique', 'ability', 'spell', 'song', 'prayer'].includes(action.kind)
    && !(hasOwnAttack && defaults.has(action.sourceId)));
  const resourceNames = new Map(profile.resources.map(resource => [resource.id, resource.name]));
  const portrait = CREATURE_IMAGE_LIBRARY.normalizeImageUrl(creature.portrait) || '';
  return `<article class="creature-dossier" aria-label="Kreaturkarte ${escape(creature.name)}">
    <header class="creature-dossier-heading"><div><small>Bestiarium · ${escape(creature.size)} · Stufe ${creature.level}</small><h2>${escape(creature.name)}</h2><p>${escape(creature.habitat)}</p></div><strong>RK ${profile.totalDefense}</strong></header>
    ${renderCreatureBestiaryReference(creature, escape)}
    <div class="creature-dossier-body">
      ${includePortrait && portrait ? `<figure><img src="${escape(portrait)}" alt="${escape(creature.name)}" decoding="async"><figcaption>${escape(creature.portraitCaption)}</figcaption></figure>` : ''}
      <div class="creature-dossier-content">
        <div class="creature-dossier-vitals"><span><small>Lebenspunkte</small><b>${profile.currentHitPoints} / ${profile.maximumHitPoints}</b></span><span><small>Temporäre LP</small><b>${profile.temporaryHitPoints || 0}</b></span><span><small>Trefferwürfel</small><b>W${profile.hitPoints.hitDie}</b></span><span><small>Bewegung</small><b>${profile.movement} m</b></span></div>
        <div class="creature-dossier-attributes">${profile.attributes.map(attribute => { const effective = getEffectiveCombatAttribute(profile, attribute.key); return `<span data-creature-effective-attribute="${attribute.key}">${escape(attribute.shortLabel)} <b>${effective.score}</b> (${signed(getAttributeModifier(effective))})${effective.score !== attribute.score || effective.effectiveMaximum != null ? `<small>Grundwert ${attribute.score}${effective.effectiveMaximum == null ? '' : ` · Obergrenze ${effective.effectiveMaximum}`}</small>` : ''}</span>`; }).join('')}</div>
        <div class="creature-dossier-resources" aria-label="Gespeicherte Ressourcen">${profile.resources.filter(resource => resource.maximum > 0).map(resource => {
          const icon = getCombatResourceIconPresentation(resource);
          return `<span title="${escape(resource.notes || (resource.scope === 'comment' ? 'Erneuert pro eigenem Kampfpost' : resource.recovery))}">${icon.source ? `<img src="${escape(icon.source)}" alt="">` : escape(icon.fallback)} ${escape(resource.name)} <b>${resource.current}/${resource.maximum}</b></span>`;
        }).join('')}</div>
        <p class="creature-dossier-source">Gespeicherter Kreaturbogen. Im Kampf werden LP, Ressourcen und Zustände je Instanz in der Szene geführt.</p>
        <h3>Angriffe &amp; Fähigkeiten</h3>
        <div class="creature-dossier-attacks">${actions.map(action => renderAction(action, profile, resourceNames)).join('')}</div>
        ${profile.abilities.filter(ability => ability.active && !ability.combatUsable).map(ability => `<details class="creature-dossier-trait"><summary>${escape(ability.name)}</summary><p>${escape(ability.description)}</p>${renderCreatureRuleSummary(ability)}</details>`).join('')}
        ${profile.quirks.length ? `<h3>Marotten &amp; Eigenschaften</h3>${profile.quirks.map(trait => `<details class="creature-dossier-trait"><summary>${escape(trait.name)}${trait.active === false ? ' · inaktiv' : ''}</summary><p>${escape(trait.description)}</p>${trait.appliesWhen ? `<p>${escape(trait.appliesWhen)}</p>` : ''}${renderCreatureRuleSummary(trait)}${trait.limitations ? `<p>${escape(trait.limitations)}</p>` : ''}</details>`).join('')}` : ''}
        <details class="creature-dossier-notes"><summary>Zustände &amp; Taktik</summary>${profile.conditions.some(condition => condition.active) ? `<ul class="comment-combat-conditions">${profile.conditions.filter(condition => condition.active).map(condition => renderCombatCondition(condition)).join('')}</ul>` : '<p>Keine Zustände im gespeicherten Bogen.</p>'}<p>${escape(creature.notes)}</p></details>
      </div>
    </div>
  </article>`;
}
