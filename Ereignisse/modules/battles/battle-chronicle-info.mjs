import { WELLENRUH } from './wellenruh-data.mjs';
import { escapeEventText as e } from '../catalog/events-model.mjs';

export function renderBattleChronicleInfo(){
  return `<aside class="battle-reading-info" aria-labelledby="wellenruh-steckbrief"><div class="battle-reading-info-inner"><h3 id="wellenruh-steckbrief">Eintrag in die Chronik</h3><dl><div><dt>Datum</dt><dd>11. Himmelsbogen 1628</dd></div><div><dt>Ort</dt><dd>${e(WELLENRUH.location)}</dd></div><div><dt>Ergebnis</dt><dd>Sieg der Grünen</dd></div><div><dt>Unmittelbare Folge</dt><dd>Plünderung der Küsten Moortals</dd></div></dl><p>Die zweite offizielle Schlacht im Krieg – die erste Seeschlacht bei Wellenruh.</p>
  <table class="battle-reading-forces"><caption>Die Flotten</caption><thead><tr><th scope="col">Musterrolle</th>${WELLENRUH.sides.map(side=>`<th scope="col"><img src="../assets/battles/wellenruh/v2/widder-${side.id==='green'?'gruen':'rot'}.webp" width="38" height="38" alt="">${e(side.name)}</th>`).join('')}</tr></thead><tbody>${[
    ['Schiffe',side=>side.ships],['Krieger',side=>side.warriors],
    ['Schiffe verloren',side=>side.lostShips],['Gefallene',side=>side.losses]
  ].map(([label,value])=>`<tr><th scope="row">${label}</th>${WELLENRUH.sides.map(side=>`<td>${e(value(side))}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <nav class="battle-reading-sections" aria-label="Die Überlieferung"><span>In diesem Bericht</span><a href="#uebersicht">Übersicht</a><a href="#vorgeschichte">Vorgeschichte</a><a href="#flotten">Teilnehmer & Flotten</a><a href="#strategien">Die Kriegspläne</a><a href="#bericht">Schlachtbericht</a><a href="#folgen">Folgen</a><a href="#zweikampf">Hrolfr & Raveld</a><a href="#anmerkungen">Anmerkungen</a></nav></div></aside>`;
}
