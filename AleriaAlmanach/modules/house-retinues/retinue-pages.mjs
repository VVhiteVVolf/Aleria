export const ART = './public/assets/house-retinues';
export const ICONS = {
  command: '../IconOrdner/Organisationsicons/Militär.png',
  office: '../IconOrdner/Organisationsicons/Administration.png',
  oath: '../IconOrdner/Organisationsicons/Justiz.png',
  diplomacy: '../IconOrdner/Organisationsicons/Diplomatie.png',
  intelligence: '../IconOrdner/Organisationsicons/Spionage.png',
  inn: '../IconOrdner/Organisationsicons/Unterhaltung.png'
};
export const p = text => `<p>${text}</p>`;
export const copy = (source, start, end = start + 1) => source.blocks.slice(start, end).map(block => block.html.replaceAll('Melynwyrdd', 'Melynwyrrd')).join('\n');
export const story = (title, image, description, stats = []) => ({ pageTitle: title, image: `${ART}/${image}.png`, imageWidth: 38, imageFit: 'contain', imagePosition: 'center', imageTall: true, description, stats, commentSequence: [] });
export const level = (label, ...nodes) => ({ label, nodes });
export const tree = (id, parentTreeId, label, ...levels) => ({ id, parentTreeId, label, levels });
export function role(title, reportsTo, purpose, authority, icon = 'command', rank = false) {
  return { title, subtitle: rank ? 'Überlieferter Rang · Personenplatz offen' : 'Funktionsstelle · Personenplatz offen', portrait: ICONS[icon],
    text: `<strong>Unterstellung:</strong> ${reportsTo}.<br><strong>Aufgabe:</strong> ${purpose}<br><strong>Verantwortung:</strong> ${authority}` };
}
export function vacancy(title, reportsTo, purpose) {
  return { title: `Freier Platz · ${title}`, subtitle: 'Reserve für eine spätere Besetzung', portrait: '', text: `<strong>Unterstellung:</strong> ${reportsTo}.<br>${purpose} Der Platz legt weder eine Person noch eine bereits bestehende Einheit fest.` };
}
export function hierarchy(title, organization, emblem, intro, trees) {
  return { pageTitle: title, hierarchyPage: true, commentSequence: [], hierarchy: {
    layoutMode: 'vertical', treeDisplayMode: 'groups', cardFontScale: 100, portraitScale: 50, chartScale: 85,
    eyebrow: 'Ämter, Ränge & Unterstellungen', subtitle: organization, centerLabel: organization,
    emblem, sideImage: emblem, organizationTitle: organization, motto: 'Ränge · Fachämter · offene Stellen',
    description: p(intro), detailsTitle: 'Die Ordnung lesen', details: [
      { icon: 'I', label: 'Oben nach unten', value: 'Aufsicht → Leitung → Ausführung → Nachwuchs' },
      { icon: 'II', label: 'Seitenzweige', value: 'Fachstellen mit eigener Verantwortung' },
      { icon: 'III', label: 'Freie Plätze', value: 'Bewusst ohne Personenbesetzung' }
    ], chartTitle: title, chartIntro: 'Die verbundenen Teilbäume zeigen die Dienstwege. Jede Karte benennt zusätzlich ihre direkte Unterstellung. Ränge bezeichnen Stellung und Ausbildung; Fachämter bezeichnen einen Auftrag innerhalb dieser Ordnung.',
    trees, levels: trees[0].levels,
    footerNote: 'Rollenübersicht ohne Personenbiografien. Die überlieferten Ränge sind gekennzeichnet; die Fachstellen konkretisieren die Organisation. Freie Reserveplätze sind noch keine besetzten Ämter.'
  } };
}
export function finishModule({ id, title, tab, emblem, subtitle, pages }) {
  const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  return { id, title, subtitle, type: tab === 'Söldner' ? 'Söldnergilde' : 'Diebesgilde & Bande', category: `${tab} · ${title}`,
    symbol: emblem, image: emblem, icon: '✦', stamp: tab === 'Söldner' ? 'WACHE · SOLD · TREUE' : 'GELB · GRÜN · HAUSEHRE',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: pages.map((page, i) => ({ ...page, pageTitle: `${roman[i]}. — ${page.pageTitle}` })) };
}
