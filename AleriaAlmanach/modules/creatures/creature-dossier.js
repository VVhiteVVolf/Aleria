import { resolveCombatProfile } from '../combat/combat-profile-resolver.js?v=20260906-effect-rolls-v1';
import { getAttributeModifier, getEffectiveCombatAttribute } from '../combat/combat-profile-model.js?v=20260906-effect-rolls-v1';
import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js?v=20260803-composer-design-v1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const signed = value => `${value >= 0 ? '+' : ''}${value}`;

function renderAction(action, profile, resourceNames) {
  const save = action.secondarySave;
  const saveLabel = profile.attributes.find(attribute => attribute.key === save?.attributeKey)?.shortLabel || 'Rettung';
  const costs = action.costs.map(cost => `${cost.amount} ${resourceNames.get(cost.resourceId) || cost.name || cost.resourceId}`).join(' + ');
  const description = action.weapon?.notes || '';
  const heading = action.resolutionMode === 'automatic' ? 'Automatisch' : action.resolutionMode === 'saving-throw'
    ? `SG ${action.spellSaveDc}` : `${signed(action.attackModifier)} Treffer`;
  return `<section><div><strong>${escape(action.name)}</strong><b>${escape(heading)}</b></div>
    <p>${escape((action.formula || 'Effekt').replace(/d(?=\d)/gi, 'W'))}${action.formula ? ` ${signed(action.damageModifier || 0)}` : ''}${action.maximumTargets > 1 ? ` · bis zu ${action.maximumTargets} gewählte Ziele` : ''}</p>
    <small>${escape(costs || 'Ohne Ressourcenkosten')}</small>
    ${save?.enabled ? `<p>${escape(saveLabel)}-Rettung SG ${save.dc} · bei Misslingen: ${escape(save.failureCondition.name)}</p>` : ''}
    ${description ? `<details><summary>Wirkung</summary><p>${escape(description)}</p></details>` : ''}
  </section>`;
}

export function renderCreatureDossier(creature, { includePortrait = true } = {}) {
  const profile = resolveCombatProfile(creature);
  const actions = profile.actions.filter(action => ['weapon', 'technique', 'ability', 'spell', 'song', 'prayer'].includes(action.kind)
    && action.sourceId !== 'default-melee' && action.compatible !== false);
  const resourceNames = new Map(profile.resources.map(resource => [resource.id, resource.name]));
  const portrait = /^https?:\/\//i.test(creature.portrait || '') ? creature.portrait : '';
  return `<article class="creature-dossier" aria-label="Kreaturkarte ${escape(creature.name)}">
    <header class="creature-dossier-heading"><div><small>Bestiarium · ${escape(creature.size)} · Stufe ${creature.level}</small><h2>${escape(creature.name)}</h2><p>${escape(creature.habitat)}</p></div><strong>RK ${profile.totalDefense}</strong></header>
    <div class="creature-dossier-body">
      ${includePortrait && portrait ? `<figure><img src="${escape(portrait)}" alt="${escape(creature.name)}" decoding="async"><figcaption>${escape(creature.portraitCaption)}</figcaption></figure>` : ''}
      <div class="creature-dossier-content">
        <div class="creature-dossier-vitals"><span><small>Lebenspunkte</small><b>${profile.currentHitPoints} / ${profile.maximumHitPoints}</b></span><span><small>Temporäre LP</small><b>${profile.temporaryHitPoints || 0}</b></span><span><small>Trefferwürfel</small><b>W${profile.hitPoints.hitDie}</b></span><span><small>Bewegung</small><b>${profile.combat.movement} m</b></span></div>
        <div class="creature-dossier-attributes">${profile.attributes.map(attribute => `<span>${escape(attribute.shortLabel)} <b>${attribute.score}</b> (${signed(getAttributeModifier(getEffectiveCombatAttribute(profile, attribute.key)))})</span>`).join('')}</div>
        <div class="creature-dossier-resources" aria-label="Gespeicherte Ressourcen">${profile.resources.filter(resource => resource.maximum > 0).map(resource => {
          const icon = getCombatResourceIconPresentation(resource);
          return `<span title="${escape(resource.notes || (resource.scope === 'comment' ? 'Erneuert pro eigenem Kampfpost' : resource.recovery))}">${icon.source ? `<img src="${escape(icon.source)}" alt="">` : escape(icon.fallback)} ${escape(resource.name)} <b>${resource.current}/${resource.maximum}</b></span>`;
        }).join('')}</div>
        <p class="creature-dossier-source">Gespeicherter Kreaturbogen. Im Kampf werden LP, Ressourcen und Zustände je Instanz in der Szene geführt.</p>
        <h3>Angriffe &amp; Fähigkeiten</h3>
        <div class="creature-dossier-attacks">${actions.map(action => renderAction(action, profile, resourceNames)).join('')}</div>
        ${profile.abilities.filter(ability => ability.active && !ability.combatUsable).map(ability => `<section class="creature-dossier-trait"><h3>${escape(ability.name)}</h3><p>${escape(ability.description)}</p></section>`).join('')}
        <details class="creature-dossier-notes"><summary>Zustände &amp; Taktik</summary><p>${escape(profile.conditions.filter(condition => condition.active).map(condition => `${condition.name}${condition.duration ? ` · ${condition.duration}` : ''}`).join('; ') || 'Keine Zustände im gespeicherten Bogen.')}</p><p>${escape(creature.notes)}</p></details>
      </div>
    </div>
  </article>`;
}
