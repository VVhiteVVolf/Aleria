import { createCourtRenderer } from '../kingdom-court/page-template.mjs';
export { escapeHtml, paragraphs } from '../kingdom-court/page-template.mjs';

export const COURT_ASSETS = '../../modules/cenyr-court';
export const KINGDOM_PAGE = 'Königreich von Cenyr.html';
export const courtPage = createCourtRenderer({
  kingdom: 'Cenyr', assets: COURT_ASSETS, home: KINGDOM_PAGE, bodyClass: 'cenyr-court',
  buildSource: 'Kontinente/scripts/build-cenyr-court.mjs. Quellen: modules/cenyr-court/',
  styleVersion: '20261020', scriptVersion: '20261020',
  tabs: [
    { id: 'offices', href: 'aemter.html', label: 'Ämter & Rollen' },
    { id: 'succession', href: 'kronfolge.html', label: 'Kronfolge' },
  ],
  familyLink: { href: '../../../Stammbäume/Stammbaum.html?family=haus-pendrag&mode=view', label: 'Haus Pendrag im Stammbaum' },
});
