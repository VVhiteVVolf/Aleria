// Compose reviewed prose with canonical register facts without changing families.
import { createPreparedHouseContent } from './prepared-house-content.mjs';
import { applyReviewedHouseContent } from './reviewed-house-content.mjs';

const named = person => person?.name && !/Unbekannt|\?\?\?|Platzhalter/i.test(person.name);
const living = person => person.status === 'alive' && !person.death;

function attachCanonicalMembers(content, family) {
  const own = family.persons.filter(person => person.houseId === family.lineage.houseId && named(person));
  const card = (person, role) => ({ id: person.id, familyId: content.id, name: person.name, role,
    detail: person.title || '', image: person.portrait ? `../Stammbäume/${person.portrait}` : '',
    silhouette: person.sex === 'female' ? 'female' : 'male' });
  const heads = own.filter(person => person.lineageRole === 'head');
  const founder = own.find(person => /Gründer|Gründerin|Begründer|Begruender|Stammvater|Stammmutter/.test(person.title || ''));
  content.founder = founder ? card(founder, 'Begründung der Familie') : null;
  content.heads = heads.map(person => card(person, 'Überliefertes Oberhaupt'));
  content.heirs = content.extinct ? [] : own.filter(person => living(person) && /Erbe|Erbin|Erbfolge/.test(person.title || '')).map(person => card(person, 'Erbfolge'));
  const active = heads.filter(person => living(person) && !/vormals|ehemalig|Exil/i.test(person.title || ''));
  content.currentHead = !content.extinct && active.length === 1 ? active[0].name : '';
  content.firstHeir = content.heirs[0]?.name || '';
  content.sections.succession = content.extinct ? 'Die Familie ist erloschen.' : content.heirs.length
    ? `Die überlieferte Erbfolge nennt ${content.heirs.map(person => person.name).join(', ')}.`
    : 'Eine gesicherte Erbfolge ist bislang nicht näher überliefert.';
  content.sections.court = content.currentHead ? `${content.currentHead} führt ${content.name}.`
    : content.extinct ? 'Die Familie besitzt keine heutigen Amtsinhaber.' : 'Einzelne Amtsbesetzungen sind bislang nicht näher überliefert.';
}

function adaptAldrimarPresentation(content, record) {
  const profile = record.family.document.houseProfile;
  const culture = record.family.extensions.extinctCulture || '';
  content.countyLabel = 'Jarltum';
  content.page = ['jarl', 'thane'].includes(profile.rankId) ? 'haus.html' : 'kleinehaeuser.html';
  content.hierarchy = content.hierarchy.map(row => ({ ...row,
    type: row.type === 'Grafschaft' ? 'Jarltum' : /^Ausgestorbene/.test(row.name) ? 'Historischer Bestand'
      : /^(?:Norrnaigh|Glaennath|Aldrimarer)\s*\(|^Antike Crannath Clans$/.test(row.name) ? 'Kultur' : row.type }));
  content.sections.overview = content.sections.overview.replace(`in der Grafschaft ${profile.county}`, `im Jarltum ${profile.county}`);
  if (content.type === 'Clan') content.sectionTitles = { knighthood: ['Glaennath', 'Crannath'].includes(culture) ? '4. Kriegskunst' : '4. Huskarltum' };
  if (!content.extinct) return;
  // A culture folder in the tree remains a category, never a physical seat.
  const categoryOrUnknown = /^(?:(?:Ort )?unbekannt$|Ausgestorb|Erloschen|Antike|Norrnaigh(?:\s|$)|Glaennath(?:\s|$)|Crannath(?:\s|$)|Aldrimarer(?:\s|$))/i;
  content.profile.seat = [profile.seat, ...(profile.secondarySeats || [])]
    .find(place => place && !categoryOrUnknown.test(place)) || '';
  content.profile.origin = culture;
  content.profile.houseType = 'Ausgestorbener Clan';
  content.extinctionText = record.family.extensions.recentlyExtinct ? 'Ausgestorben · jüngst erloschen' : 'Ausgestorben · Zeitpunkt offen';
  content.illustrationCategory = 'Historische Hausdarstellung';
  content.images.sceneAlt = `Historische Darstellung · ${content.name}`;
}

export function createReviewedAldrimarHouseContent({ record, territory, image, contentVersion, sections = {},
  biographySummary, trivia = [], prepared = false }) {
  const content = createPreparedHouseContent({ record, territory, image, contentVersion });
  adaptAldrimarPresentation(content, record);
  applyReviewedHouseContent(content, { record, sections, biographySummary, trivia, prepared });
  attachCanonicalMembers(content, record.family);
  return content;
}
