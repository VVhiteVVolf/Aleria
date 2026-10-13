import { IDWAL_SHIP_CATS } from '../creatures/catalog/idwal-ship-cats.js?v=20261013-crew-cat-v2';

const TREE_ID = 'schiffskatzen';

// Prepare an explicit content edit. The caller owns saving the module;
// rendering and loading never persist or silently recreate a removed tree.
export function withIdwalShipCatsHierarchy(entry) {
  if (entry?.id !== 'idwals-schiffsmannschaft') throw new Error('Idwals Mannschaftsmodul fehlt.');
  const next = structuredClone(entry);
  const pages = next.pages.filter(page => page.hierarchyPage);
  if (pages.length !== 1) throw new Error('Die Mannschaftshierarchie ist nicht eindeutig.');
  const hierarchy = pages[0].hierarchy;
  if (!Array.isArray(hierarchy?.trees)) throw new Error('Die bestehenden Hierarchiebäume fehlen.');
  const matches = hierarchy.trees.filter(tree => tree.id === TREE_ID || tree.label === 'Schiffskatzen');
  if (matches.length > 1) throw new Error('Mehrere Schiffskatzenbäume vorhanden.');
  const tree = {
    id: TREE_ID, parentTreeId: '', label: 'Schiffskatzen',
    levels: [{ label: 'Die Kater der Tiefenwyrm', nodes: IDWAL_SHIP_CATS.map(cat => ({
      portrait: cat.portrait, title: cat.name,
      subtitle: 'Cenyric · Schiffskater', text: cat.notes
    })) }]
  };
  if (matches.length) hierarchy.trees[hierarchy.trees.indexOf(matches[0])] = tree;
  else hierarchy.trees.push(tree);
  return next;
}
