import { escapeCombatHtml as escape, combatTooltipAttributes } from './combat-presentation-markup.js';
import { renderCombatStatIcon } from './combat-presentation-icons.js?v=20261015-scenarios-v2';
import { getRecordedEffectCards } from './combat-evaluation-model.js';

function renderCounterRules(condition = {}) {
  const save = condition.counterAttack?.secondarySave;
  if (!save?.enabled) return '';
  const attribute = {strength:'KRF',dexterity:'GES',constitution:'KON',wisdom:'WEI'}[save.attributeKey] || save.attributeKey;
  const dc = save.fixedDc ?? save.dc;
  return `<dl class="combat-evaluation-counter-rules"><div><dt>Rettung bei späterem Kontertreffer</dt><dd>${renderCombatStatIcon('save')}<b>${escape(attribute)} ${dc != null ? `SG ${escape(dc)}` : '· SG gemäß Waffenführung'}</b></dd></div>${save.failureCondition?.name ? `<div><dt>Bei misslungener Konter-Rettung</dt><dd><b>${escape(save.failureCondition.name)}</b>${save.failureCondition.description ? `<small>${escape(save.failureCondition.description)}</small>` : ''}</dd></div>` : ''}</dl>`;
}

export function renderEvaluationEffectCards(resolution = {}) {
  const cards = getRecordedEffectCards(resolution);
  if (!cards.length) return '';
  const applied = cards.filter(card => card.operation === 'applied');
  const changes = cards.filter(card => card.operation !== 'applied');
  return `${applied.length ? `<div class="combat-evaluation-effects" aria-label="Verbuchte Wirkungen">${applied.map(card => `<article class="combat-evaluation-effect" data-effect-operation="${card.operation}"><header>${renderCombatStatIcon(card.counter ? 'counter' : 'effect')}<span>${escape(card.role)} · ${escape(card.recipient === 'actor' || resolution.actorId === resolution.targetId ? 'Selbst' : resolution.targetName || 'Ziel')}</span></header><h4>${escape(card.name)}</h4>${card.description ? `<p>${escape(card.description)}</p>` : ''}${card.counter ? renderCounterRules(card.condition) : ''}${card.duration ? `<div class="combat-evaluation-effect-duration" ${combatTooltipAttributes('Gespeicherte Wirkungsdauer dieser Handlung.')} >${renderCombatStatIcon('duration')}<b>${escape(card.duration)}</b></div>` : ''}</article>`).join('')}</div>` : ''}${changes.length ? `<div class="combat-evaluation-ended">${changes.map(card => `<span ${combatTooltipAttributes([card.role,card.name,card.description].join(' · '),{focusable:true})}>${escape(card.name)} · ${card.operation === 'removed' ? 'beendet / entfernt' : 'aktualisiert'}</span>`).join('')}</div>` : ''}`;
}
