import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
const articles=entries=>entries.map(x=>`<article><h3>${e(x.title)}</h3><p>${e(x.text)}</p></article>`).join('');
export function renderCountryContext(context){
 return `<section class="section" id="geschichte"><p class="eyebrow">Die überlieferte Geschichte</p><h2>Reich, Kirchenspaltung und Glaubensfrieden.</h2><div class="history-grid">${articles(context.history)}</div><div class="theme-grid">${articles(context.themes)}</div></section><section class="section" id="aemter"><p class="eyebrow">Reichsämter und Kirchenleitung</p><h2>Die benannten Ämter.</h2><p class="section-intro">Die weltlichen Ämter sind von der adeligen Rangfolge zu unterscheiden. Der Hochprimas führt die Konkordische Kirche.</p><div class="office-grid">${context.offices.map(x=>`<article><h3>${e(x.name)}</h3><p>${e(x.role)}</p></article>`).join('')}</div></section>`;
}
export function renderFaithContext(faith){
 return `<section class="section faith-section" id="glaube"><p class="eyebrow">${e(faith.formalName)}</p><h2>${e(faith.name)}</h2><p class="section-intro">${e(faith.introduction)}</p><div class="faith-groups">${faith.groups.map(group=>`<article><h3>${e(group.name)}</h3><p>${e(group.names.join(' · '))}</p></article>`).join('')}</div><div class="faith-copy">${articles(faith.sections)}</div><p class="source-navigation"><a href="../../Religionen/pantheons/neun-goettliche/" target="_blank" rel="noopener">Gemeinsamer Götterkreis im Religionsarchiv ↗</a> · <a href="../../Religionen/religionen/alerische-kirche/" target="_blank" rel="noopener">Die Alerische Kirche ↗</a></p></section>`;
}
export function renderOpenContext(context){
 return `<section class="section open-section" id="offen"><p class="eyebrow">Weitere Ausarbeitung</p><h2>Noch offen.</h2><ul>${context.open.map(x=>`<li>${e(x)}</li>`).join('')}</ul></section>`;
}
