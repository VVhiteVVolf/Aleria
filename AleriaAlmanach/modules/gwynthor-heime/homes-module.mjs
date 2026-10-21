import { GWYNTHOR_HOUSEHOLDS, HOMES_ART } from './households.mjs';
import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { buildHouseholdBiographyPage } from './household-biographies.mjs';

export const HOMES_SECTION = { key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen', path: [...GWYNTHOR_CITY_PATH], desc: 'Orte und Wohnhäuser innerhalb Gwynthors.' };
const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const image = (home, id) => ({ image: `${HOMES_ART}/${home.slug}/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });

export function buildHomeModule(home) {
  const title = `Heim der ${home.surname}`;
  return {
    id: `heim-der-${home.slug}`, title, subtitle: home.summary, type: 'Privates Wohnhaus', category: `Gwynthor-Stadt · ${home.district}`,
    icon: '⌂', symbol: `${HOMES_ART}/${home.slug}/wappen.png`, image: `${HOMES_ART}/${home.slug}/aussenansicht.png`, previewImage: `${HOMES_ART}/${home.slug}/aussenansicht.png`,
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: home.people.map(person => person.worldPersonId),
    pages: [
      { schemaVersion: 1, pageTitle: title, commentThreadKey: `${home.slug}-heim`, ...image(home, 'aussenansicht'),
        description: paragraphs(home.story), stats: [['Ort', `Gwynthor-Stadt · ${home.district}`], ['Bewohner', home.people.map(p => `${p.name} (${p.age})`).join(' · ')],
          ['Lebensunterhalt', home.people.filter(p => !p.married && p.age >= 18 || p.workplaceModuleId).map(p => `${p.name}: ${p.role}`).join(' · ')],
          ['Haushalt', home.people.filter(p => p.role === 'Hausfrau').map(p => p.name).join(', ') || 'Gemeinsam nach den Arbeitsschichten'],
          ['Wohnverhältnis', 'Gepachtetes privates Wohnhaus'], ['Hauszeichen', home.crestDescription]] },
      buildHouseholdBiographyPage(home),
      { schemaVersion: 1, pageTitle: `Familie ${home.surname}`, commentThreadKey: `${home.slug}-familie`, familyTreePage: true,
        familyTree: { familyId: `haus-${home.slug}`, source: `../Stammb%C3%A4ume/Stammbaum.html?family=haus-${home.slug}&mode=view`,
          title: `Familie ${home.surname} · Ein kleiner Haushalt`, height: 640,
          intro: home.people.map(p => `${p.name}, ${p.age} Jahre, ${p.role.toLocaleLowerCase('de')}`).join(' · ') + '.' } },
      ...(home.pet ? [{ schemaVersion: 1, pageTitle: `${home.pet.name} · Der Familienhund`, commentThreadKey: `${home.slug}-hund`, ...image(home, home.pet.id),
        description: paragraphs([home.pet.bio, `<a href="${home.pet.bestiary}" target="_blank" rel="noopener">Bestiarium · ${home.pet.species}</a>`]),
        stats: [['Name', home.pet.name], ['Rasse', home.pet.species], ['Alter', `${home.pet.age} Jahre`], ['Zugehörigkeit', `Familie ${home.surname}`]] }] : []),
      { schemaVersion: 1, pageTitle: 'Die Wohnstube', commentThreadKey: `${home.slug}-wohnstube`, ...image(home, 'wohnstube'), sessionPage: true,
        sessionIntro: paragraphs([home.room]), sessionHint: 'Ein Besuch bei einer Gwynthorer Familie.',
        sessionEmptyTitle: 'Ein gewöhnlicher Tag zu Hause', sessionEmptyText: 'Ein Klopfen an der Tür, ein Gespräch am Herd oder eine Nachricht aus dem Viertel.',
        sessionDateAleria: { year: null, month: null, day: null } }
    ]
  };
}
export function buildGwynthorHomes() { return GWYNTHOR_HOUSEHOLDS.map(buildHomeModule); }
