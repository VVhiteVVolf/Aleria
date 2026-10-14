import { escapeCombatHtml as escape, combatTooltipAttributes } from './combat-presentation-markup.js';
import { renderCombatStatIcon } from './combat-presentation-icons.js';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js';

function stat(kind, label, value, note, help) {
  return `<div class="combat-evaluation-stat combat-evaluation-stat--${kind}" ${combatTooltipAttributes(help, { focusable: true })}>${renderCombatStatIcon(kind)}<span>${escape(label)}</span><strong>${escape(value)}</strong><small>${escape(note)}</small></div>`;
}

/** Reads the committed receipt only. No current character values or recalculation. */
export function renderEvaluationStats(resolution = {}) {
  const attack = resolution.attack || {}, snapshot = resolution.targetSnapshot || {};
  const saving = attack.resolutionMode === 'saving-throw', automatic = attack.resolutionMode === 'automatic';
  const rollLabel = saving ? 'Rettungswurf' : attack.resolutionMode === 'spell-attack' ? 'Zauber-Treffer' : 'Trefferwurf';
  const rolls = attack.diceResults?.length ? `W20 [${attack.diceResults.join(', ')}] ${Number(attack.modifier) >= 0 ? '+' : ''}${attack.modifier ?? 0}` : attack.notation || '';
  const cells = [stat(saving ? 'save' : 'attack', automatic ? 'Wirkung' : rollLabel, automatic ? 'Automatisch' : attack.total ?? '—', rolls, automatic ? 'Diese gespeicherte Handlung benötigt keinen Trefferwurf.' : `${rollLabel} aus diesem Beitrag. ${rolls}. ${saving ? 'Das Ziel besteht bei einem Ergebnis mindestens gleich dem SG.' : 'Ein Ergebnis mindestens gleich der Verteidigung trifft; kritische Ergebnisse werden gesondert ausgewertet.'}`)];
  if (!automatic && attack.targetDefense != null) cells.push(stat('defense', saving ? 'Zauber-SG' : 'Verteidigung', attack.targetDefense, saving ? 'Schwierigkeitsgrad' : 'Zum Zeitpunkt des Angriffs', 'Gespeicherter Vergleichswert dieser Auswertung, einschließlich damals wirksamer Modifikatoren.'));
  if (resolution.damage) cells.push(stat('damage', 'Schaden', resolution.damage.total ?? '—', `${resolution.damage.notation || ''}${resolution.damage.halvedBySave ? ' · halbiert' : ''}`, 'Gespeicherte Schadenssumme dieser Handlung. Verbuchte Halbierungen und Angriffsfolgen sind berücksichtigt. Rüstung, Resistenzen und temporäre TP können den Verlust echter Trefferpunkte verringern. Einzelne Würfe stehen unter Wurfdetails.'));
  if (snapshot.hitPointsAfter != null) cells.push(stat('hp', 'Ziel-TP', `${snapshot.hitPointsBefore ?? '—'} → ${snapshot.hitPointsAfter}`, snapshot.defeated ? 'Kampfunfähig' : 'Trefferpunkte nach der Handlung', 'Gespeicherte Trefferpunkte vor und nach dieser Handlung. Kein aktueller Live-Wert. Temporäre TP und spätere Heilungen werden separat dokumentiert.'));
  if (Number(snapshot.temporaryHitPointsBefore) > 0) cells.push(stat('hp', 'Temporäre TP', `${snapshot.temporaryHitPointsBefore} → ${snapshot.temporaryHitPointsAfter ?? 0}`, 'Schutzvorrat des Ziels', 'Gespeicherter temporärer Schutz vor und nach der Handlung; getrennt von echten Trefferpunkten.'));
  const saves = (resolution.secondarySaves || []).map(save => {
    const attribute = { strength: 'KRF', dexterity: 'GES', constitution: 'KON', intelligence: 'INT', wisdom: 'WEI', charisma: 'CHA' }[save.attributeKey] || 'Rettung';
    return stat('save', `${attribute}-Rettung · SG ${save.dc}`, save.total, `${save.succeeded ? 'Gelungen' : 'Misslungen'}${save.timing === 'after-sequence' ? ' · nach der Folge' : ''}`, `Gespeicherter Rettungswurf ${save.total} gegen SG ${save.dc}. ${save.succeeded ? 'Das Ziel widersteht der Zusatzwirkung.' : 'Die Zusatzwirkung greift; Dauer und genaue Wirkung stehen in den Regelbelegen.'}`);
  });
  const condition = resolution.targetConditionSnapshot?.applied;
  const applied = condition?.name ? `<div class="combat-evaluation-condition" ${combatTooltipAttributes([condition.name, condition.description, condition.duration].filter(Boolean).join(' · '), { focusable: true })}>${renderCombatStatIcon('save')}<span>Zustand am Ziel</span><b>${escape(condition.name)}</b></div>` : '';
  return `<div class="combat-evaluation-stats" aria-label="Gespeicherte Kampfwerte">${cells.join('')}</div>${saves.length ? `<div class="combat-evaluation-stats" aria-label="Zusätzliche Rettungswürfe">${saves.join('')}</div>` : ''}${applied}${renderEvaluationResources(resolution)}`;
}

function renderEvaluationResources(resolution) {
  const changes = resolution.actorResourceSnapshot?.changes || [];
  if (!changes.length) return '';
  return `<div class="combat-evaluation-resources" aria-label="Ressourcen nach der Handlung">${changes.map(change => {
    const icon = getCombatResourceIconPresentation({ id: change.resourceId || change.id, name: change.name });
    return `<span ${combatTooltipAttributes(`${change.name || 'Ressource'}: ${change.before} vor der Handlung, ${change.after} danach.`, { focusable: true })}>${icon.source ? `<img src="${escape(icon.source)}" alt="" width="18" height="18" loading="lazy">` : `<i aria-hidden="true">${escape(icon.fallback)}</i>`}<span>${escape(change.name || 'Ressource')}</span><b>${escape(change.before)} → ${escape(change.after)}</b></span>`;
  }).join('')}</div>`;
}
