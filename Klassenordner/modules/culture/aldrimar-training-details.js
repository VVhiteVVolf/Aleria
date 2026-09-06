import { escapeClassHtml as escape } from '../pages/class-page-content.js';

const repertoireRules = {
  'freya-spottvers': 'Bei misslungenem WEI-Rettungswurf erhält das Ziel einen einmal gewürfelten Malus von 1W4 auf seinen nächsten Angriff; längstens bis zum Ende seines nächsten Gesamtbeitrags.',
  'freya-magische-hand': 'Bewegt kleine Gegenstände in Reichweite. Kein Schaden, keine automatische Entwaffnung und kein zusätzlicher Angriff.',
  'freya-kleine-illusion': 'Kleine Geräusche oder Trugbilder zur Ablenkung und Täuschung. Ihre Wirkung wird passend zur Szene beurteilt.',
  'freya-licht': 'Lässt einen Gegenstand leuchten; für Erkundung, Beleuchtung oder Signalgebung.',
  'freya-charm-person': 'Bei misslungenem WEI-Rettungswurf wird das Ziel vorübergehend wohlgesonnen. Feindseligkeit des Wirkenden oder seiner Verbündeten beendet den Einfluss.',
  'freya-calm-person': 'Bei misslungenem WEI-Rettungswurf wird das Ziel ruhiger und soll nicht aggressiv handeln. Schaden oder direkte Bedrohung bricht die Beruhigung.',
  'freya-enrage-person': 'Bei misslungenem WEI-Rettungswurf wird das Ziel zornig und richtet sich bevorzugt gegen den nächsten Gegner. Verhalten und Dauer werden in der Szene ausgewertet.',
  'freya-silence': 'Eine Zone in 9 m Reichweite wird still. Darin sind Sprache, Gesang und stimmbasierte Magie unterdrückt; Position und Dauer werden in der Szene geführt.',
  'freya-arkaner-schrei': 'Ein Kegel in 9 m Reichweite: pro gewähltem Gegner KON-Rettungswurf, bei Fehlschlag 3W6 Wucht, sonst kein Schaden. Der Wirkende erleidet einmal 1W6 Eigenschaden. Bei mehreren Einzelauflösungen wird dieser Eigenschaden nur einmal gewertet.'
};

function berserkerDetails(plan) {
  if (!plan.berserkerTiers) return '';
  return `<section class="aldrimar-special-training" aria-labelledby="berserker-title"><p class="eyebrow">Skjaldr · kontrollierte Raserei</p><h3 id="berserker-title">Berserkergang</h3>
    <p data-training-berserker role="status">Unter Stufe 6 noch nicht verfügbar.</p>
    <p><strong>Aktivierung:</strong> 1 Bonusaktion + 1 Reaktion und eine tägliche Anwendung. Ab Stufe 8 kann Aura-Fokus das ganze Aktionskostenpaket ersetzen; die begrenzte Anwendung bleibt erforderlich. Die Aktivierung enthält keinen Angriff.</p>
    <div class="cenyr-table-scroll" tabindex="0" aria-label="Berserker-Steigerungen"><table><caption>Eine höhere Stufe ersetzt die bisherige vollständig</caption><thead><tr><th>Stufe</th><th>Ausprägung</th><th>Angriff / Schaden</th><th>Temporäre LP</th><th>Gegen Furcht</th><th>Dauer / Anwendungen</th></tr></thead><tbody>${plan.berserkerTiers.map(tier => `<tr data-training-berserker-level="${tier.minimumLevel}"><th scope="row">${tier.minimumLevel}</th><td>${escape(tier.name)}</td><td>+${tier.attack} / +${tier.damage}</td><td>${tier.temporaryHitPoints}</td><td>+${tier.fearSave}</td><td>${tier.comments} eigene Beiträge / ${tier.uses} täglich</td></tr>`).join('')}</tbody></table></div>
    <p>Angriff und Schaden gelten ausschließlich für kraftbasierte Nahkampfangriffe, je einmal pro Technik; nicht erneut auf Folgeangriffe, Schüsse oder Zauber. In jeder Stufe gilt <strong>−1 RK</strong>. Temporäre LP entstehen nur beim Aktivieren, werden nicht addiert und enden mit dem Modus.</p>
    <p>Die Dauer zählt eigene Gesamtbeiträge, nicht einzelne Abschnitte. Der Gang endet bei Ablauf, Bewusstlosigkeit, bewusstem Abbruch oder Kampfende. Danach folgt ein eigener Beitrag <strong>Atemholen</strong> mit −1 Angriff; in dieser Zeit ist keine neue Aktivierung möglich. Verlängern durch wiederholtes Aktivieren ist ausgeschlossen.</p>
    <small>Ausbildungsentwurf: Voraussetzung, begrenzte Anwendungen und Ablauf sind strukturiert hinterlegt; bestehende persönliche Berserkerfähigkeiten werden bei der folgenden Figurenintegration abgeglichen.</small>
  </section>`;
}

function skaldDetails(plan) {
  const reference = plan.skaldReference;
  if (!reference) return '';
  return `<section class="aldrimar-special-training" aria-labelledby="skald-title"><p class="eyebrow">Kampfbarde · Grundrepertoire 1–5</p><h3 id="skald-title">Freyas Aufbau als Ausgangspunkt</h3>
    <p>Der Skalde verbindet Gesang und Unterstützung mit Waffenausbildung. Er eignet sich als Ergänzung zu einer Kämpferklasse. Eine spätere Kombination teilt die normalen Aktionspools; sie verdoppelt weder Lebenspunkte noch Mana. Die verbindlichen Mehrklassenregeln bleiben offen.</p>
    <p>Freyas Stand ist auf <strong>Stufe 5</strong> belegt. Die unten vorgeschlagene Verteilung auf Stufe 1–4 ordnet dieses vorhandene Repertoire. <strong>Stufe 6–20 bleibt offen</strong>: keine zusätzlichen Lieder, Pfadboni oder automatische Zauberskalierung.</p>
    <p>${reference.weapons.map(weapon => `${escape(weapon.name)} <strong>${escape(weapon.damageFormula.replaceAll('d', 'W'))}</strong>`).join(' · ')}. Freyas ${reference.manaExample} Mana sind ein Figurenbeispiel, kein fester Klassenpool. Persönlichkeit, Musikerinnen-Hintergrund und individuelle Vorteile werden nicht zur allgemeinen Klasseneigenschaft.</p>
    <details class="aldrimar-repertoire-disclosure"><summary>Grundrepertoire öffnen · acht Lieder und ein besonderer Schrei</summary><div class="aldrimar-repertoire">${reference.repertoire.map(entry => `<article data-training-repertoire-level="${entry.minimumLevel}"><div class="aldrimar-repertoire-title"><h4>${escape(entry.name)}</h4><span>Stufe ${entry.minimumLevel} · ${entry.spellLevel == null ? 'Besondere Fähigkeit' : `Zaubergrad ${entry.spellLevel}`}</span></div><p>${escape(entry.description)}</p><dl><div><dt>Kosten nach Freya</dt><dd>${entry.costs.map(cost => `${cost.amount} ${escape(cost.name)}`).join(' + ')}${entry.uses ? ` · ${entry.uses.maximum} Anwendung, Erholung manuell` : ''}</dd></div><div><dt>Reichweite</dt><dd>${escape(entry.range)}</dd></div></dl><p>${escape(repertoireRules[entry.sourceId] || entry.effect)}</p><small>${entry.automation === 'structured' ? 'Enthält bereits strukturierte Wirkungen in Freyas Bogen.' : 'Sonderwirkung bisher als Freitext; keine automatische Zustandssteuerung behauptet.'}</small></article>`).join('')}</div></details>
    <p>Der Arkane Schrei ist als bestehende, erschöpfende Sonderfähigkeit dokumentiert: 3W6 Wucht bei misslungenem KON-Rettungswurf, immer 1W6 Eigenschaden. Die 39 Mana und manuelle Erholung gehören zur konkreten Referenz. Eine allgemeine, dynamische Klassenfassung folgt später.</p>
  </section>`;
}

export function renderAldrimarTrainingDetails(plan) {
  if (plan.cultureId !== 'aldrimar') return '';
  return berserkerDetails(plan) + skaldDetails(plan);
}
