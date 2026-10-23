import { WELLENRUH } from './wellenruh-data.mjs';
import { renderBattlePlayer } from './battle-player-render.mjs';
import { renderBattleChronicle } from './battle-chronicle-render.mjs';

const {year,month,day}=WELLENRUH.date;
const calendarHref=`../../AleriaAlmanach/kalender.html?year=${year}&month=${month}&date=${day}&event=${WELLENRUH.id}#kalender`;
export function renderWellenruhPage() {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#161c1c"><meta name="robots" content="noindex"><meta name="description" content="Die I. Seeschlacht bei Wellenruh, 11.04.1628: eine illustrierte Seekarte, sechs Schiffsmotive und die vollständige Schlachtüberlieferung."><title>Die I. Seeschlacht bei Wellenruh · Alerias Chronik</title><link rel="icon" href="../assets/icons/seeschlacht.png"><link rel="stylesheet" href="../modules/battles/battle-page.css"><link rel="stylesheet" href="../modules/battles/battle-player.css"><script type="module" src="../modules/battles/battle-page.mjs"></script></head>
<body class="battle-page"><a class="battle-skip" href="#chronik">Zur vollständigen Überlieferung</a><header class="battle-masthead"><a href="../index.html">← Alerias Chronik</a><span>Krieg der Prätendenten <i>1627–1647</i></span><nav aria-label="Einstiege"><a href="#chronik">Die Überlieferung</a><a href="${calendarHref}">Im Kalender ↗</a></nav><small>Experimentelle Fassung</small></header>
<main data-battle-page><div class="battle-titlebar"><div><p>Die I. Seeschlacht bei</p><h1>Wellenruh</h1></div><div class="battle-title-inscription"><span>11. Himmelsbogen 1628</span><p>„Die Mitte hält.<br>Die Flanken schließen sich.“</p><small>30 Schiffe gegen 27. Die Grünen gegen die Roten.</small></div></div>
${renderBattlePlayer()}
<div class="battle-chart-caption"><p>Eine eigene Seekarte. Sechs Schiffsmotive. 57 Schiffe, die sich einzeln durch das Gefecht bewegen.</p><a href="#schiffstypen">Die Schiffe ansehen ↓</a></div>
<section class="battle-ships-catalog" id="schiffstypen"><header><span>Aus der Flotte</span><h2>Unter fremden Segeln.</h2><p>Sechs eigens gezeichnete Motive für vier unterschiedliche Schiffsrollen.</p></header><div>${[
  ['gruen-flaggschiff','Das grüne Flaggschiff','Führung & Enterkampf'],['rot-flaggschiff','Das rote Flaggschiff','Ravelds letzte Stellung'],['gruen-enterschiff','Schweres Enterschiff','Breiter Rumpf, schwere Besatzung'],['rot-bogenschiff','Bogenschiff','Fernkampf vom offenen Deck'],['gruen-langschiff','Leichtes grünes Langschiff','Bewegliche Flanken'],['rot-langschiff','Leichtes rotes Langschiff','Flankenverband & Rückzug']
].map(([file,name,role])=>`<figure><img src="../assets/battles/wellenruh/v2/${file}.webp" width="160" height="160" loading="lazy" alt="${name}"><figcaption><strong>${name}</strong><span>${role}</span></figcaption></figure>`).join('')}</div><p class="battle-source-note">Die überlieferte Flottenstärke bleibt erhalten. Die genaue Verteilung der dargestellten Bauarten ist gestalterische Rekonstruktion.</p></section>
${renderBattleChronicle()}
<a class="battle-calendar-link" href="${calendarHref}"><span>Ein fester Tag in Alerias Geschichte</span><strong>11. Himmelsbogen 1628</strong><small>Den Kalendereintrag öffnen ↗</small></a></main>
<footer class="battle-footer"><a href="../index.html#kapitel-schlachten">Zurück zur Schlachtenchronik</a><p>Die I. Seeschlacht bei Wellenruh</p><span>Experimentelles Themenfeld · nicht veröffentlicht</span></footer></body></html>\n`;
}
