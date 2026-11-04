// Leitheach presentation: reviewed prose and existing family facts stay separate.
import { createPreparedHouseContent } from './prepared-house-content.mjs';
import { applyReviewedHouseContent } from './reviewed-house-content.mjs';
import { preparedHouseSlug } from './prepared-house-facts.mjs';

const GEOGRAPHIC_TYPES = new Set(['Kontinent', 'Fürstentum', 'Oberherrschaft', 'Lehensherrschaft', 'Herrschaft', 'Sitz']);

export function createReviewedLeitheachHouseContent({ record, territory, image, contentVersion,
  sections = {}, biographySummary, trivia = [], prepared = false }) {
  const profile = record.family.document.houseProfile;
  if (profile.kingdom !== 'Leitheach' || !Array.isArray(territory.hierarchy)) {
    throw new Error(`Leitheach requires its own canonical geography: ${record.id}`);
  }
  const geographical = territory.hierarchy.filter(row => row.type !== 'Sammlung');
  if (!geographical.some(row => row.type === 'Fürstentum' && /Leitheach/.test(row.name))
    || geographical.some(row => !GEOGRAPHIC_TYPES.has(row.type))) {
    throw new Error(`Unexpected Leitheach territorial hierarchy: ${record.id}`);
  }
  const sept = profile.rankId === 'sept-head';
  const content = createPreparedHouseContent({ record, territory, image, contentVersion });
  content.type = sept ? 'Bürgerliches Haus' : 'Clan';
  content.countyLabel = 'Oberherrschaft';
  content.hierarchy = [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    ...geographical.map(row => ({ ...row })),
    ...(profile.seat && !geographical.some(row => row.name === profile.seat)
      ? [{ type: 'Sitz', name: profile.seat, slug: preparedHouseSlug(profile.seat) }] : []),
    { type: sept ? 'Sept' : 'Clan', name: record.title, slug: record.id }
  ];
  content.profile.houseType = sept ? 'Bürgerliches Sept' : 'Clan';
  content.sections.overview = content.sections.overview.replace(`in der Grafschaft ${profile.county}`, `in der Oberherrschaft ${profile.county}`);
  content.sections.knighthood = sept
    ? 'Das Sept gehört zum bürgerlichen Stand. Besondere Tätigkeiten und Hausbräuche sind bislang nicht näher überliefert.'
    : 'Besondere Überlieferungen zum Tiarnatum dieses Clans sind bislang nicht näher bekannt.';
  applyReviewedHouseContent(content, { record, sections, biographySummary, trivia, prepared });
  content.page = 'haus.html';
  content.registerPage = true;
  content.sectionTitles = { knighthood: sept ? '4. Beruf und Hausleben' : '4. Tiarnatum' };
  content.biographyIntroTitle = sept ? 'Über das Sept' : 'Über den Clan';
  content.headsTitle = sept ? 'Septoberhäupter' : 'Überlieferte Hausverwaltung';
  content.officesTitle = sept ? 'Angehörige und Aufgaben' : 'Hof und Aufgaben';
  content.illustrationCategory = sept ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung';
  content.images.sceneAlt = `Repräsentative ${sept ? 'Septdarstellung' : 'Clandarstellung'} · ${record.title}`;
  if (content.extinct) {
    // Historical administration does not imply that every descendant is dead.
    content.profile.houseType = 'Historische Hausverwaltung';
    content.extinctionText = 'Historische Hausverwaltung · erloschen';
    content.illustrationCategory = 'Historische Hausdarstellung';
    content.images.sceneAlt = `Historische Clandarstellung · ${record.title}`;
    content.sections.succession = 'Die frühere Hausverwaltung ist erloschen; eine heutige Amtsnachfolge besteht nicht.';
    content.sections.court = 'Die frühere Hausverwaltung besteht nicht mehr.';
    content.currentHead = '';
    content.firstHeir = '';
    content.heirs = [];
  }
  return content;
}
