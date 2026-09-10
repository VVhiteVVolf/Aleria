import { escapeHtml as h, pageLinkFrom } from '../content/content-html.mjs';
import { renderShell } from '../book-shell/book-shell-template.mjs';
import { renderCatalogTools, renderCatalogChapter, renderCatalogEmpty } from '../catalog/catalog-register-template.mjs';
import { CLERGY_INDEX, clergyPagePath } from './clergy-repository.mjs';
import { renderHierarchy } from './clergy-hierarchy-template.mjs';
import { renderFaculties } from './clergy-faculty-template.mjs';

export function clergyDirectoryEntries(clergy, catalog) {
  return clergy.profiles.map(profile => {
    const god = catalog.entries.find(entry => entry.id === profile.godId);
    return { ...god, chapterId: god.groupId, summary: profile.intro, canonicalHref: clergyPagePath(god.id), page:true,
      searchAliases: [...Object.values(profile.castes).flatMap(role => [role.title,...role.tasks]),...profile.castes.moenche.guilds.map(guild => `${guild.name} ${guild.work}`)] };
  });
}

function renderDirectory(clergy, catalog, link) {
  const collection = catalog.collections.find(item => item.id === clergy.collectionId);
  const chapters = collection.groups.map(group => ({...group,entries:group.entries.filter(path => clergy.deities.some(id => path.endsWith(`/${id}/eintrag.json`)))}));
  const entries = clergyDirectoryEntries(clergy,catalog);
  return `<section class="clergy-section" id="goetterklerus" aria-labelledby="clergy-directory-title"><p class="eyebrow">Die Berufungen im Dienst einer Gottheit</p><h2 id="clergy-directory-title">Welchem Gott gilt der Dienst?</h2><p class="clergy-section-intro">Öffnet ein Haus des Glaubens und vergleicht Priester, Mönche, Paladine, Asketen, Magister und den Weg der Büßenden. Auch die monastischen Zünfte lassen sich hier suchen.</p>
    <div data-religion-catalog>${renderCatalogTools(chapters,{searchLabel:'Klerus nach Gottheit oder monastischer Zunft durchsuchen',placeholder:'Gottheit, Berufung oder monastische Zunft …'})}<div id="catalog-chapters">${chapters.map(chapter => renderCatalogChapter(chapter,entries,link)).join('')}</div>${renderCatalogEmpty()}</div></section>`;
}

function renderOverviewCards(clergy) {
  return `<section class="clergy-section" id="kasten" aria-labelledby="castes-title"><p class="eyebrow">Verschiedene Wege des Glaubens</p><h2 id="castes-title">Die sechs Kasten</h2><p class="clergy-section-intro">Ihre Unterschiede liegen in der Berufung. Jede Kaste trägt eine eigene Aufgabe zum gemeinsamen Leben der Kirche bei.</p><div class="caste-overview">${clergy.castes.map(caste => `<article><span class="caste-numeral" aria-hidden="true">${h(caste.number)}</span><p class="eyebrow">${h(caste.motto)}</p><h3>${h(caste.title)}</h3><p>${h(caste.summary)}</p><details><summary>Berufung & Lebensform</summary>${caste.paragraphs.map(text => `<p>${h(text)}</p>`).join('')}</details></article>`).join('')}</div></section>`;
}

export function renderClergyDirectory(clergy,catalog) {
  const link = pageLinkFrom(CLERGY_INDEX);
  const overview = clergy.overview;
  const nav = [['kasten','Die sechs Kasten'],['goetterklerus','Klerus der Gottheiten'],['hierarchie','Hierarchien'],['magisterium','Das Magisterium'],['gemeinschaft','Gemeinsame Häuser'],['verstaendnis','Begriffe & Missverständnisse']];
  const main = `<div class="clergy-directory"><nav class="breadcrumbs" aria-label="Brotkrumennavigation"><a href="${link('Religionen/index.html')}">Religionen</a><span>/</span><a href="${link('Religionen/religionen/alerische-kirche/index.html')}">Die Alerische Kirche</a><span>/</span><span aria-current="page">Klerus</span></nav>
    <header class="clergy-cover"><div><p class="eyebrow">${h(clergy.subtitle)}</p><h1>${h(clergy.title)}</h1><p>Vom stillen Dienst im Kloster bis zur Leitung einer Landeskirche: die Menschen, Gemeinschaften und Berufungen im Glauben der Neun.</p><a class="ink-button" href="#goetterklerus">Die Häuser des Glaubens erkunden <span aria-hidden="true">↓</span></a></div><div class="clergy-triptych" aria-label="Priester, monastische Gemeinschaft und Paladin">${[['ordan_priest','Priester'],['mariel_monk','Mönche & Nonnen'],['baldran_paladin','Paladine']].map(([file,label]) => `<figure><img src="${link(`BilderRüstungen/${file}.png`)}" width="1024" height="1536" alt="${h(label)} im Dienst der Göttlichen"><figcaption>${h(label)}</figcaption></figure>`).join('')}</div></header>
    <div class="clergy-prologue">${overview.intro.map(text => `<p>${h(text)}</p>`).join('')}</div>
    <div class="book-layout"><aside class="chapter-register" aria-label="Klerusregister"><div class="register-sticky"><a class="register-heading" href="#anfang"><span aria-hidden="true">✧</span> Die sechs Berufungen</a><nav aria-label="Auf dieser Seite">${nav.map(([id,label],index) => `<a href="#${id}"><span class="chapter-numeral">${String(index+1).padStart(2,'0')}</span>${h(label)}</a>`).join('')}</nav><p class="clergy-register-note">Ein gemeinsamer Glaube.<br>Viele Formen des Dienstes.</p></div></aside><div class="book-content">
    ${renderOverviewCards(clergy)}${renderDirectory(clergy,catalog,link)}${renderHierarchy(clergy)}
    <section class="clergy-section" id="magisterium" aria-labelledby="faculty-title"><p class="eyebrow">Wissenschaft und persönliche Frömmigkeit</p><h2 id="faculty-title">${h(clergy.faculties.title)}</h2><p class="clergy-section-intro">${h(clergy.faculties.intro)}</p>${renderFaculties(clergy,catalog,link)}<p class="clergy-callout">${h(clergy.faculties.collaboration)}</p></section>
    <section class="clergy-section" id="gemeinschaft" aria-labelledby="community-title"><p class="eyebrow">Das Leben der Kirche</p><h2 id="community-title">${h(overview.cooperation.title)}</h2>${overview.cooperation.paragraphs.map(text => `<p>${h(text)}</p>`).join('')}<div class="clergy-house-grid">${overview.houses.map(house => `<article><h3>${h(house.title)}</h3><p>${h(house.text)}</p></article>`).join('')}</div><h3 class="clergy-subheading">Bekannte Gemeinschaften & Zweige</h3><div class="clergy-community-list">${overview.communities.map(item => `<details><summary>${h(item.title)}</summary><p>${h(item.text)}</p></details>`).join('')}</div></section>
    <section class="clergy-section" id="verstaendnis" aria-labelledby="meaning-title"><p class="eyebrow">Am Rande des Codex</p><h2 id="meaning-title">Was einen Kleriker ausmacht</h2><div class="clergy-clarifications">${overview.clarifications.map(item => `<article><h3>${h(item.title)}</h3><p>${h(item.text)}</p></article>`).join('')}</div></section>
    </div></div></div>`;
  return renderShell({outputPath:CLERGY_INDEX,title:clergy.title,description:'Der neue Alerische Klerus: sechs Kasten, eigene Hierarchien, monastische Zünfte und die Gemeinschaften der 19 Göttlichen.',main,catalog:true,extraStyles:['Religionen/modules/clergy/clergy.css']});
}
