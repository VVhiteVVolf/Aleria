import { courtPage, escapeHtml, kingdomPath, extraHead } from './court-context.mjs';
import { renderSections, facts } from './content-template.mjs';

export function renderBiography(monarch,monarchs) {
  const sections=monarch.sections.filter(s=>s.blocks.length);
  const index=monarchs.indexOf(monarch);
  const neighbours=[monarchs[index-1],monarchs[index+1]].filter(Boolean);
  return courtPage({
    title:monarch.name,subtitle:monarch.role+' · '+monarch.reign,page:'biography',iconSrc:monarch.portrait,extraHead,
    description:`${monarch.personName} · ${monarch.role} von Aldrimar. Die überlieferte Lebensgeschichte und Herrschaft.`,
    navigation:[['ueberblick','Überblick'],...sections.map(s=>[s.id,s.title]),['quellenangaben','Überlieferte Stammdaten']],
    body:`<section class="court-intro" id="ueberblick">${monarch.quote?`<blockquote>${escapeHtml(monarch.quote)}</blockquote>`:''}
      ${facts([{label:'Name',value:monarch.personName},{label:'Regentschaft',value:monarch.reign},{label:'Geburt',value:monarch.birth},{label:'Tod',value:monarch.death||'Nicht verstorben'}])}
      <p><a href="${escapeHtml(monarch.href)}">${escapeHtml(monarch.personName)} im vorhandenen Stammbaum öffnen ↗</a></p>
      ${monarch.sourceNote?`<p class="court-source-note">${escapeHtml(monarch.sourceNote)}</p>`:''}</section>
      ${renderSections(sections)}
      <section class="court-section" id="quellenangaben"><details class="aldrimar-details"><summary>Stammdaten der alten Biografie</summary><p class="court-source-note">Diese ergänzenden Angaben stammen aus der gelieferten Biografie. Abweichungen von den vorhandenen Familienakten sind möglich; die aktuelle Familienstruktur steht im verlinkten Stammbaum.</p>${facts(monarch.sourceFacts)}</details></section>
      <nav class="aldrimar-neighbours" aria-label="Weitere Herrscher"><a href="${escapeHtml(kingdomPath+'kronfolge.html')}">← Zur Königslinie</a>${neighbours.map(m=>`<a href="${escapeHtml(kingdomPath+m.page)}">${escapeHtml(m.name)} →</a>`).join('')}</nav>`,
  });
}
