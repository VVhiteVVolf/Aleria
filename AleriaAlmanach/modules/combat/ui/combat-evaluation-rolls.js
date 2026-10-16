import { escapeCombatHtml as escape, combatTooltipAttributes } from './combat-presentation-markup.js';
import { getEvaluationAttackRows, getRecordedDamageInstances } from './combat-evaluation-model.js';
import { describeRecordedDamageRoll } from './combat-damage-presentation.js';

export function evaluationRollText(roll = {}, label = 'Angriff') {
  const dice = roll.diceResults?.length ? `W20 [${roll.diceResults.join(', ')}] ${Number(roll.modifier) >= 0 ? '+' : ''}${roll.modifier ?? 0}` : roll.notation || 'Wurf nicht einzeln gespeichert';
  const outcome = roll.resolutionMode === 'saving-throw' ? roll.saveSucceeded ? 'gelungen' : 'misslungen' : roll.criticalFailure ? 'Kritischer Fehlschlag' : roll.criticalSuccess ? 'Kritischer Treffer' : roll.hit ? 'Treffer' : 'verfehlt';
  return `${label}: ${dice} · ${outcome}${roll.rollMode === 'advantage' ? ' · Vorteil' : roll.rollMode === 'disadvantage' ? ' · Nachteil' : ''}`;
}

const total = (values, key) => values.length && values.every(v => Number.isFinite(Number(v[key])) && v[key] != null) ? values.reduce((sum,v) => sum+Number(v[key]),0) : null;
const damageRollText = describeRecordedDamageRoll;

export function renderEvaluationAttackRows(resolution = {}) {
  const rows = getEvaluationAttackRows(resolution);
  if (!rows.length) return '';
  const saving = resolution.attack?.resolutionMode === 'saving-throw';
  return `<div class="combat-evaluation-roll-scroll"><table class="combat-evaluation-rolls"><caption>${rows.length > 1 ? `${rows.length} getrennte Angriffsinstanzen` : saving ? 'Gespeicherter Rettungswurf' : 'Gespeicherter Trefferwurf'}</caption><thead><tr><th>Instanz</th><th>${saving ? 'Rettung' : 'Trefferwurf'}</th><th>${saving ? 'SG' : 'Abwehr'}</th><th>Ergebnis</th><th>Gewürfelt</th><th>Angewandt</th></tr></thead><tbody>${rows.map(row => {
    const attack = row.attack, outcome = saving ? attack.saveSucceeded ? 'gelungen' : 'misslungen' : attack.criticalFailure ? 'Kritischer Fehlschlag' : attack.criticalSuccess ? 'Kritischer Treffer' : attack.hit ? 'Treffer' : 'verfehlt';
    const raw = total(row.damage, 'raw') ?? row.fallbackDamage?.rawTotal ?? row.fallbackDamage?.primaryTotal ?? row.fallbackDamage?.total;
    const applied = total(row.damage, 'applied') ?? (rows.length === 1 ? row.fallbackDamage?.total : null);
    const formula = row.damage.map(d => damageRollText(d.result.roll,d.notation)).filter(Boolean).join(' + ') || (row.fallbackDamage ? damageRollText(row.fallbackDamage) : '');
    return `<tr data-roll-outcome="${attack.criticalSuccess ? 'critical' : attack.hit ? 'hit' : 'miss'}"><th scope="row"><b>${row.number}. ${escape(row.label)}</b>${row.weaponName ? `<small>${escape(row.weaponName)}</small>` : ''}</th><td class="combat-roll-total${saving ? ' combat-roll-total--save' : ''}"><b>${escape(attack.total ?? '—')}</b><small>${escape(evaluationRollText(attack, saving ? 'Rettungswurf' : row.label === 'Angriff' ? 'Angriff' : row.label))}</small></td><td>${escape(attack.targetDefense ?? '—')}</td><td><span class="combat-roll-outcome">${escape(outcome)}</span></td><td class="combat-roll-damage"><b>${raw == null ? '—' : escape(raw)}</b><small>${escape(formula || 'Kein Schadenswurf')}</small></td><td class="combat-roll-damage" ${combatTooltipAttributes(applied == null ? 'Kein eigener Anwendungsbeleg für diese Instanz gespeichert. Die Gesamtauswertung bleibt maßgeblich.' : 'Schaden dieser Instanz nach gespeicherter Abwehr; temporäre TP können ihn anschließend auffangen.')}><b>${applied == null ? attack.hit || saving ? '—' : '0' : escape(applied)}</b></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

export function renderEvaluationDamageInstances(resolution = {}) {
  const damages = getRecordedDamageInstances(resolution);
  if (!damages.length) return '';
  return `<div class="combat-evaluation-roll-scroll"><table class="combat-evaluation-rolls combat-evaluation-damage-instances"><caption>Schadensinstanzen & Abwehr</caption><thead><tr><th>Instanz / Art</th><th>Gewürfelt</th><th>Schutz</th><th>Angewandt</th><th>TP-Verlust</th></tr></thead><tbody>${damages.map(d => {
    const protection = d.result.applied.equipmentProtection;
    const guard = d.result.applied.damageGuard;
    const notes = [d.result.roll?.halvedBySave ? 'Rettung: halber Schaden' : '', d.result.roll?.damageReduction ? `Regelwirkung: −${d.result.roll.damageReduction}` : '', protection?.reduction ? `${protection.sources?.map(s=>s.armorName || s.name).join(', ') || 'Ausrüstung'}: −${protection.reduction}` : '', guard?.reduction ? `${guard.name || 'Verbrauchte Abwehr'}: −${guard.reduction}` : '', d.result.applied.damageResponse?.response !== 'normal' ? ({resistant:'Resistenz',immune:'Immunität',vulnerable:'Verwundbarkeit'})[d.result.applied.damageResponse?.response] : '', d.result.applied.absorbedByTemporary ? `${d.result.applied.absorbedByTemporary} durch temporäre TP abgefangen` : ''].filter(Boolean).join(' · ');
    return `<tr><th scope="row">${d.index+1}. ${escape(d.damageType)}<small>${escape(d.recipient === 'actor' ? 'Selbst' : resolution.targetName || 'Ziel')}${d.followIndex ? ` · Folgeangriff ${escape(d.followIndex)}` : ''}</small></th><td class="combat-roll-damage"><b>${escape(d.raw ?? '—')}</b><small>${escape(damageRollText(d.result.roll,d.notation))}</small></td><td>${escape(notes || 'Kein gesonderter Schutz verbucht')}</td><td class="combat-roll-damage"><b>${escape(d.applied ?? '—')}</b></td><td>${escape(d.hitPointDamage ?? '—')}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

export function renderEvaluationSaveRecords(resolution = {}) {
  const saves = resolution.secondarySaves || [];
  if (!saves.length) return '';
  const attributes = {strength:'KRF',dexterity:'GES',constitution:'KON',intelligence:'INT',wisdom:'WEI',charisma:'CHA'};
  return `<ul class="combat-evaluation-record-list">${saves.map(save => `<li><b>${escape(attributes[save.attributeKey] || 'Rettung')}-Rettung ${escape(save.total)} gegen SG ${escape(save.dc)}</b><span>${save.succeeded ? 'gelungen' : 'misslungen'} · ${save.timing === 'after-sequence' ? 'nach der gesamten Angriffsfolge' : 'nach dem auslösenden Treffer'}</span>${save.diceResults?.length ? `<small>W20 [${escape(save.diceResults.join(', '))}] ${Number(save.modifier) >= 0 ? '+' : ''}${escape(save.modifier ?? 0)}</small>` : ''}</li>`).join('')}</ul>`;
}
