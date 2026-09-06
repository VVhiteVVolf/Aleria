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
  return `<section class="aldrimar-special-training" aria-labelledby="berserker-title"><p class="eyebrow">Skjaldr · entfesselte Raserei</p><h3 id="berserker-title">Berserkergang</h3>
    <p data-training-berserker role="status">Unter Stufe 6 noch nicht verfügbar.</p>
    <p><strong>Aktivierung:</strong> 1 Bonusaktion + 1 Reaktion und eine tägliche Anwendung. Ab Stufe 8 darf Aura-Fokus das Aktionskostenpaket ersetzen; die Anwendung bleibt erforderlich. Die Aktivierung enthält keinen Angriff.</p>
    <div class="cenyr-table-scroll" tabindex="0" aria-label="Berserker-Steigerungen"><table><caption>Höhere Stufen ersetzen die bisherigen Boni</caption><thead><tr><th>Stufe</th><th>Ausprägung</th><th>Kraft</th><th>Waffen-Zusatzschaden</th><th>RK</th><th>Temporäre LP</th><th>Täglich</th></tr></thead><tbody>${plan.berserkerTiers.map(tier => `<tr data-training-berserker-level="${tier.minimumLevel}"><th scope="row">${tier.minimumLevel}</th><td>${escape(tier.name)}</td><td>+${tier.strength}</td><td>+${escape(tier.weaponDamage.replace('d', 'W'))}</td><td>${tier.armorClass}</td><td>${tier.hitDice}W12 + KON</td><td>${tier.uses}</td></tr>`).join('')}</tbody></table></div>
    <p>Kraft erhöht auch den Attributsmodifikator für kraftbasierte Angriffe, Schaden, Proben und Rettungswürfe. Der Zusatzwürfel gilt für Waffen und Waffentechniken, nicht für Zauber. Ausdrücklich schwache Folgeangriffe ohne vererbte Boni behalten ihre Begrenzung.</p>
    <p><strong>Ungebrochener Berserker:</strong> Einmal je Aktivierung bleibt die Figur bei einem sonst tödlichen Treffer auf 1 LP. Danach ist dieser Schutz verbraucht. Temporäre LP werden beim Aktivieren gewürfelt; es gilt der höhere vorhandene Wert, ohne Addition.</p>
    <p>Der Gang endet bei Kampfende oder nach einem eigenen Gesamtbeitrag ohne Angriff und ohne seit dem vorigen Beitrag erlittenen Schaden. Ein Fehlschlag zählt als Angriff; einzelne Abschnitte sind keine Runden. Der Aktivierungsbeitrag wird noch nicht als vollständiger Ruhebeitrag gezählt. Ein laufender Gang kann nicht erneut aktiviert werden.</p>
    <details><summary>Zornkappe · Berserkerpilz</summary><p>Über „Konsumieren“ im Kommentar: ein Pilz +2 Schaden / −2 RK; zwei +4 / −4; drei +8 / −8. Der Trefferwurf bleibt unverändert. Der Rausch endet mit dem Kampf, ist auf drei Pilze begrenzt und gewährt weder Kraft noch temporäre LP oder Rettung bei 0 LP. Er kann zusätzlich zum Berserkergang wirken.</p></details>
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
