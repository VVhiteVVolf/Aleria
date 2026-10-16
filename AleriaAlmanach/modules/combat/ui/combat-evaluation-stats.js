import { escapeCombatHtml as escape, combatTooltipAttributes } from './combat-presentation-markup.js';
import { renderCombatStatIcon } from './combat-presentation-icons.js?v=20261015-scenarios-v2';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js';
import { getEvaluationScenario } from './combat-evaluation-model.js';
import { renderEvaluationAttackRows, renderEvaluationDamageInstances } from './combat-evaluation-rolls.js';
import { describeRecordedDamageRoll } from './combat-damage-presentation.js';

function stat(kind, label, value, note, help) {
  return `<div class="combat-evaluation-stat combat-evaluation-stat--${kind}" ${combatTooltipAttributes(help, { focusable: true })}>${renderCombatStatIcon(kind)}<span>${escape(label)}</span><strong>${escape(value)}</strong><small>${escape(note)}</small></div>`;
}

/** Reads the committed receipt only. No current character values or recalculation. */
export function renderEvaluationStats(resolution = {}) {
  const scenario = getEvaluationScenario(resolution);
  const attack = resolution.attack || {}, snapshot = resolution.targetSnapshot || {};
  const saving = attack.resolutionMode === 'saving-throw', automatic = scenario.automatic;
  const rollLabel = saving ? 'Rettungswurf' : attack.resolutionMode === 'spell-attack' ? 'Zauber-Treffer' : 'Trefferwurf';
  const rolls = attack.diceResults?.length ? `W20 [${attack.diceResults.join(', ')}] ${Number(attack.modifier) >= 0 ? '+' : ''}${attack.modifier ?? 0}` : attack.notation || '';
  const multiple = scenario.sequence.count > 1;
  const cells = multiple ? [stat('attack', 'Angriffsfolge', `${scenario.sequence.hits} / ${scenario.sequence.count}`, 'Treffer / getrennte Angriffe', 'Die gesamte gespeicherte Folge. Jeder Angriff hat seinen eigenen Treffer- und gegebenenfalls Schadenswurf.')] : automatic ? [] : [stat(saving ? 'save' : 'attack', rollLabel, attack.total ?? '—', rolls, `${rollLabel} aus diesem Beitrag. ${saving ? 'Das Ziel besteht bei einem Ergebnis mindestens gleich dem SG.' : 'Ein Ergebnis mindestens gleich der Verteidigung trifft; kritische Ergebnisse werden gesondert ausgewertet.'}`)];
  if (!automatic && !multiple && attack.targetDefense != null) cells.push(stat('defense', saving ? 'Zauber-SG' : 'Verteidigung', attack.targetDefense, saving ? 'Schwierigkeitsgrad' : 'Zum Zeitpunkt des Angriffs', 'Gespeicherter Vergleichswert dieser Auswertung, einschließlich damals wirksamer Modifikatoren.'));
  const selfDamage = scenario.damage.filter(d => d.recipient === 'actor');
  const targetDamage = scenario.damage.filter(d => d.recipient === 'target');
  const damageNote = multiple ? 'Summe nach verbuchter Abwehr' : `${targetDamage.length > 1 ? targetDamage.map(d=>d.notation).filter(Boolean).join(' + ') : resolution.damage?.criticalDamage ? describeRecordedDamageRoll(resolution.damage) : resolution.damage?.notation || ''}${resolution.damage?.halvedBySave ? ' · halbiert' : ''}`;
  if (resolution.damage && !(scenario.self && selfDamage.length && !targetDamage.length)) cells.push(stat('damage', multiple || targetDamage.length > 1 ? 'Gesamtschaden' : 'Schaden angewandt', resolution.damage.total ?? '—', damageNote, 'Gespeicherte Schadenssumme nach verbuchter Abwehr. Einzelwürfe und Schadensinstanzen sind separat aufgeführt. Temporäre TP können diesen Schaden auffangen.'));
  if (selfDamage.length) cells.push(stat('damage', 'Eigenschaden', selfDamage.reduce((sum,d)=>sum+Number(d.applied || 0),0), 'Schaden an der handelnden Figur', 'Verbuchter Eigenschaden dieser Handlung.'));
  const hpChanged = snapshot.hitPointsBefore != null && snapshot.hitPointsAfter != null && Number(snapshot.hitPointsBefore) !== Number(snapshot.hitPointsAfter);
  const temporaryChanged = snapshot.temporaryHitPointsAfter != null && Number(snapshot.temporaryHitPointsBefore || 0) !== Number(snapshot.temporaryHitPointsAfter);
  if (snapshot.hitPointsAfter != null && (!automatic || hpChanged)) cells.push(stat('hp', scenario.self ? 'Eigene TP' : 'Ziel-TP', `${snapshot.hitPointsBefore ?? '—'} → ${snapshot.hitPointsAfter}`, snapshot.defeated ? 'Kampfunfähig' : 'Trefferpunkte nach der Handlung', 'Gespeicherte Trefferpunkte vor und nach dieser Handlung. Kein aktueller Live-Wert.'));
  if (Number(snapshot.temporaryHitPointsBefore) > 0 && !automatic || temporaryChanged) cells.push(stat('hp', 'Temporäre TP', `${snapshot.temporaryHitPointsBefore ?? 0} → ${snapshot.temporaryHitPointsAfter ?? 0}`, 'Schutzvorrat des Ziels', 'Gespeicherter temporärer Schutz vor und nach der Handlung; getrennt von echten Trefferpunkten.'));
  const own = resolution.actorHitPointSnapshot;
  if (own?.after && own.before?.current !== own.after.current && (!scenario.self || snapshot.hitPointsBefore === snapshot.hitPointsAfter)) cells.push(stat('hp', 'Eigene TP', `${own.before?.current ?? '—'} → ${own.after.current}`, 'Trefferpunkte der handelnden Figur', 'Gespeicherte Änderung an der handelnden Figur.'));
  if (own?.after && own.before?.temporary != null && own.after.temporary != null && own.before.temporary !== own.after.temporary && (!scenario.self || !temporaryChanged)) cells.push(stat('hp', 'Eigener temporärer Schutz', `${own.before.temporary} → ${own.after.temporary}`, 'Schutzvorrat der handelnden Figur', 'Gespeicherte Änderung des temporären Schutzes.'));
  const saves = (resolution.secondarySaves || []).map(save => {
    const attribute = { strength: 'KRF', dexterity: 'GES', constitution: 'KON', intelligence: 'INT', wisdom: 'WEI', charisma: 'CHA' }[save.attributeKey] || 'Rettung';
    return stat('save', `${attribute}-Rettung · SG ${save.dc}`, save.total, `${save.succeeded ? 'Gelungen' : 'Misslungen'}${save.timing === 'after-sequence' ? ' · nach der Folge' : ''}`, `Gespeicherter Rettungswurf ${save.total} gegen SG ${save.dc}. ${save.succeeded ? 'Das Ziel widersteht der Zusatzwirkung.' : 'Die Zusatzwirkung greift; Dauer und genaue Wirkung stehen in den Regelbelegen.'}`);
  });
  return `${cells.length ? `<div class="combat-evaluation-stats" aria-label="Gespeicherte Kampfwerte">${cells.join('')}</div>` : ''}${multiple ? renderEvaluationAttackRows(resolution) : ''}${scenario.damage.length > 1 && !multiple ? renderEvaluationDamageInstances(resolution) : ''}${saves.length ? `<div class="combat-evaluation-stats" aria-label="Zusätzliche Rettungswürfe">${saves.join('')}</div>` : ''}${renderEvaluationResources(resolution)}`;
}

function renderEvaluationResources(resolution) {
  const changes = resolution.actorResourceSnapshot?.changes || [];
  if (!changes.length) return '';
  return `<div class="combat-evaluation-resources" aria-label="Ressourcen nach der Handlung">${changes.map(change => {
    const icon = getCombatResourceIconPresentation({ id: change.resourceId || change.id, name: change.name });
    return `<span ${combatTooltipAttributes(`${change.name || 'Ressource'}: ${change.before} vor der Handlung, ${change.after} danach.`, { focusable: true })}>${icon.source ? `<img src="${escape(icon.source)}" alt="" width="18" height="18" loading="lazy">` : `<i aria-hidden="true">${escape(icon.fallback)}</i>`}<span>${escape(change.name || 'Ressource')}</span><b>${escape(change.before)} → ${escape(change.after)}</b></span>`;
  }).join('')}</div>`;
}
