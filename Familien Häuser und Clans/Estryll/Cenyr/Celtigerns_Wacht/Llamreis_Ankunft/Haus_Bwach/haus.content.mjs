import { HOUSE_BWACH_FAMILY as family } from '../../../../../../Stammbäume/assets/js/data/house-bwach-family.js';
import { BWACH_WARRIOR, CADWGAN_FAMILY_EMBLEM, CADWGAN_NAME, CADWGAN_PORTRAIT } from '../../../../../../AleriaAlmanach/modules/schwarze-zitteraale/sumpfnattern-people.mjs';

const overview = family.document.description;
const history = 'Im Familienwappen zertritt ein heller Geißbock eine grüne Natter. Die Hausfarben sind Weinrot, Elfenbein und Dunkelgrün.';
const familyTree = 'Der Stammbaum führt über das unbekannte Gründerpaar und eine Überlieferungslücke zu Cadwgan Bwach.';

export const HOUSE_CONTENT = {
  id: family.document.id, name: family.document.title, type: 'Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  registerPage: true, biographySourceRevision: 1, contentVersion: '20261124-bwach-v1',
  showMotto: false, omitMilitaryProfile: true, familyTreeCompact: true,
  hierarchy: [
    ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
    ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'], ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'],
    ['Ehemalige Herrschaft', 'Gwaulwyn', 'gwaulwyn'], ['Haus', 'Haus Bwach', 'haus-bwach']
  ].map(([type, name, slug]) => ({ type, name, slug })),
  profile: { rank: 'Ausgestoßen', houseType: 'Ehemaliges Herrscherhaus von Gwaulwyn', origin: 'Gwaulwyn' },
  images: { crest: CADWGAN_FAMILY_EMBLEM, scene: BWACH_WARRIOR, sceneAlt: 'Historische Rüstung des Hauses Bwach' },
  illustrationCategory: 'Überlieferte Hausrüstung',
  sections: { overview, history, familyTree },
  biographySummary: { overview, history },
  founder: null, heads: [], heirs: [], offices: [], cadets: [], allies: [],
  figures: [{ id: 'cadwgan-bwach', familyId: 'haus-bwach', name: CADWGAN_NAME,
    role: 'Die Grüne Natter', image: CADWGAN_PORTRAIT }],
  relatedRecords: [{ title: 'Die Sumpfnattern', text: 'Almanachakte der Gruppe um Cadwgan Bwach.',
    link: '../AleriaAlmanach/AleriaAlmanach.html?entry=zitteraale-gruppe-ii' }]
};
