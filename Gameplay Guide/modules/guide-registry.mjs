// Public, lightweight directory. Stable IDs link sheets, editorial files and URLs.
// Family names and territorial paths are resolved from the genealogy registry at build time.
export const GUIDE_REGISTRY = Object.freeze([
  { slug: 'ylva', characterId: 'bSYZYAEOwiRgy44f6OmO', worldPersonId: 'person--haus-wolfshorn--ylva-wolfshorn',
    displayName: 'Lady Ylva Bleiddorn / Wolfshorn', familyId: 'haus-bleiddorn', familyAliasIds: ['haus-wolfshorn'],
    editorialModule: 'ylva-guide.mjs', editorialExport: 'ylvaGuide', groupPaths: [] },
  { slug: 'gais', characterId: 'person--haus-wyrm--gais-wyrm', worldPersonId: 'person--haus-wyrm--gais-wyrm',
    displayName: 'Sir Gais Wyrm', familyId: 'haus-wyrm', familyAliasIds: [],
    editorialModule: 'gais-guide.mjs', editorialExport: 'gaisGuide', groupPaths: [] }
]);

export function findGuideRegistration(character = {}) {
  const ids = [character.id, character.identity?.worldPersonId, character.genealogy?.worldPersonId].filter(Boolean);
  return GUIDE_REGISTRY.find(entry => ids.includes(entry.characterId) || ids.includes(entry.worldPersonId));
}
