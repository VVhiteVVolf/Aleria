import { createCourtRenderer } from '../kingdom-court/page-template.mjs';
export { escapeHtml, paragraphs } from '../kingdom-court/page-template.mjs';

export const kingdomPath = '/Kontinente/Estryll/Königreich Aldrimar/';
export const courtPage = createCourtRenderer({
  kingdom: 'Aldrimar', assets: '/Kontinente/modules/kingdom-court',
  home: kingdomPath+'Königreich von Aldrimar.html',
  bodyClass: 'kingdom-court aldrimar-page',
  buildSource: 'Kontinente/scripts/build-aldrimar.mjs. Quellen: Kontinente/docs/aldrimar/',
  styleVersion: '20261020', scriptVersion: '20261020',
  tabs: [
    { id: 'kingdom', href: kingdomPath+'Königreich von Aldrimar.html', label: 'Das Königreich' },
    { id: 'offices', href: kingdomPath+'aemter.html', label: 'Ämter & Rollen' },
    { id: 'succession', href: kingdomPath+'kronfolge.html', label: 'Königslinie' },
  ],
  familyLink: { href: '/Stammbäume/Stammbaum.html?family=haus-vaeren&mode=view', label: 'Clan Vaeren im Stammbaum' },
});

export const extraHead = `<link rel="stylesheet" href="/Kontinente/modules/aldrimar/aldrimar.css?v=20261020">`;
export const icons = Object.freeze({
  offices: '/Kontinente/modules/cenyr-court/assets/aemter.png',
  succession: '/Kontinente/modules/cenyr-court/assets/kronfolge.png',
});
