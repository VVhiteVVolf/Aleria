import {goldmundContext} from '../../Kontinente/modules/goldmund/goldmund-context.mjs?v=goldmund-20261026-7';
import {escapeHtml as e} from './proposal-render.mjs?v=20261026-7';

export function renderGoldmundContext() {
 const {lineage,ancientRealm,sections}=goldmundContext;
 return `<div class="context-heading"><div><p class="eyebrow">Herkunft · Kaiserliches Erbe · Gegenwart</p><h2>Ein goldener Schwan.<br>Drei verwandte Völker.</h2><p class="section-intro">${e(goldmundContext.introduction)}</p></div><figure class="ancient-emblem"><a href="assets/production/${ancientRealm.emblemId}.png" target="_blank" rel="noopener"><img src="assets/history/${ancientRealm.emblemId}.webp" width="360" height="360" alt="Antikes Wappen Órneachs mit goldenem Schwan" loading="lazy"></a><figcaption><span>${e(ancientRealm.type)}</span><strong>${e(ancientRealm.name)}</strong><p>${e(ancientRealm.description)}</p></figcaption></figure></div>
 <div class="origin-tree" aria-label="Herkunft der Alwener, Aldinger und Blutstädter"><div class="origin-root"><span>Albischer Ursprung</span><strong>${e(lineage.origin)}</strong><span aria-hidden="true">↓</span><strong>${e(lineage.successor)}</strong></div><p class="origin-fork">Später aufgespalten in drei Volksgruppen</p><ol class="origin-branches">${lineage.branches.map(branch=>`<li><strong>${e(branch.people)}</strong><span>${e(branch.country)}</span><small>${e(branch.label)}</small></li>`).join('')}</ol></div>
 <div class="context-articles">${sections.map(section=>`<article class="context-article" id="kontext-${e(section.id)}"><h3>${e(section.title)}</h3>${section.paragraphs.map(paragraph=>`<p>${e(paragraph)}</p>`).join('')}</article>`).join('')}</div>`;
}
