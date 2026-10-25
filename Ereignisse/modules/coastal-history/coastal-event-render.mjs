import { recordShell, recordHref, recordSourceBook, recordParagraphs, escapeRecordText as e } from '../../../shared/coastal-history/record-render.mjs';
import { coastalSource } from '../../../shared/coastal-history/coastal-sources.mjs';
import { coastalArt } from '../../../shared/coastal-history/art.mjs';
import { VENNYR, VENNYR_FIGURES, LEITHEACH, LEITHEACH_INCIDENTS } from './coastal-events.mjs';
import { renderCoastalMap } from './coastal-map-render.mjs';
import { renderPirateDialogs } from './coastal-pirate-dialogs.mjs';
import { renderRaidChronology, renderRaidIncidentTiming } from './coastal-chronology-render.mjs';

function portraits(file) {
  return `<section id="personen"><h2>Vier Figuren im Jahr 1720</h2><p>Die drei genealogisch belegten Altersangaben beziehen sich auf das Jahr 1720. Die genaue Jahreszeit ist nicht bekannt. Die Bilder ersetzen keine historischen Porträtquellen.</p><div class="record-portraits">${VENNYR_FIGURES.map(figure => `<figure><img src="${recordHref(file, coastalArt(`${figure.id}-1720`))}" alt="${e(figure.name)} · ${e(figure.note)}" loading="lazy" width="1024" height="1536"><figcaption><strong>${e(figure.name)}</strong>${e(figure.role)}<small>${e(figure.note)}</small>${figure.family ? `<a href="${recordHref(file, `Stammbäume/Stammbaum.html?family=${figure.family}&person=${figure.person}`)}">Stammbaum und Lebensdaten ↗</a>` : ''}</figcaption></figure>`).join('')}</div></section>`;
}
function timeline(event) {
  if (event === LEITHEACH) return renderRaidChronology(event.file);
  const groups = ['1717', '1718', '1719', '1720'];
  let year = groups[0];
  const entries = event.timeline.map(item => { if (groups.includes(item.time)) year = item.time; return { ...item, year }; });
  return `<section id="chronologie"><h2>Der Verlauf des Krieges</h2><p class="record-footnote">Die Reihenfolge innerhalb eines Jahres folgt der Vorlage; genaue Tages- und Monatsdaten sind nicht überliefert.</p>${groups.map(group => {
    const rows = entries.filter(item => item.year === group);
    return `<h3>${group}</h3>${rows.length ? `<ol class="record-timeline">${rows.map(item => `<li>${item.time && !groups.includes(item.time) ? `<time>${e(item.time)}</time>` : ''}${e(item.text)}</li>`).join('')}</ol>` : '<p class="record-gap">Für dieses Jahr sind in der Vorlage noch keine konkreten Ereignisse ausgearbeitet.</p>'}`;
  }).join('')}</section>`;
}
export function incidentIndex(file) {
  return `<section id="einzelberichte"><h2>Die sieben Einzelberichte</h2><ol class="record-index">${LEITHEACH_INCIDENTS.map((entry, index) => `<li><a href="${recordHref(file, entry.file)}"><span class="record-number">${index + 1}</span><img src="${recordHref(file, coastalArt(entry.id))}" alt="Szenenbild ${e(entry.title)}" loading="lazy"><span><strong>${e(entry.title)}</strong><small>${e(entry.time)} · ${e(entry.location)} · vorbereiteter Bericht</small></span></a></li>`).join('')}</ol></section>`;
}
function campaignContent(event) {
  const sections = event.sections.map((section, index) => `<section id="abschnitt-${index}"><h2>${e(section.title)}</h2>${recordParagraphs(section.paragraphs)}</section>`).join('');
  if (event === VENNYR) return `${portraits(event.file)}${sections}${timeline(event)}<h2 id="nachwirkung">Was aus Vennyr wurde</h2><p>Nach der Eroberung wird Vennyr als Fjordheim neu geordnet. Ketill Draca wird unter dem Hochkönig des Nordens zum ersten Reik erhoben. Er ist damit nicht selbst der Hochkönig des Hohen Nordens.</p><p>Die überlieferten Zuweisungen und Umbenennungen stehen vollständig in der Chronologie und im Quellenbuch. Die Flucht nach Cenyr und die Taten der Schwarzblut-Banden gehören zur Invasion von 1720; der <a href="${recordHref(event.file, LEITHEACH.file)}">Raubzug durch Leitheach 1733</a> bleibt ein eigenständiges späteres Ereignis.</p>`;
  return `${renderCoastalMap(event.file)}${incidentIndex(event.file)}${renderPirateDialogs(event.file)}${sections}${timeline(event)}<section id="zeugnis"><h2>Sieben Jahre später: eine Erinnerung</h2><p class="record-footnote">Fionnáns und Bradans Gespräch blickt aus dem Jahr 1740 auf 1733 zurück. Bradans Angabe „siebenunddreißig“ meint sein damaliges Alter. Die Szene wird nicht in den Raubzug versetzt.</p><blockquote class="record-witness">${recordParagraphs(event.witness)}</blockquote></section>`;
}
function incidentContent(event) {
  const index = LEITHEACH_INCIDENTS.indexOf(event);
  return `<p><a href="${recordHref(event.file, LEITHEACH.file)}">← Zum gesamten Raubzug durch Leitheach</a></p><h2 id="ueberblick">Was die Quellen festhalten</h2><p>${e(event.result)}. Die Angaben zu beteiligten Truppen und Verlusten sind im Quellenbuch überliefert.</p>${event.id === 'dun-laog' ? '<p>Anfangs stehen 920 Verteidiger bereit. Die später eintreffenden 1.000 Verstärkungen werden separat gezählt. Die Vorlage nennt 600–700 Verluste auf Verteidigerseite, hohe zivile Verluste und Entführungen sowie 200–300 Verluste bei den Angreifern; diese Zahlen werden nicht zusätzlich als Gesamtverluste des gesamten Raubzugs ausgegeben.</p>' : ''}${renderRaidIncidentTiming(event)}<h2 id="ausarbeitung">Weiterer Verlauf</h2><p class="record-gap">Der Einzelbericht ist noch nicht ausgearbeitet. Die leeren Phasen-, Folgen- und Triviafelder der Vorlage bleiben offen. Die Zusammenfassung stammt aus der übergeordneten Chronik; es werden keine zusätzlichen Manöver oder Personen ergänzt.</p>${event.id === 'dun-laog' ? renderPirateDialogs(event.file) : ''}<h2 id="karte">Der Ort im Raubzug</h2><p><a href="${recordHref(event.file, `${LEITHEACH.file}#kriegskarte`)}">Karte, Phasen und Entfernungsprüfung öffnen</a></p><nav class="record-dialog-links" aria-label="Voriger und nächster Bericht">${index > 0 ? `<a href="${recordHref(event.file, LEITHEACH_INCIDENTS[index - 1].file)}">← ${e(LEITHEACH_INCIDENTS[index - 1].title)}</a>` : ''}${index < 6 ? `<a href="${recordHref(event.file, LEITHEACH_INCIDENTS[index + 1].file)}">${e(LEITHEACH_INCIDENTS[index + 1].title)} →</a>` : ''}</nav>`;
}
export function renderCoastalEvent(event) {
  const campaign = event === VENNYR || event === LEITHEACH;
  const content = (campaign ? campaignContent(event) : incidentContent(event)) + recordSourceBook(coastalSource(event.sourceId), event.file);
  const navigation = event === VENNYR ? '<a href="#personen">Die vier Figuren · 1720</a><a href="#abschnitt-0">Hintergrund & Ursachen</a><a href="#chronologie">Kriegsverlauf 1717–1720</a>' : event === LEITHEACH ? '<a href="#kriegskarte">Karte & Phasen</a><a href="#einzelberichte">Sieben Einzelberichte</a><a href="#piraten">Die Piratenbanden</a><a href="#chronologie">Zeitlicher Verlauf</a><a href="#zeugnis">Erinnerung aus 1740</a>' : '<a href="#ueberblick">Überlieferung</a><a href="#ausarbeitung">Ausarbeitung</a><a href="#karte">Karte & Nachbarereignisse</a>';
  return recordShell({ ...event, image: coastalArt(event.imageId), imageNote: 'Illustrative Rekonstruktion nach der Chronik; kein historisch vermessenes Ortsbild.', content, navigation: `${navigation}<a href="#quellen">Quellenbuch</a>` });
}
