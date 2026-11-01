import { createLandingPage, normalizeLandingData } from './landing-model.js';
import { normalizeGroupLandingState } from './group-landing-model.js';
import { collectGroupRoster, groupNameKey, isNamedGroupPerson } from './group-landing-roster.js';

export function migrateGroupLandingEntry(entry, { tab = '' } = {}) {
  const pages = entry?.pages;
  if (!Array.isArray(pages) || !pages.length) return entry;
  const existingIndex = pages.findIndex(page => page.landingPage && page.landing?.group);
  if (tab !== 'Gruppen' && existingIndex < 0) return entry;
  const hierarchyIndex = pages.findIndex(page => page.hierarchyPage);
  const landingIndex = existingIndex >= 0 ? existingIndex : pages.findIndex(page => page.landingPage);
  if (existingIndex >= 0 && (hierarchyIndex < 0 || existingIndex === hierarchyIndex + 1)) return entry;
  // Capture positional comment keys before inserting or moving a page. Existing
  // scene threads and mechanical histories must continue to address their page.
  const anchoredPages = pages.map((page, index) => ({ ...page, commentThreadKey: page.commentThreadKey || String(index) }));
  const sourcePage = landingIndex >= 0 ? anchoredPages[landingIndex] : createLandingPage('Gruppenübersicht');
  const landing = normalizeLandingData(sourcePage.landing || {});
  if (!landing.group) {
    landing.mapDisplay = 'embed';
    const roster = collectGroupRoster(entry);
    const legacy = landing.members.filter(member => isNamedGroupPerson(member.name));
    const legacyByName = new Map(legacy.map(member => [groupNameKey(member.name), member]));
    const migratedIds = new Map(roster.filter(member => legacyByName.has(groupNameKey(member.name)))
      .map(member => [legacyByName.get(groupNameKey(member.name)).id, member.id]));
    landing.quests = landing.quests.map(quest => ({ ...quest, ownerMemberId: migratedIds.get(quest.ownerMemberId) || quest.ownerMemberId }));
    landing.notes = landing.notes.map(note => ({ ...note, authorId: migratedIds.get(note.authorId) || note.authorId }));
    landing.group = normalizeGroupLandingState({
      members: roster.filter(member => legacyByName.has(groupNameKey(member.name))).map(member => ({ id: member.id, assignment: 'active', characterId: legacyByName.get(groupNameKey(member.name)).characterId })),
      guests: legacy.filter(member => !roster.some(person => groupNameKey(person.name) === groupNameKey(member.name))).map(member => ({ ...member, assignment: 'active', temporary: false }))
    });
    landing.title = entry.title;
    landing.subtitle = entry.subtitle && !/^(?:untertitel|\.\.\.)$/i.test(entry.subtitle.trim()) ? entry.subtitle : 'Mannschaft, Reisegruppe und aktuelle Lage';
    landing.bannerImage ||= entry.symbol || pages[hierarchyIndex]?.hierarchy?.emblem || entry.image || '';
  }
  let key = sourcePage.commentThreadKey || 'group-overview';
  const usedKeys = new Set(anchoredPages.filter((_, index) => index !== landingIndex).map(page => page.commentThreadKey));
  while (usedKeys.has(key)) key += '-group';
  const page = { ...sourcePage, commentThreadKey: key, pageTitle: 'Gruppenübersicht', landingPage: true, landing };
  const nextPages = anchoredPages.filter((_, index) => index !== landingIndex);
  const afterHierarchy = nextPages.findIndex(item => item.hierarchyPage);
  nextPages.splice(afterHierarchy >= 0 ? afterHierarchy + 1 : Math.min(1, nextPages.length), 0, page);
  return { ...entry, multipage: true, pages: nextPages };
}
