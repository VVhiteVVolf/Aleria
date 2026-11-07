import { LAND_FAMILIEN_ROSTER } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { TIRFELYN_FAMILY } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/tirfelyn-family.js';
import { HELFAEN_FAMILY } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/helfaen-family.js';
import { MARCHWERN_FAMILY } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/marchwern-family.js';
import { LANDFAMILIEN_PLACES, landfamilienSceneImage, landfamilienSection } from './landfamilien-places.mjs';
import { buildLandfamilienHierarchy } from './landfamilien-hierarchy.mjs';
import { buildLandfamilienBiography } from './landfamilien-biography.mjs';

const familyBySlug = { tirfelyn: TIRFELYN_FAMILY, helfaen: HELFAEN_FAMILY, marchwern: MARCHWERN_FAMILY };
const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const sceneImage = (slug, room) => ({ image: landfamilienSceneImage(slug, room), imageWidth: 34,
  imageTall: true, imageFit: 'cover', imagePosition: 'center' });

function buildHouseholdScene(place, room, title, text) {
  return {
    schemaVersion: 1, pageTitle: title, commentThreadKey: `${place.slug}-szene-${room}`, ...sceneImage(place.slug, room),
    sessionPage: true, sessionIntro: paragraphs([text]), sessionHint: `Ein Besuch bei der Familie am ${place.title}.`,
    sessionEmptyTitle: 'Hier kann eine Begegnung beginnen',
    sessionEmptyText: 'Eine Ankunft, eine Frage oder ein Gespräch im gemeinsamen Alltag.',
    sessionDateAleria: { year: null, month: null, day: null }
  };
}

export function buildLandfamilienModule(place) {
  const household = LAND_FAMILIEN_ROSTER.families.find(family => family.slug === place.slug);
  const family = familyBySlug[place.slug];
  if (!household || !family) throw new Error(`Familienquelle fehlt: ${place.slug}`);
  const living = household.persons.filter(person => person.status === 'alive');
  const familySource = `../Stammb%C3%A4ume/Stammbaum.html?family=${household.familyId}&mode=view`;
  const symbol = `/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/fleischsammler/haus-${place.slug}.png`;
  return {
    id: place.id, title: place.title, subtitle: place.summary, type: place.type, category: 'Bannkreis Gwynthor',
    symbol, icon: '⌂', stamp: place.title,
    image: landfamilienSceneImage(place.slug, 'aussen'), previewImage: landfamilienSceneImage(place.slug, 'aussen'),
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: living.filter(person => person.resident).map(person => family.persons.find(member => member.id === person.id)?.worldPersonId).filter(Boolean),
    pages: [
      { schemaVersion: 1, pageTitle: place.title, commentThreadKey: `${place.slug}-ueberblick`, ...sceneImage(place.slug, 'aussen'),
        description: paragraphs(place.description), stats: [
          ['Ort', `${place.title} · Bannkreis Gwynthor`], ['Familie', family.document.title],
          ['Lebende Angehörige', String(living.length)], ['Lebensunterhalt', place.activities.join(' · ')],
          ['Lage', 'Östlicher Bannkreis von Gwynthor']
        ] },
      { schemaVersion: 1, pageTitle: 'Hierarchie · Betrieb und Familienrollen', commentThreadKey: `${place.slug}-hierarchie`,
        hierarchyPage: true, hierarchy: buildLandfamilienHierarchy(place, household) },
      buildLandfamilienBiography(place, household, family),
      { schemaVersion: 1, pageTitle: `${family.document.title} · Stammbaum`, commentThreadKey: `${place.slug}-stammbaum`,
        familyTreePage: true, familyTree: { familyId: household.familyId, source: familySource, title: family.document.title,
          height: 760, intro: 'Die Überlieferung beginnt mit unbekannten Gründern, dem Familienwappen und einem Zeitsprung. Danach folgt die heutige Familie mit ihren Beziehungen.' } },
      buildHouseholdScene(place, 'aussen', `${place.title} · Draußen`, place.exterior),
      buildHouseholdScene(place, 'wohnstube', 'Die Wohnstube', place.room)
    ]
  };
}

export function buildLandfamilienEntries() {
  return LANDFAMILIEN_PLACES.map(buildLandfamilienModule);
}

export function buildLandfamilienRegistrations() {
  return LANDFAMILIEN_PLACES.map(place => {
    const section = landfamilienSection(place);
    return { tab: section.tab, path: section.path, description: section.desc, icon: section.icon, entry: buildLandfamilienModule(place) };
  });
}
