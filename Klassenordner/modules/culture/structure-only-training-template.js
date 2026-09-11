import { escapeClassHtml as escape } from '../pages/class-page-content.js';

function renderLevelPhase(row) {
  if (!row.phase) return 'Ausbildung offen';
  if (row.level !== row.phase.minimumLevel) return escape(row.phase.name);
  return row.phase.kind === 'pending'
    ? `${escape(row.phase.name)} werden geöffnet`
    : `${escape(row.phase.name)} beginnt`;
}

export function renderStructureOnlyTraining(plan) {
  const weapons = [...plan.weaponTraining.primary, ...plan.weaponTraining.secondary].join(' · ');
  return `<section class="cenyr-training class-chapter" id="ausbildungsplan" aria-labelledby="heading-ausbildungsplan">
    <div class="class-chapter-heading"><span aria-hidden="true">✦</span><h2 id="heading-ausbildungsplan">Ausbildung · Stufe 1–20</h2></div>
    <div class="cenyr-training-intro"><div><p class="eyebrow">${escape(plan.trainingFocus)}</p><h3>${escape(plan.focus)}</h3><p>Diese Klasse verwendet denselben technischen Seiten- und Ausbildungsrahmen wie die bereits ausgearbeiteten Kulturklassen. Der Rahmen hält Stufen, spätere Formen, Attacken, Pfadmerkmale und Charakterbogen-Anbindung bereit, ohne noch nicht entworfene Kampfregeln vorwegzunehmen.</p></div><span class="cenyr-plan-status">Struktur vorbereitet · Inhalte offen</span></div>
    <div class="cenyr-training-phases">${plan.trainingPhases.map(phase => `<article><span>Stufe ${phase.minimumLevel}–${phase.maximumLevel}</span><strong>${escape(phase.name)}</strong><small>${escape(phase.detail || 'Inhalt noch festzulegen')}</small></article>`).join('')}</div>
    <div class="cenyr-training-profile">
      <article><span>Systemstand</span><strong>Klassenbogen vorbereitet</strong><small>Keine Attacke, kein Bonus und keine Ressource wird automatisch vergeben.</small></article>
      <article><span>Waffenführung</span><strong>${escape(weapons)}</strong><small>${escape(plan.weaponTraining.note)}</small></article>
      <article><span>Kampfkunst</span><strong>Noch offen</strong><small>Formen, Pfade, Wahlrhythmus und Attackenslots werden später gemeinsam entworfen.</small></article>
    </div>
    <p class="cenyr-training-note">Die Stufen 1–20 sind als technische Hülle vorhanden. Bis zur inhaltlichen Ausarbeitung bleiben sämtliche Stufen kampfneutral und können weder im Archiv noch im Charakterbogen unbeabsichtigt Fähigkeiten freischalten.</p>
    <div class="cenyr-level-toolbar"><label data-training-controls hidden>Ausbildungsstand ansehen <select data-role="training-level">${plan.levels.map(row => `<option value="${row.level}">Stufe ${row.level}</option>`).join('')}</select></label><p data-role="training-summary" role="status" aria-live="polite">Stufe 1 · Ausbildungsinhalt offen</p></div>
    <details class="cenyr-level-table"><summary>Den vollständigen Stufenrahmen öffnen <span>1–20</span></summary><div class="cenyr-table-scroll" tabindex="0" aria-label="Stufenrahmen"><table><caption>Vorbereiteter Ausbildungsrahmen für ${escape(plan.name)}</caption><thead><tr><th scope="col">Stufe</th><th scope="col">Ausbildungsabschnitt</th><th scope="col">Klassenmerkmale</th></tr></thead><tbody>${plan.levels.map(row => `<tr data-training-row="${row.level}"${row.level === 1 ? ' aria-current="step"' : ''}><th scope="row">${row.level}</th><td>${renderLevelPhase(row)}</td><td>Noch nicht ausgearbeitet</td></tr>`).join('')}</tbody></table></div></details>
    <aside class="cenyr-pending-training"><h3>Nächste Ausarbeitung</h3><ul>${plan.pendingFeatures.map(feature => `<li>${escape(feature.name)} <span>· offen</span></li>`).join('')}</ul><p>Diese Bereiche werden später mit Formen, Attacken, Kosten, Pfadboni und Stufenfreigaben gefüllt.</p></aside>
  </section>`;
}
