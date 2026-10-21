import { kingdom } from './kingdom-data.mjs';
import { escapeHtml, kingdomPath, icons, extraHead } from './court-context.mjs';
import { renderBlocks } from './content-template.mjs';

const officeForArea=Object.freeze({militaer:'kriegsherr',klerus:'ratspriester',gerichtsbarkeit:'justiziar',finanzen:'kastellan',spionage:'schatten',diplomatie:'herold',magie:'ratsskalde',unterhaltung:'hofskalde'});

function entry(page,title,icon,hint) {
  return `<div class="kingdom-court-entry-slot"><a class="kingdom-court-entry" href="${escapeHtml(kingdomPath+page)}"><img src="${icon}" width="120" height="120" alt=""><span>${escapeHtml(title)}</span><span class="kingdom-court-entry-hint">${escapeHtml(hint)} →</span></a></div>`;
}

function organizations() {
  const rows = [...new Set(kingdom.organizations.map(o => o.group))].map(group => {
    const members = kingdom.organizations.filter(o => o.group === group);
    let html = `<tr><th class="codex-table-section" colspan="5" scope="colgroup">${escapeHtml(group)}</th></tr>`;
    for (let start = 0; start < members.length; start += 5) {
      const cells = Array.from({ length: 5 }, (_, index) => members[start + index]);
      html += `<tr>${cells.map(o => o ? `<th scope="col">${escapeHtml(o.name)}</th>` : '<td></td>').join('')}</tr>`;
      html += `<tr>${cells.map(o => o ? `<td><img src="${escapeHtml(o.imageSrc)}" width="110" height="110" alt="Symbol ${escapeHtml(o.name)}" loading="lazy"></td>` : '<td></td>').join('')}</tr>`;
    }
    return html;
  }).join('\n');
  return `<div class="kingdom-table-scroll" tabindex="0" role="region" aria-label="Gilden, Zünfte und Orden"><table class="kingdom-guild-table kingdom-reference-table"><tbody>${rows}</tbody></table></div>`;
}

function jarltumOverview() {
  const cells = render => kingdom.clans.map(clan => `<td>${render(clan)}</td>`).join('');
  return `<div class="kingdom-table-scroll" tabindex="0" role="region" aria-label="Jarltümer im Überblick"><table class="kingdom-region-table kingdom-reference-table"><tbody>
    <tr><th class="codex-table-section" colspan="5" scope="colgroup">Jarltümer</th></tr>
    <tr>${kingdom.clans.map(clan => `<th scope="col">${clan.territoryHref ? `<a href="${escapeHtml(clan.territoryHref)}">${escapeHtml(clan.jarltum)}</a>` : escapeHtml(clan.jarltum)}</th>`).join('')}</tr>
    <tr>${cells(clan => `<img src="${escapeHtml(clan.banner)}" width="110" height="110" loading="lazy" alt="Banner ${escapeHtml(clan.jarltum)}">`)}</tr>
    <tr>${cells(clan => `<strong>${escapeHtml(clan.seat)}</strong>`)}</tr>
    <tr><th class="codex-table-section" colspan="5" scope="colgroup">Herrschende Clans</th></tr>
    <tr>${cells(clan => `<a href="${escapeHtml(clan.href)}">${escapeHtml(clan.name)}</a>`)}</tr>
    <tr>${cells(clan => `<a href="${escapeHtml(clan.href)}"><img src="${escapeHtml(clan.imageSrc)}" width="110" height="110" loading="lazy" alt="Wappen ${escapeHtml(clan.name)}"></a>`)}</tr>
  </tbody></table></div>`;
}

function infobox() {
  return `<div class="kingdom-table-scroll"><table class="kingdom-infobox"><tbody>
    <tr><td colspan="2">Königreich Aldrimar</td></tr>
    <tr><td colspan="2"><a href="${escapeHtml(kingdom.mapImage)}" aria-label="Reichskarte von Aldrimar vergrößern"><img src="${escapeHtml(kingdom.mapImage)}" width="1163" height="763" alt="Übersichtskarte des Königreichs Aldrimar"></a></td></tr>
    ${kingdom.infobox.map(group => `<tr><td colspan="2">${escapeHtml(group.title)}</td></tr>${group.rows.map(row => `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`).join('')}`).join('\n')}
  </tbody></table></div>`;
}

export function renderKingdomPage(areas) {
  const order=['einfuhrung','geschichte','kultur','religion','politik','verwaltung','gesetze','geographie','institutionen','flora-fauna','ahnengalerie'];
  const sections=order.map(id=>kingdom.sections.find(s=>s.id===id)).filter(Boolean);
  function sectionBody(section) {
    let html=renderBlocks(section.blocks);
    if(section.id==='politik')html+=`<div data-aldrimar-council></div>${entry('aemter.html','Ämter & Rollen',icons.offices,'Das Verzeichnis öffnen')}<div data-aldrimar-clans></div><noscript><ul>${kingdom.clans.map(clan=>`<li><a href="${escapeHtml(clan.href)}">${escapeHtml(clan.name)}</a></li>`).join('')}</ul></noscript>`;
    if(section.id==='verwaltung')html=`<nav class="administration-grid" aria-label="Verwaltungsbereiche Aldrimars">${areas.map(area=>`<a class="administration-card" href="${escapeHtml(kingdomPath+'aemter.html#'+officeForArea[area.id])}"><img src="${area.imageSrc}" width="54" height="54" alt=""><strong>${escapeHtml(area.id==='magie'?'Magie & Skaldentum':area.name)}</strong><span>Amt & Aufgaben</span></a>`).join('')}</nav>`+html;
    if(section.id==='geographie')html+=jarltumOverview();
    if(section.id==='institutionen')html+=organizations();
    if(section.id==='ahnengalerie')html+=entry('kronfolge.html','Die Kronfolge Aldrimars',icons.succession,'Die Könige entdecken');
    return html;
  }
  const chapter = (section, index) => `<section aria-labelledby="${section.id}"><h2 class="kingdom-section-heading" id="${section.id}">${index + 1}.) ${escapeHtml(section.title)}</h2>${sectionBody(section)}</section>`;
  const toc = `<div class="kingdom-table-scroll kingdom-toc-scroll"><table class="kingdom-toc"><tbody><tr><td><p class="kingdom-toc-title">Inhalt</p><ol>${sections.map(section => `<li><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`).join('')}</ol></td></tr></tbody></table></div>`;
  return `<!doctype html>
<!-- Erzeugt durch Kontinente/scripts/build-aldrimar.mjs. Quellen: Kontinente/docs/aldrimar/ -->
<html lang="de"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Das Königreich Aldrimar - Aleria</title>
  <link rel="stylesheet" href="/Kontinente/assets/css/koenigreich.css?v=20261018d">
  <link rel="stylesheet" href="/Kontinente/modules/kingdom-court/court-entry.css?v=20261020">
  <link rel="stylesheet" href="/Kontinente/modules/administration/administration.css?v=20261020">
  ${extraHead}
  <link rel="stylesheet" href="/modules/world-codex/world-codex.css?v=20261018c">
  <script src="/Kontinente/kontinente.registry.js?v=aldrimar-20261020"></script>
  <script src="/Kontinente/assets/js/kontinente-loader.js?v=aldrimar-20261020" data-default-id="koenigreich-aldrimar"></script>
  <script type="module" src="/modules/world-codex/codex-navigation.mjs?v=20261018c"></script>
  <script type="module" src="/Kontinente/modules/aldrimar/kingdom-page.mjs?v=20261020b"></script>
</head><body class="world-codex">
<main class="kingdom-page" data-page-type="kingdom" data-kingdom="Aldrimar" data-kontinent-root data-orte-static-template data-default-id="koenigreich-aldrimar">
  <div class="kingdom-table-scroll"><table class="kingdom-frame" role="presentation">
    <caption class="kingdom-title" role="heading" aria-level="1"><span data-kontinent-title>Das Königreich von Aldrimar</span></caption>
    <tbody>
      <tr><td colspan="5"><div class="kingdom-crest-stage kingdom-crest-stage--solo"><img class="kingdom-main-crest" src="${escapeHtml(kingdom.banner)}" width="160" height="160" alt="Wappen des Königreichs Aldrimar"></div></td></tr>
      <tr><td class="kingdom-content-column" colspan="3">${toc}${sections.slice(0, 2).map(chapter).join('\n')}</td><td class="kingdom-sidebar-column" colspan="2">${infobox()}</td></tr>
      ${sections.slice(2).map((section, index) => `<tr><td colspan="5">${chapter(section, index + 2)}</td></tr>`).join('\n')}
    </tbody>
  </table></div>
</main>
</body></html>\n`;
}
