import { sceneElementEscape as escape } from '../scene-elements/scene-element-markup.js';
import { getCombatConditionIconSource } from '../combat-status/combat-condition-icons.js';

const root = '/AleriaAlmanach/public/assets/combat-phase-counter/';
export const PHASE_COUNTER_ICON = `${root}counter-v1.webp`;

export function renderPhaseDiamond(phase) {
  const digits = String(phase);
  const valid = /^[0-9]{1,2}$/.test(digits);
  if (!valid) return '';
  return `<span class="combat-phase-diamond" aria-hidden="true">
    <img class="combat-phase-diamond-frame" src="${root}diamond-v1.webp" alt="" decoding="async">
    <span class="combat-phase-digits" data-digits="${digits.length}">${[...digits].map(digit => `<img src="${root}digit-${digit}-v1.webp" alt="" decoding="async">`).join('')}</span>
  </span>`;
}

function renderPhaseEffects(phase, events) {
  const applications = (phase.conditionApplications || []).map(({ actorName, actorId, condition }) => `<li>
    <img src="${escape(getCombatConditionIconSource(condition))}" alt="" decoding="async">${escape(actorName || actorId)} erhält ${escape(condition.name)}.</li>`);
  const skipped = (phase.skippedConditions || []).map(effect => `<li>${escape(effect.actorName || effect.actorId)} · ${escape(effect.reason)}</li>`);
  const periodic = (events || []).map(effect => {
    const change = [
      effect.loss > 0 && `−${effect.loss} TP`,
      effect.absorbedByTemporary > 0 && `−${effect.absorbedByTemporary} temporäre TP`,
      effect.expiredTemporary > 0 && `${effect.expiredTemporary} temporäre TP verfallen`
    ].filter(Boolean).join(' · ');
    return change ? `<li>${escape(effect.actorName || effect.actorId)} · ${escape((effect.names || []).join(', '))} · ${escape(change)}</li>` : '';
  }).filter(Boolean);
  const creatures = (phase.creatureResolutions || []).flatMap(receipt => {
    const before = receipt.actorHitPointSnapshot?.before?.current;
    const after = receipt.actorHitPointSnapshot?.after?.current;
    const delta = Number.isFinite(before) && Number.isFinite(after) ? after - before : 0;
    if (!delta && !receipt.turnEnd?.suppressed) return [];
    const change = delta > 0 ? `+${delta} TP` : delta < 0 ? `−${-delta} TP` : 'unterdrückt';
    return [`<li>${escape(receipt.actorName)} · ${escape(receipt.turnEnd?.name || 'Regeneration')} · ${change}</li>`];
  });
  const entries = [...periodic, ...creatures, ...applications, ...skipped];
  return entries.length ? `<ul class="combat-phase-effects">${entries.join('')}</ul>` : '';
}

export function renderCombatPhaseComment(comment, phase) {
  if (!['start', 'advance'].includes(phase.operation)) return '';
  return `<article class="combat-phase-comment" data-comment-id="${escape(comment.id)}" aria-label="Phase ${phase.phase} von ${phase.lastPhase}">
    ${renderPhaseDiamond(phase.phase)}
    <div class="combat-phase-comment-copy">
      <h3>Phase ${phase.phase} von ${phase.lastPhase}</h3>
      ${phase.flavor ? `<p>${escape(phase.flavor)}</p>` : ''}
      ${renderPhaseEffects(phase, comment.criticalLifecycle)}
    </div>
  </article>`;
}

export function renderCombatPhaseRail(phase, expanded, controlsId) {
  const action = expanded ? 'Phasenzähler einklappen' : 'Phasenzähler ausklappen';
  return `<button class="combat-phase-rail-toggle" type="button" data-combat-phase-action="toggle" aria-controls="${controlsId}"
    aria-expanded="${expanded}" aria-label="${action}, Phase ${phase.phase} von ${phase.lastPhase}" title="${action}">
    ${renderPhaseDiamond(phase.phase)}<span>${phase.phase} / ${phase.lastPhase}</span><span aria-hidden="true">${expanded ? '▴' : '▾'}</span>
  </button>
  <div class="combat-phase-rail-details" id="${controlsId}"${expanded ? '' : ' hidden'}>
    <strong>Szenenphase</strong>
    <button type="button" data-combat-phase-action="open" data-combat-phase-edit aria-haspopup="dialog" aria-label="Zähler bearbeiten"><span>Bearbeiten</span><span>Ändern</span></button>
  </div>`;
}
