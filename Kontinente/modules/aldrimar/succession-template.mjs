import { succession } from './succession-data.mjs';
import { courtPage, escapeHtml, kingdomPath, icons, extraHead } from './court-context.mjs';
import { renderSections } from './content-template.mjs';

function monarchEntry(monarch) {
  return `${monarch.id==='galmar-vaeren'?'<li class="court-timeline-gap"><span>1627–1647 · Krieg der Prätendenten</span></li>':''}
    <li class="court-monarch${monarch.current?' court-monarch-current':''}" id="${monarch.id}">
      <a class="court-monarch-link" href="${escapeHtml(kingdomPath+monarch.page)}">
        <img class="court-monarch-portrait" src="${escapeHtml(monarch.portrait)}" width="72" height="88" alt="" loading="lazy">
        <div class="court-monarch-name"><p class="court-label">${escapeHtml(monarch.role)} · ${monarch.familyId==='haus-wargh'?'Clan Wargh':'Clan Vaeren'}</p><h3>${escapeHtml(monarch.name)}</h3></div>
        <div class="court-monarch-reign"><span>Regentschaft</span><strong>${escapeHtml(monarch.reign)}</strong></div><span class="court-monarch-open">Biografie öffnen ↗</span>
      </a>
    </li>`;
}

export function renderSuccessionPage() {
  const sections=succession.sections.filter(s=>s.blocks.length);
  return courtPage({
    title:'Die Königslinie Aldrimars',subtitle:'Könige, Krieg und Thronbehüter',page:'succession',iconSrc:icons.succession,extraHead,
    description:'Die überlieferte Herrscherfolge von Clan Vaeren, Asger Warghs Regentschaft und das aldrimarische Erbrecht.',
    navigation:[['herrscher','Die Herrscherfolge'],...sections.map(s=>[s.id,s.title])],
    body:`<section class="court-intro" id="herrscher"><h2>Die Krone Aldrimars</h2><p class="court-source-note">Die frühe Chronik ist lückenhaft. Unbekannte Namen und Regierungszeiten bleiben offen; Asger Wargh wird als Thronbehüter geführt.</p>
      <ol class="court-timeline">${succession.earlyMonarchs.map(m=>`<li class="court-timeline-gap"><strong>${m.href?`<a href="${escapeHtml(m.href)}">${escapeHtml(m.name)}</a>`:escapeHtml(m.name)}</strong><p>${escapeHtml(m.reign)} · ${escapeHtml(m.note)}</p></li>`).join('')}${succession.monarchs.map(monarchEntry).join('\n')}</ol></section>
      ${renderSections(sections)}`,
  });
}
