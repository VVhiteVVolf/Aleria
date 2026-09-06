import { escapeClassHtml as escape } from '../pages/class-page-content.js';

export function renderPathFeatures(form) {
  if (!form.features?.length) return '';
  return `<section class="culture-path-features" aria-label="Pfadboni"><h4>Eigenschaften dieses Pfades</h4><ul>${form.features.map(feature => `<li data-training-feature-level="${feature.minimumLevel}"><strong>Stufe ${feature.minimumLevel} · ${escape(feature.name)}</strong><p>${escape(feature.description)}</p></li>`).join('')}</ul><p>Es gilt jeweils nur die höchste erlernte Stufe eines Merkmals. Die Wahl zusätzlicher Pfade erzeugt keine zusätzlichen Aktionen.</p></section>`;
}

export function renderCultureTrainingTools(plan) {
  if (!['vennyr', 'aldrimar'].includes(plan.cultureId)) return '';
  if (plan.skaldReference) return '<p class="culture-resource-summary" data-training-resources>Grundrepertoire bis Stufe 5; weitere Entwicklung offen.</p>';
  const weapons = [...new Set(plan.attackCatalog.map(attack => attack.weaponLabel))];
  return `<div class="culture-training-tools" data-training-controls hidden><label>Waffenweg <select data-role="training-weapon"><option value="">Alle Waffenwege</option>${weapons.map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('')}</select></label><label class="culture-training-toggle"><input type="checkbox" data-role="training-earned-only"> Nur Optionen bis zur gewählten Stufe</label></div>
    <p class="culture-resource-summary" data-training-resources>Besondere Aktionen 2 · Aura-Fokuspunkte 0 · Aktion 1 / Bonusaktion 1 / Reaktion 1</p>`;
}

export function trainingIntro(plan) {
  if (plan.cultureId === 'aldrimar') return plan.skaldReference
    ? 'Der Skalde ist ein Kampfbarde und möglicher Begleiter einer zweiten Klassenausbildung. Das Grundrepertoire folgt Freyas bestehendem Stand; Stufe 6–20 bleibt ausdrücklich offen.'
    : 'Die Huskarl-Waffenlehre verbindet nordische Standfestigkeit mit bewusster Führung von Klinge, Axt, Schild und Speer. Diese Klassenfolgen, Boni und Expertenpfade sind ein Ausbildungsentwurf für die spätere Vergabe an Figuren.';
  return plan.cultureId === 'vennyr'
    ? 'Der Sirenentanz verbindet die Disziplin des Drachentanzes mit fließenden Richtungswechseln und kurzen, schweren Einschlägen. Die folgenden Waffenfolgen, Klassenmerkmale und Pfadboni bilden einen vollständigen Ausbildungsentwurf; sie sind noch keine automatisch erlernten Fähigkeiten bestehender Figuren.'
    : 'Die Ausbildung trennt Grundform, Duellantenform und wählbare Expertenpfade. Der vollständige Attackenkatalog ist als prüfbarer Entwurf eingetragen; nur ausdrücklich bestätigte Attacken werden bereits an Charakterbögen vergeben.';
}

export function renderTrainingNextSteps(plan) {
  if (!['vennyr', 'aldrimar'].includes(plan.cultureId)) return `<aside class="cenyr-pending-training"><h3>Noch zu bestätigen</h3><ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)} <span>· redaktionelle oder technische Freigabe offen</span></li>`).join('')}</ul><p>Die entworfenen Attacken verändern bestehende Charakterbögen noch nicht. Nach der gemeinsamen Balanceprüfung werden sie über den Attackenwähler an freie Slots gebunden.</p></aside>`;
  return `<aside class="cenyr-pending-training"><h3>Nächste Ausarbeitung</h3>${plan.pendingFeatures.length ? `<ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)}</li>`).join('')}</ul>` : ''}<p>Waffenfolgen, Boni und Slots sind als Vorschlag ausgearbeitet. Ihre Vergabe an konkrete Figuren und die abschließende Kampferprobung folgen in einem eigenen Schritt.</p>${plan.classId === 'derwyn' ? '<p>Vorgemerkt: Wassermagie und Wiederherstellung nach dem gewünschten Morrowind-/Elder-Scrolls-Vorbild. Die Waffenfolgen hier verursachen ausschließlich physischen Schaden und gewähren noch keine Zauber.</p>' : ''}</aside>`;
}
