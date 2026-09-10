import { escapeClassHtml as escape } from '../pages/class-page-content.js';

export function renderPathFeatures(form) {
  if (!form.features?.length) return '';
  return `<section class="culture-path-features" aria-label="Pfadboni"><h4>Dauerhafte Pfadeigenschaften</h4><ul>${form.features.map(feature => `<li data-training-feature-level="${feature.minimumLevel}"><strong>Stufe ${feature.minimumLevel} · ${escape(feature.name)}</strong><p>${escape(feature.description)}</p></li>`).join('')}</ul><p>Die Merkmale gelten dauerhaft, sobald der Pfad gewählt und die jeweilige Stufe erreicht wurde. Bei Steigerungen ersetzt der höhere Wert den niedrigeren; zusätzliche Pfade erzeugen keine zusätzlichen Handlungen.</p></section>`;
}

export function renderCultureTrainingTools(plan) {
  if (!['vennyr', 'aldrimar'].includes(plan.cultureId)) return '';
  if (plan.skaldReference) return '<p class="culture-resource-summary" data-training-resources>Grundrepertoire bis Stufe 5; weitere Entwicklung offen.</p>';
  const weapons = [...new Set(plan.attackCatalog.map(attack => attack.weaponLabel))];
  return `<div class="culture-training-tools" data-training-controls hidden><label>Waffenweg <select data-role="training-weapon"><option value="">Alle Waffenwege</option>${weapons.map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('')}</select></label><label class="culture-training-toggle"><input type="checkbox" data-role="training-earned-only"> Nur Optionen bis zur gewählten Stufe</label></div>
    <p class="culture-resource-summary" data-training-resources>Besondere Aktionen 2 · Aura-Fokuspunkte 0 · Aktion 1 / Bonusaktion 1 / Reaktion 1</p>`;
}

export function renderFoundationSelection(plan) {
  if (!plan.foundationSelection?.options?.length) return '';
  return `<div class="culture-training-tools" data-training-controls hidden><label>Grundausbildung <select data-role="training-foundation"><option value="">Grundausbildung wählen</option>${plan.foundationSelection.options.map(option => `<option value="${escape(option.formId)}"${option.formId === plan.selectedFoundationFormId ? ' selected' : ''}>${escape(option.name)}</option>`).join('')}</select></label></div><p class="cenyr-training-note">Derwyn aus Cenyr und Vennyr wählen eine der beiden Grundausbildungen. Auf Stufe 7–8 folgt die freie kreative Phase; ab Stufe 9 stehen beiden Wegen dieselben vier Wyrmformen offen.</p>`;
}

export function trainingIntro(plan) {
  if (plan.cultureId === 'aldrimar') return plan.skaldReference
    ? 'Der Skalde ist ein Kampfbarde und möglicher Begleiter einer zweiten Klassenausbildung. Das Grundrepertoire folgt Freyas bestehendem Stand; Stufe 6–20 bleibt ausdrücklich offen.'
    : 'Die Huskarl-Waffenlehre verbindet nordische Standfestigkeit mit bewusster Führung von Klinge, Axt, Schild und Speer. Diese Klassenfolgen, Boni und Expertenpfade sind ein Ausbildungsentwurf für die spätere Vergabe an Figuren.';
  return plan.cultureId === 'vennyr'
    ? plan.classId === 'derwyn'
      ? 'Der Wyrmtanz verbindet die Disziplin des Drachentanzes mit fließenden Richtungswechseln und kurzen, schweren Einschlägen. Die Derwyn wählen ihre Grundausbildung; anschließend führen vier gemeinsame Pfade Schwert, Dreizack, Stab und Morgenstern.'
      : 'Der Wyrmtanz verbindet die Disziplin des Drachentanzes mit fließenden Richtungswechseln und kurzen, schweren Einschlägen. Die folgenden Waffenfolgen, Klassenmerkmale und Pfadboni bilden einen vollständigen Ausbildungsentwurf; sie sind noch keine automatisch erlernten Fähigkeiten bestehender Figuren.'
    : 'Die Ausbildung trennt die Grundform auf Stufe 1–6, die freie Vertiefung auf Stufe 7–8 und wählbare Expertenpfade ab Stufe 9. Jeder Pfad besitzt ein dauerhaftes Thema mit gestaffelten Passivmerkmalen; zusätzliche Pfade teilen sich weiterhin das Attackenbudget.';
}

export function renderTrainingNextSteps(plan) {
  if (plan.classId === 'derwyn') return `<aside class="cenyr-pending-training"><h3>Weitere geistliche Ausbildung</h3><p>Die vier Waffenformen sind im Charakterbogen auswählbar. Die gewählte Grundausbildung und alle Pfade teilen sich das vorhandene Lernbudget.</p>${plan.pendingFeatures.length ? `<ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)}</li>`).join('')}</ul>` : ''}<p>Wassermagie, Heilung und Rituale werden gesondert erlernt. Die Waffenformen gewähren keine zusätzlichen Zauber.</p></aside>`;
  if (!['vennyr', 'aldrimar'].includes(plan.cultureId)) return `<aside class="cenyr-pending-training"><h3>Weitere Ausbildung</h3><p>Im Charakterbogen werden gewählte Attacken an verdiente Ausbildungsplätze gebunden. Die verfügbaren Pfade richten sich nach Klasse und Stufe; jede Technik behält ihre Waffenbedingungen und Kosten.</p>${plan.pendingFeatures.length ? `<ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)} <span>· weitere Ausarbeitung offen</span></li>`).join('')}</ul>` : ''}</aside>`;
  return `<aside class="cenyr-pending-training"><h3>Nächste Ausarbeitung</h3>${plan.pendingFeatures.length ? `<ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)}</li>`).join('')}</ul>` : ''}<p>Waffenfolgen, Boni und Slots sind als Vorschlag ausgearbeitet. Ihre Vergabe an konkrete Figuren und die abschließende Kampferprobung folgen in einem eigenen Schritt.</p>${plan.classId === 'derwyn' ? '<p>Vorgemerkt: Wassermagie und Wiederherstellung nach dem gewünschten Morrowind-/Elder-Scrolls-Vorbild. Die Waffenfolgen hier verursachen ausschließlich physischen Schaden und gewähren noch keine Zauber.</p>' : ''}</aside>`;
}
