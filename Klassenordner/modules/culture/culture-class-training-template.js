import { escapeClassHtml as escape } from '../pages/class-page-content.js';
import { describeTechniqueDamage } from '../../../AleriaAlmanach/modules/combat/combat-technique-damage.js?v=20260905-party-combat-v1';

function renderAttack(attack, selectedLevel) {
  const available = attack.minimumLevel != null && attack.minimumLevel <= selectedLevel;
  const damage = describeTechniqueDamage(attack, { progression: { level: selectedLevel } });
  const modifiers = [
    attack.attackBonus ? `${attack.attackBonus > 0 ? '+' : ''}${attack.attackBonus} Angriff` : '',
    attack.targetDefenseModifier ? `${attack.targetDefenseModifier} Zielverteidigung` : '',
    attack.criticalThreshold < 20 ? `Kritisch ab ${attack.criticalThreshold}` : '',
    attack.maximumTargets > 1 ? `bis ${attack.maximumTargets} Ziele` : ''
  ].filter(Boolean).join(' · ');
  return `<article class="cenyr-attack" data-training-attack="${escape(attack.id)}" data-available="${available}" data-status="${escape(attack.status || 'draft')}">
    <div class="cenyr-attack-heading"><h4>${escape(attack.name)}</h4><span>${attack.minimumLevel == null ? 'Stufe offen' : `Stufe ${attack.minimumLevel}`} · ${attack.live ? 'im Kampfsystem' : 'Entwurf'}</span></div>
    <p>${escape(attack.description)}</p><dl><div><dt>Schaden</dt><dd data-training-damage>${escape(damage)}</dd></div><div><dt>Kosten</dt><dd>${escape(attack.costs.map(cost => `${cost.amount} ${cost.name}`).join(' + '))}</dd></div></dl>
    <p class="cenyr-attack-effect">${escape(attack.effect)}</p>${modifiers ? `<p class="cenyr-attack-modifiers">${escape(modifiers)}</p>` : ''}<small>${escape(attack.requirements)}</small>
  </article>`;
}

function formKind(form) {
  if (form.kind === 'foundation') return 'Grundform';
  if (form.kind === 'duelist') return 'Duellantenform';
  return 'Pfad';
}

function slotBandLabel(band) {
  return ({ foundation: 'Grundform', duelist: 'Duellantenform', expert: 'Expertenpfad', drachling: 'Drachling', earlyRoaring: 'Brüllender Drache' })[band] || band;
}

function renderTrainingProfile(plan) {
  const weapons = [...plan.weaponTraining.primary, ...plan.weaponTraining.secondary].join(' · ');
  return `<div class="cenyr-training-profile">
    <article><span>Attackenbudget</span><strong>${plan.techniqueBudget.total} Slots bis Stufe 20</strong><small>${escape(plan.techniquePool.description)}</small></article>
    <article><span>Waffenführung</span><strong>${escape(weapons)}</strong><small>${escape(plan.weaponTraining.note)}</small></article>
    <article><span>Pfadregel</span><strong>${escape(plan.pathSelection.rule)}</strong><small>${plan.pathSelection.multiplePathsAllowed ? 'Mehrere Pfade erlaubt · gemeinsames Attackenbudget' : 'Ein festgelegter Pfad'}</small></article>
  </div>`;
}

function renderTrainingBranches(plan) {
  if (!plan.trainingBranches.length) return '';
  return `<section class="cenyr-training-branches" aria-label="Ausbildungszweige"><h3>Ausbildungszweige</h3><div>${plan.trainingBranches.map(item => `<article><span>Ab Stufe ${item.minimumLevel}${item.maximumLevel ? `–${item.maximumLevel}` : ''}</span><strong>${escape(item.name)}</strong>${item.note ? `<small>${escape(item.note)}</small>` : ''}${item.optionQuotaPerForm ? `<b>Mindestens ${item.optionQuotaPerForm} berittene Optionen je Form oder Pfad</b>` : ''}</article>`).join('')}</div></section>`;
}

function renderWeaponVariants(plan) {
  if (!plan.weaponVariants.length) return '';
  return `<section class="cenyr-weapon-variants" aria-label="Waffenvarianten"><h3>Waffenregeln</h3><div>${plan.weaponVariants.map(item => `<article><strong>${escape(item.name)}</strong><p>${escape(item.rule)}</p></article>`).join('')}</div><p>Bei waffenabhängigen Attacken stammen die Schadenswürfel aus der aktuell geführten Waffe. Die Attacke selbst wird nur einmal im Archiv geführt.</p></section>`;
}

function renderLevelTraining(row, plan) {
  const startsCurrentPhase = row.forms.some(form => form.shortName === row.phase?.name);
  return [
    row.phase && !startsCurrentPhase ? escape(row.phase.name) : '',
    ...row.forms.map(form => `${escape(form.shortName)} beginnt`),
    ...row.pathOptions.map(form => form.accessStatus === 'eligibility-pending'
      ? `${escape(form.shortName)}: Klassenzugang noch offen`
      : `${escape(form.shortName)} wird wählbar`),
    ...row.techniqueSlots.map(slot => `Attackenslot · ${escape(slotBandLabel(slot.band))}`),
    row.level === plan.pathSelection?.minimumLevel && plan.pathSelection?.firstSelectionRequired ? 'Ersten Expertenpfad ohne Slotkosten wählen' : '',
    ...row.attacks.map(attack => escape(attack.name)),
    row.level === 6 ? 'Aura-Ausbildung beginnt' : ''
  ].filter(Boolean).join('<br>') || 'Ausbau innerhalb des Abschnitts';
}

export function renderCultureClassTraining(plan) {
  return `<section class="cenyr-training class-chapter" id="ausbildungsplan" aria-labelledby="heading-ausbildungsplan">
    <div class="class-chapter-heading"><span aria-hidden="true">✦</span><h2 id="heading-ausbildungsplan">Ausbildung · Stufe 1–20</h2></div>
    <div class="cenyr-training-intro"><div><p class="eyebrow">${escape(plan.trainingFocus)}</p><h3>${escape(plan.focus)}</h3><p>Die Ausbildung trennt Grundform, Duellantenform und wählbare Expertenpfade. Der vollständige Attackenkatalog ist als prüfbarer Entwurf eingetragen; nur ausdrücklich bestätigte Attacken werden bereits an Charakterbögen vergeben.</p></div><span class="cenyr-plan-status">Attackenplan 1–20</span></div>
    <div class="cenyr-training-phases">${plan.trainingPhases.map(phase => `<article><span>Stufe ${phase.minimumLevel}–${phase.maximumLevel}</span><strong>${escape(phase.name)}</strong><small>${phase.kind === 'path-selection' ? 'Pfade wählen und Attackenbudget verteilen' : phase.kind === 'pending' ? 'Inhalt noch offen' : 'Ausbildungsabschnitt'}</small></article>`).join('')}</div>
    ${renderTrainingProfile(plan)}
    ${renderTrainingBranches(plan)}
    ${renderWeaponVariants(plan)}
    <p class="cenyr-training-note">Schaden wächst mit der Ausbildung: Eine reguläre Technik verwendet die Würfel der geführten Waffe und einen begrenzten Technikbonus. Schwache Bonusangriffe beginnen mit 1W4. Für ältere Attacken gilt immer nur der höchste erreichte Ausbildungsbonus, auch wenn mehrere Pfade gewählt werden.</p>
    <p class="cenyr-training-note">${plan.classId === 'milwr' ? 'Milwr: Frühere Grundangriffe erhalten ab Stufe 6 +1W4, ab 10 stattdessen +1W6, ab 15 +1W8. Ältere Drachling-Angriffe wachsen auf Stufe 10 und 15 mit; nach Stufe 15 endet diese Staffel.' : 'Grundangriffe aus Stufe 1–6 erhalten ab Stufe 7 +1W4, ab 9 stattdessen +1W6, ab 13 +1W8 und ab 17 +1W10. Angriffe aus Stufe 7–8 erhalten ab 9 +1W4, ab 13 +1W6 und ab 17 +1W8. Ältere Pfadattacken wachsen auf Stufe 13 und 17 um einen begrenzten Zusatzwürfel mit.'} Der Stufenwähler zeigt den jeweils gültigen Schaden. Feste Waffen-, Attribut- und Klassenboni kommen einmal hinzu.</p>
    <div class="cenyr-level-toolbar"><label data-training-controls hidden>Ausbildungsstand ansehen <select data-role="training-level">${plan.levels.map(row => `<option value="${row.level}">Stufe ${row.level}</option>`).join('')}</select></label><p data-role="training-summary" role="status" aria-live="polite">Stufe 1 · ${plan.earnedTechniqueSlots.length} Attackenslot verdient</p></div>
    <p class="cenyr-training-note">Ab Stufe 6 beginnt die Aura-Ausbildung, der erste Aura-Fokuspunkt folgt auf Stufe 8; weitere Punkte auf 12, 16 und 20. Aura-Fokus kann das vollständige reguläre Kostenpaket ersetzen. Die meisten Attacken kombinieren Aktion, Bonusaktion und Reaktion, die sich pro Beitrag erneuern. Starke Abschlüsse und Meisterattacken verlangen zusätzlich Besondere Aktionen.</p>
    <p class="cenyr-training-note">Grundpools: 1 Aktion, 1 Bonusaktion, 1 Reaktion. Auf Stufe 10, 15 und 20 jeweils einen anderen Pool auf 2 erhöhen. Besondere Aktionen: 2 / 3 / 4 / 5 / 6 auf Stufe 1 / 8 / 10 / 15 / 20, Erholung täglich. Sonderstufen nach 20 bleiben individuell.</p>
    <details class="cenyr-level-table"><summary>Den vollständigen Stufenplan öffnen <span>1–20</span></summary><div class="cenyr-table-scroll" tabindex="0" aria-label="Stufenplan"><table><caption>Ausbildungsrahmen für ${escape(plan.name)}</caption><thead><tr><th scope="col">Stufe</th><th scope="col">Ausbildung</th><th scope="col">Klassenmerkmale</th></tr></thead><tbody>${plan.levels.map(row => `<tr data-training-row="${row.level}"${row.level === 1 ? ' aria-current="step"' : ''}><th scope="row">${row.level}</th><td>${renderLevelTraining(row, plan)}</td><td>${row.features.map(feature => `<strong>${escape(feature.name)}</strong><br>${escape(feature.description)}`).join('<br>') || 'Weitere Details offen'}</td></tr>`).join('')}</tbody></table></div></details>
    ${plan.styles.map(style => `<div class="cenyr-combat-style"><p class="eyebrow">Kampftechnik · ${escape(style.culture)}</p><h3>${escape(style.name)}</h3><p>${plan.classId === 'milwr' ? 'Grundform 1–6 · Pfad des Drachlings 6–15 · freie Klassenentwicklung 16–20.' : 'Grundform 1–6 · Duellantenform 7–8 · wählbare Pfade 9–20.'} Erlernte Attacken bleiben nach ihrem Ausbildungsabschnitt nutzbar.</p><div class="cenyr-forms">${style.forms.map(form => `<details class="cenyr-form" data-training-form="${escape(form.id)}" data-access="${form.blocked ? 'blocked' : 'available'}"${form.kind === 'foundation' ? ' open' : ''}><summary><span class="cenyr-form-number">${form.number || 'P'}</span><span><strong>${escape(form.shortName)}</strong><small>${formKind(form)} · ${form.blocked ? 'Für diese Klasse gesperrt' : form.accessStatus === 'eligibility-pending' ? 'Zugang dieser Klasse noch offen' : `${form.isChoice ? 'Wählbar' : 'Beginn'} ab Stufe ${form.minimumLevel}`} · Ausbildung bis Stufe ${form.maximumTrainingLevel}</small></span><span class="cenyr-form-count">${form.techniques.length ? `${form.techniques.length} Attacken im Pool` : 'Keine Klassenattacke'}</span></summary>${form.accessNote ? `<p class="cenyr-form-note">${escape(form.accessNote)}</p>` : ''}${form.blocked ? '<p class="cenyr-form-empty">Dieser Pfad gehört nicht zur Ausbildung dieser Klasse.</p>' : form.techniques.length ? `<div class="cenyr-attacks">${form.techniques.map(attack => renderAttack(attack, plan.selectedLevel)).join('')}</div>` : '<p class="cenyr-form-empty">Für diese Form besitzt die Klasse keine eigene Attacke.</p>'}</details>`).join('')}</div></div>`).join('')}
    <aside class="cenyr-pending-training"><h3>Noch zu bestätigen</h3><ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)} <span>· redaktionelle oder technische Freigabe offen</span></li>`).join('')}</ul><p>Die entworfenen Attacken verändern bestehende Charakterbögen noch nicht. Nach der gemeinsamen Balanceprüfung werden sie über den Attackenwähler an freie Slots gebunden.</p></aside>
  </section>`;
}
