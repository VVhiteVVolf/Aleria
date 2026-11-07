import { landfamilienSceneImage } from './landfamilien-places.mjs';

const familyLink = slug => `../Stammb%C3%A4ume/Stammbaum.html?family=haus-${slug}&mode=view`;

function householdMember(person, slug) {
  return {
    title: person.name, subtitle: `${person.role} · ${person.age} Jahre`, portrait: person.portrait,
    text: `<p>${person.bio}</p><p><a href="${familyLink(slug)}&amp;person=${person.id}" target="_blank" rel="noopener">Zur Person im Stammbaum</a></p>`
  };
}

export function buildLandfamilienHierarchy(place, household) {
  const living = household.persons.filter(person => person.status === 'alive');
  const groups = place.groups.map(([id, label]) => ({ id, label,
    people: living.filter(person => person.workGroup === id) })).filter(group => group.people.length);
  const unassigned = living.filter(person => !groups.some(group => group.people.includes(person)));
  if (unassigned.length) throw new Error(`Unzugeordnete Betriebsrollen in ${place.slug}: ${unassigned.map(person => person.id).join(', ')}`);
  const leadershipId = groups.some(group => group.id === 'leitung') ? 'leitung' : '';
  return {
    organizationTitle: place.hierarchyTitle, eyebrow: `Familie ${household.slug[0].toUpperCase()}${household.slug.slice(1)}`,
    subtitle: place.householdNote, centerLabel: place.title,
    emblem: `/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/fleischsammler/haus-${place.slug}.png`,
    sideImage: landfamilienSceneImage(place.slug, 'aussen'), motto: 'Arbeit und Familie',
    description: `<p>${place.hierarchyIntro}</p>`,
    detailsTitle: 'Der gemeinsame Alltag', details: [
      { label: 'Lebende Angehörige', value: String(living.length) },
      { label: 'Wohnort', value: `${place.title} · Bannkreis Gwynthor` },
      { label: 'Lebensunterhalt', value: place.activities.join(' · ') }
    ],
    chartTitle: 'Aufgaben und Verantwortung', chartIntro: 'Jede lebende Person erscheint einmal mit ihrer hauptsächlichen Aufgabe. Familienzugehörigkeit und Verwandtschaft zeigt der eigene Stammbaum.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 92,
    trees: groups.map(group => ({ id: group.id, label: group.label,
      parentTreeId: group.id === leadershipId ? '' : leadershipId,
      levels: [{ label: group.label, nodes: group.people.map(person => householdMember(person, place.slug)) }] })),
    levels: [], footerNote: 'Die Kinder sind Angehörige des Haushalts. Ihre altersgemäße Mithilfe ist von einer erwachsenen Arbeitsstelle getrennt.'
  };
}
