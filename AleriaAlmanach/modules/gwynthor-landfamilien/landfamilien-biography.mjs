import { LANDFAMILIEN_MAP_ID } from './landfamilien-places.mjs';

const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const familyLink = slug => `../Stammb%C3%A4ume/Stammbaum.html?family=haus-${slug}&mode=view`;

export function buildLandfamilienBiography(place, household, family) {
  const surname = family.document.title.replace(/^Familie\s+/, '');
  const primary = household.persons.filter(person => person.primary);
  if (primary.length !== 3) throw new Error(`Drei Hauptporträts erwartet: ${place.slug}`);
  const source = family.extensions.houseBiographyModule.house;
  const living = household.persons.filter(person => person.status === 'alive');
  const dead = household.persons.filter(person => person.status === 'dead');
  return {
    schemaVersion: 1, pageTitle: `Familie ${surname} · Hausbio`, commentThreadKey: `${place.slug}-hausbio`, biographyPage: true,
    image: primary[0].portrait, imageWidth: 31, imageTall: true, imageFit: 'contain', imagePosition: 'center',
    stats: [['Familie', surname], ['Stand', 'Bürgerliche Rheunwaith-Familie'], ['Wohnort', place.title],
      ['Lebende Angehörige', String(living.length)], ...(dead.length ? [['Verstorben', dead.map(person => `${person.name} · ${person.birth}–${person.death}`).join(' · ')]] : [])],
    biography: {
      portraitFit: 'contain', biographyTitle: source.biographyTitle || place.title,
      biographyText: source.biographyText, historyTitle: source.historyTitle || 'Die heutige Familie', historyText: source.historyText,
      worksTitle: 'Arbeit und Lebensunterhalt', works: source.works || place.activities,
      extraSections: [{ position: 'afterWorks', mode: 'text', title: 'Die Angehörigen',
        text: paragraphs(household.persons.map(person => `<strong>${person.name}</strong> (${person.age}${person.status === 'dead' ? `; † ${person.death}` : ''}) · ${person.role}. ${person.bio}`)) }],
      connectionsTitle: 'Drei Gesichter des Hauses',
      connections: primary.map(person => ({ type: 'connection', name: person.name,
        detail: `${person.role}. ${person.bio}`, image: person.portrait, imageFormat: 'portrait' })),
      documentsTitle: 'Familie, Haus und Ort', documents: [
        { title: `Der Stammbaum ${surname}`, text: 'Unbekannte Gründer, Wappen, Überlieferungssprung und heutige Familie.',
          icon: source.crestImage, link: familyLink(place.slug) },
        { title: `Die Hausseite ${surname}`, text: 'Gemeinsame Familiengeschichte und bestehende Hausakte.',
          icon: source.crestImage, link: `../Familien Häuser und Clans/kleinehaeuser.html?haus=haus-${place.slug}` },
        { title: place.title, text: 'Der bestehende Standort auf der Bannkreiskarte.', icon: source.crestImage,
          link: `../Karten/karte.html?map=${LANDFAMILIEN_MAP_ID}&pin=${place.pinId}` },
        ...place.connections.map(connection => ({ title: connection.name, text: connection.detail,
          icon: source.crestImage, link: connection.link || `../Stammb%C3%A4ume/Stammbaum.html?family=${connection.familyId}&mode=view` }))
      ], footer: `${place.title} · Bannkreis Gwynthor · Jahr 1740`
    }
  };
}
