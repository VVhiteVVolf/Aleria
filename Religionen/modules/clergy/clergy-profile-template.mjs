import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';
import { entryPagePath, entrySymbolPath } from '../content/content-repository.mjs';
import { renderShell } from '../book-shell/book-shell-template.mjs';
import { CLERGY_INDEX, CLERGY_PRESENCE, clergyPagePath, clergyArt } from './clergy-repository.mjs';
import { renderCasteRanks } from './clergy-hierarchy-template.mjs';
import { renderFaculties } from './clergy-faculty-template.mjs';

function renderArt(clergy,profile,caste,link,godTitle) {
  const art = clergyArt(clergy,profile,caste);
  if (!art) return '';
  const image = `<img src="${link(art.src)}" alt="${art.placeholder ? 'Platzhalter: ' : ''}${h(caste.title)} im Glauben an ${h(godTitle)}" width="${art.width}" height="${art.height}" loading="lazy" decoding="async">`;
  const caption = art.placeholder ? 'Platzhalter · Das Bildnis der Asketen folgt.' : caste.id === 'gelaeuterte' ? 'Bußgänger während ihres verpflichtenden Dienstes' : caste.title;
  return `<figure class="clergy-caste-art${art.placeholder ? ' is-placeholder' : ''}">${art.placeholder ? image : `<a href="${link(art.src)}" data-clergy-image-link target="_blank" rel="noopener" aria-label="${h(caste.title)}: vollständiges Bild öffnen">${image}</a>`}<figcaption>${h(caption)}${art.placeholder ? '' : '<small>Bild in voller Größe öffnen ↗</small>'}</figcaption></figure>`;
}

function renderCastePanel(clergy,catalog,profile,caste,link) {
  const role = profile.castes[caste.id];
  const facultyOnly = caste.id === 'magister' && role.presence === 'angebunden';
  const portrait = renderArt(clergy,profile,caste,link,catalog.entries.find(god => god.id === profile.godId).title);
  return `<section class="clergy-panel" id="${h(caste.id)}" data-caste-panel="${h(caste.id)}" aria-labelledby="heading-${h(caste.id)}"><div class="clergy-panel-heading"><div><p class="eyebrow">${h(caste.number)} · ${h(caste.motto)}</p><h2 id="heading-${h(caste.id)}">${h(role.title)}</h2></div><span class="clergy-presence${role.presence === 'fest' ? '' : ' is-special'}">${h(CLERGY_PRESENCE[role.presence])}</span></div>
    <div class="clergy-caste-layout${portrait ? '' : ' has-no-portrait'}"><div class="clergy-caste-copy">${role.paragraphs.map(text => `<p>${h(text)}</p>`).join('')}<h3>${caste.id === 'asketen' && !portrait ? 'Mögliche Aufgaben einzelner Asketen' : 'Aufgaben im Dienst'}</h3><ul class="clergy-tasks">${role.tasks.map(task => `<li>${h(task)}</li>`).join('')}</ul>
    ${role.guilds ? `<section class="clergy-guilds" aria-labelledby="guild-title"><p class="eyebrow">Nur innerhalb der monastischen Gemeinschaft</p><h3 id="guild-title">Die Zünfte dieses Konvents</h3>${role.guilds.map(guild => `<article><h4>${h(guild.name)}</h4><p>${h(guild.work)}</p></article>`).join('')}</section>` : ''}
    ${caste.id === 'gelaeuterte' ? `<div class="penitence-states"><div><span>I</span><h3>Bußgänger</h3><p>Eid und Schweigegelübde; individuell vereinbarter Dienst innerhalb der Kirche.</p></div><div><span>II</span><h3>Geläuterter</h3><p>Bußgang vollendet, von den Bußpflichten und Gelübden befreit. Rückkehr als freier Mensch in die Gesellschaft.</p></div></div>` : ''}
    ${facultyOnly ? renderFaculties(clergy,catalog,link,{compact:true}) : ''}
    <details class="clergy-caste-doctrine"><summary>Berufung & Lebensform</summary>${caste.paragraphs.map(text => `<p>${h(text)}</p>`).join('')}</details>${renderCasteRanks(caste)}
    </div>${portrait}</div></section>`;
}

export function renderClergyProfile(clergy,catalog,profile) {
  const god = catalog.entries.find(item => item.id === profile.godId);
  const outputPath = clergyPagePath(god.id);
  const link = pageLinkFrom(outputPath);
  const group = catalog.collections.find(item => item.id === clergy.collectionId).groups.find(item => item.id === god.groupId);
  const siblings = clergy.profiles.filter(item => catalog.entries.find(god => god.id === item.godId).groupId === god.groupId);
  const sidebar = `<aside class="chapter-register clergy-profile-register" aria-label="Klerusnavigation"><div class="register-sticky"><a class="register-heading" href="${link(CLERGY_INDEX)}"><span aria-hidden="true">←</span> Der Alerische Klerus</a><p class="eyebrow">${h(group.label)}</p><nav aria-label="Klerus weiterer Gottheiten">${siblings.map(item => {const sibling=catalog.entries.find(god=>god.id===item.godId);return `<a href="${link(clergyPagePath(item.godId))}"${item.godId===god.id?' aria-current="page"':''}>${h(sibling.title)}</a>`;}).join('')}</nav><a class="back-to-top" href="${link(CLERGY_INDEX)}#hierarchie">Die Hierarchien ↗</a><a class="back-to-top" href="${link(CLERGY_INDEX)}#magisterium">Das Magisterium ↗</a></div></aside>`;
  const main = `<div class="clergy-profile" data-clergy-profile><nav class="breadcrumbs" aria-label="Brotkrumennavigation"><a href="${link('Religionen/index.html')}">Religionen</a><span>/</span><a href="${link(CLERGY_INDEX)}">Alerischer Klerus</a><span>/</span><span aria-current="page">${h(god.title)}</span></nav>
    <header class="clergy-god-cover"><div><p class="eyebrow">${h(god.epithet)} · Die Berufungen im Glauben</p><h1><span>Der Klerus</span>${h(god.title)}</h1><p>${h(profile.intro)}</p><a class="clergy-god-lore" href="${link(entryPagePath(god))}">Zur Überlieferung von ${h(god.title)} ↗</a></div><img src="${link(entrySymbolPath(god))}" alt="Das Zeichen von ${h(god.title)}" width="150" height="150"></header>
    <nav class="clergy-caste-tabs" data-role="caste-tabs" aria-label="Kasten vergleichen">${clergy.castes.map(caste=>`<a href="#${h(caste.id)}" id="tab-${h(caste.id)}" data-caste="${h(caste.id)}"><span>${h(caste.number)}</span>${h(caste.title)}</a>`).join('')}</nav><p class="clergy-switch-hint" data-role="switch-hint" hidden>Wählt eine Berufung, um ihren Dienst, ihre Lebensform und ihre Ordnung zu erkunden.</p>
    ${clergy.castes.map(caste=>renderCastePanel(clergy,catalog,profile,caste,link)).join('')}
    <section class="clergy-local-community"><p class="eyebrow">Das gemeinsame Haus</p><h2>Wie die Kasten zusammenwirken</h2><p>${h(profile.community)}</p><a href="${link(CLERGY_INDEX)}#gemeinschaft">Kirchliche Gemeinschaften & besondere Häuser ↗</a></section></div>`;
  return renderShell({outputPath,title:`${god.title} · Alerischer Klerus`,description:profile.intro,main,sidebar,extraStyles:['Religionen/modules/clergy/clergy.css'],extraScripts:['Religionen/modules/clergy/clergy-controller.mjs']});
}
