import { getArchiveClassDefinition } from './character-archive-classification.js?v=20260905-cenyr-character-training-v1';

// Only canonical repository paths are rendered as links; user-entered archive
// JSON never supplies arbitrary link destinations.
export function getCharacterArchiveClassLinks(entry) {
  if (entry?.kind !== 'class') return [];
  return (getArchiveClassDefinition(entry)?.pageLinks || []).map(link => ({
    // Relative to AleriaAlmanach.html, also after bundling under dist/assets.
    href: `../${link.path}`,
    label: link.culture ? `Klassenbogen · ${link.culture}` : 'Klassenseite'
  }));
}
