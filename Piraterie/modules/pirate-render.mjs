import { PIRATES, GREAT_PIRATES, pirateById, pirateChildren } from '../../shared/coastal-history/pirates.mjs';
import { sourceParagraphs, coastalSource } from '../../shared/coastal-history/coastal-sources.mjs';
import { recordShell, recordHref, recordSourceBook, recordParagraphs, escapeRecordText as e } from '../../shared/coastal-history/record-render.mjs';
import { coastalArt } from '../../shared/coastal-history/art.mjs';

export function pirateFacts(entry) {
  return [['Einordnung', entry.tier === 'great' ? 'Großpiraten · eigenständige Gruppierung' : entry.rank],
    ['Übergeordnete Gruppe', entry.parentId ? pirateById(entry.parentId).name : 'Eine der vier Großpiraten'],
    ['Führung', entry.leader || (entry.id === 'schwarzblut-marodeure' ? 'Keine gemeinsame zentrale Führung' : 'Noch nicht überliefert')],
    ['Revier', entry.area || 'Noch nicht ausgearbeitet'],
    ...(entry.ships ? [['Leitheach 1733', `${entry.ships} Schiffe · ${entry.crew[0]}–${entry.crew[1]} Besatzungsmitglieder`]] : []),
    ['Datenstand', 'Vorbereitet · fehlende Angaben bleiben offen']];
}
export function pirateIndexList(entries, file, faction = false) {
  return `<ul class="record-index">${entries.map(entry => `<li><a href="${recordHref(file, faction ? entry.factionHref : entry.profileHref)}"><img src="${recordHref(file, entry.symbol)}" alt="Wappen ${e(entry.name)}" loading="lazy"><span><strong>${e(entry.name)}</strong><small>${e(entry.leader ? `Kapitän ${entry.leader}` : entry.rank || 'Großpiraten')} · ${pirateChildren(entry.id).length ? `${pirateChildren(entry.id).length} benannte Unterbanden` : 'Vorbereitete Akte'}</small></span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul>`;
}
export function pirateProse(entry) {
  if (!['coastal-10', 'coastal-11', 'coastal-12', 'coastal-13', 'coastal-14'].includes(entry.sourceId)) return '<h2 id="ueberlieferung">Stand der Überlieferung</h2><p class="record-gap">Einführung, Geschichte, Einflussbereich und Vorgehensweise sind in der Vorlage noch nicht ausgearbeitet. Führung, Stützpunkte, Mitglieder und Patrongötter bleiben offen.</p>';
  const sections = entry.sourceId === 'coastal-14' ? [['Das Kollektiv', [4]]] : [['Herkunft und Geschichte', [6]], ['Einflussbereich', [8]], ['Vorgehensweise', [10]], ['Die Besatzung', [13]]];
  return sections.map(([title, indices], index) => `<section id="bericht-${index}"><h2>${e(title)}</h2>${recordParagraphs(sourceParagraphs(entry.sourceId, indices))}</section>`).join('');
}
export function renderPirateProfile(entry, { faction = false } = {}) {
  const file = faction ? entry.factionHref : entry.profileHref;
  const href = target => recordHref(file, target);
  const children = pirateChildren(entry.id);
  const links = `<p class="record-footnote"><a href="${href(entry.moduleHref)}">Almanach-Modul öffnen</a><br><a href="${href(faction ? entry.profileHref : entry.factionHref)}">${faction ? 'Zur Bandenakte' : 'Zur vorbereiteten Fraktions-/Gildenseite'}</a>${entry.parentId ? `<br><a href="${href(pirateById(entry.parentId).profileHref)}">Zum Dachverband</a>` : ''}</p>`;
  const content = `${links}${pirateProse(entry)}<h2 id="gliederung">${entry.tier === 'great' ? 'Banden und Gliederung' : 'Zugehörigkeit'}</h2>${entry.tier === 'great' ? children.length ? pirateIndexList(children, file, faction) : '<p class="record-gap">Es sind noch keine eigenständig benannten Unterbanden überliefert. Die leere Vorlage „Bande des Königs der See“ wird nicht als tatsächliche weitere Bande angelegt.</p>' : `<p>Die Bande wird unter <a href="${href(pirateById(entry.parentId).profileHref)}">${e(pirateById(entry.parentId).name)}</a> geführt. Diese Einordnung beschreibt die belegte Zugehörigkeit; sie begründet bei den Schwarzblut-Marodeuren keine zentrale Befehlsgewalt.</p>`}${entry.ships ? `<h2 id="leitheach">Der Raubzug 1733</h2><p>Die angegebene Stärke bezieht sich auf den <a href="${href('Ereignisse/Kriege/raubzug-durch-leitheach/index.html')}">Raubzug durch Leitheach</a>. Sie ist keine gesicherte zeitlose Gesamtstärke der Bande.</p><p><a href="${href('Ereignisse/Kriege/raubzug-durch-leitheach/dun-laog.html')}">Zum Angriff auf Dun Laog</a></p>` : ''}${recordSourceBook(coastalSource(entry.sourceId), file)}`;
  return recordShell({ file, title: entry.name, subtitle: faction ? 'Vorbereitete Fraktions- und Gildenakte' : entry.parentId ? pirateById(entry.parentId).name : 'Die vier Großpiraten', period: entry.ships ? 'Belegter Einsatz 1733' : 'Datierung offen', type: faction ? 'Fraktionen · Piraten' : 'Piraterie · Piratenbanden', image: entry.image, contain: !entry.image.includes('/coastal-history/'), imageNote: entry.imageNote, lead: entry.summary, facts: pirateFacts(entry), content, navigation: `<a href="#gliederung">Gliederung</a><a href="#quellen">Quellenbuch</a><a href="${href('Piraterie/index.html')}">Alle Piratenbanden</a>` });
}
export function renderPiracyIndex() {
  const file = 'Piraterie/index.html';
  const content = `<h2 id="grosspiraten">Die vier Großpiraten</h2><p>Blutsegel Marodeure, Klauen des Leviathan, Schwarzblut Marodeure und Sirenenzahn stehen auf derselben Gliederungsebene. Benannte Unterbanden sind jeweils ihrer Großpiraten-Gruppierung zugeordnet.</p>${pirateIndexList(GREAT_PIRATES, file)}<h2 id="banden">Alle benannten Banden</h2>${GREAT_PIRATES.map(entry => `<h3><a href="${recordHref(file, entry.profileHref)}">${e(entry.name)}</a></h3>${pirateChildren(entry.id).length ? pirateIndexList(pirateChildren(entry.id), file) : '<p class="record-gap">Noch keine benannten Unterbanden.</p>'}`).join('')}<h2 id="ereignisse">In den Chroniken</h2><p><a href="${recordHref(file, 'Ereignisse/Kriege/raubzug-durch-leitheach/index.html')}">Der Raubzug durch Leitheach · Winter 1733</a></p><p>Jede Bandenakte verlinkt ihr vorbereitetes Almanach-Modul und die entsprechende Fraktionsseite. Fehlende Namen, Stützpunkte oder Biografien bleiben offen.</p>`;
  return recordShell({ file, title: 'Piraterie', subtitle: 'Banden, Bündnisse und Küstenchroniken', period: 'Vorbereiteter Almanach-Bereich', type: 'Alerias Almanach', image: coastalArt('raubzug-leitheach-1733'), imageNote: 'Symbolisches Szenenbild einer winterlichen Piratenflotte.', lead: 'Die vier Großpiraten und ihre überlieferten Banden: ein Verzeichnis der Namen, Reviere und bekannten Taten. Die Akten verbinden den Almanach mit Fraktionsseiten und Ereignissen.', facts: [['Großpiraten', 'Vier · auf derselben Ebene'], ['Benannte Einträge', `${PIRATES.length} Gruppierungen und Banden`], ['Schwarzblut', 'Neun benannte Unterbanden'], ['Material', 'Originalvorlagen lokal gesichert'], ['Ausarbeitung', 'Vorbereitet; keine erfundenen Ergänzungen']], content, navigation: '<a href="#grosspiraten">Die vier Großpiraten</a><a href="#banden">Unterbanden</a><a href="#ereignisse">Ereignisse</a>' });
}
