import offices from './offices.source.json' with { type: 'json' };
import { courtPage, escapeHtml, paragraphs, icons, extraHead } from './court-context.mjs';
import { officeGroup, officeSearch } from '../kingdom-court/office-directory.mjs';

export function renderOfficesPage() {
  const count=offices.groups.reduce((n,g)=>n+g.offices.length,0);
  return courtPage({
    title:'Ämter & Rollen in Aldrimar',subtitle:'Clan, Herdfeuer & Hochkönig',page:'offices',
    iconSrc:icons.offices,extraHead,script:'offices-filter.js',
    description:'Die Aufgaben der Clan- und Ratsämter, der Herd- und Hofämter sowie die Titel, Ehrungen und Ächtungen Aldrimars.',
    navigation:[['uebersicht','Übersicht'],...offices.groups.map(g=>[g.id,g.title])],
    body:`<section class="court-intro" id="uebersicht"><blockquote>${escapeHtml(offices.quote)}<cite>Aldrimarischer Spruch</cite></blockquote><h2>Clan und Herdfeuer</h2>${paragraphs(offices.intro)}
      <dl class="court-insignia"><div><dt>König</dt><dd>Gold</dd></div><div><dt>Ranghoher Jarl</dt><dd>Silber</dd></div><div><dt>Kleinerer Clan</dt><dd>Bronze</dd></div><div><dt>Niederer Lord</dt><dd>Eisen</dd></div></dl></section>
      ${officeSearch(count,'Zum Beispiel Kriegsherr, Ratsskalde oder Herdwächter …')}
      <div id="aemter-verzeichnis" data-court-directory>${offices.groups.map(officeGroup).join('\n')}</div>
      <p class="court-empty" data-role="search-empty" hidden>Keine passenden Einträge gefunden. Versuche einen anderen Begriff oder setze die Suche zurück.</p>`,
  });
}
