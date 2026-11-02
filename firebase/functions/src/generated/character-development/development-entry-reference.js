export function getDevelopmentTraitId(entry={}) {
  const explicit=String(entry.developmentTraitId||entry.id||'');
  if(/^development-trait-[a-z0-9-]+$/.test(explicit))return explicit;
  if(!String(entry.tags||'').includes('Charakterentwicklung'))return '';
  const path=String(entry.icon||'').replace(/^https?:\/\/[^/]+/,'');
  const match=path.match(/^\/AleriaAlmanach\/assets\/development-traits\/(?:web\/)?([a-z0-9-]+)\.(?:png|webp)$/);
  return match?`development-trait-${match[1]}`:'';
}
export function getDevelopmentTechniqueId(entry={}) { return String(entry.catalogTechniqueId||entry.id||''); }

// Archive entries have their own instance ID; their authored identity stays stable.
export function findDevelopmentArchiveDuplicate(profile, collection, entry) {
  const reference = collection === 'quirks' ? getDevelopmentTraitId
    : collection === 'techniques' ? getDevelopmentTechniqueId : null;
  if (!reference) return null;
  const id = reference(entry);
  if (!id || (collection === 'techniques' && !id.startsWith('combat-style-'))) return null;
  return (profile[collection] || []).find(existing => reference(existing) === id) || null;
}
