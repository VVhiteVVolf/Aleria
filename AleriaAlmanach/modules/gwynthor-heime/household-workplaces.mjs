import { GWYNTHOR_HOUSEHOLDS } from './households.mjs';

export const HOUSEHOLD_WORKPLACE_LINKS = GWYNTHOR_HOUSEHOLDS.flatMap(home => home.people.filter(p => p.workplaceModuleId).map(p => ({
  moduleId: p.workplaceModuleId, sourceName: 'Llinos', name: p.name, portrait: p.portrait,
  note: `Seit ${home.marriageYear} mit Gwydan Celynfor verheiratet; sie wohnt mit ihm im Heim der Celynfor und arbeitet weiterhin in der Krummen Kanne.`
})));

// Read projection for builtin, imported and remote workplace modules. Historical
// source snapshots and live character records are not rewritten.
export function projectHouseholdWorkplaces(entry, links) {
  const relevant = links.filter(link => link.moduleId === entry?.id);
  if (!relevant.length || !entry.pages?.some(page => page.hierarchyPage)) return entry;
  const result = structuredClone(entry);
  let changed = false;
  const visit = node => {
    const link = relevant.find(link => node.portrait?.endsWith(link.portrait.slice(1)) && [link.sourceName, link.name].includes(node.title));
    if (!link) return;
    if (node.title !== link.name) { node.title = link.name; changed = true; }
    if (!(node.text || '').includes(link.note)) { node.text = `${node.text || ''}<p>${link.note}</p>`; changed = true; }
  };
  for (const page of result.pages) {
    for (const level of page.hierarchy?.levels || []) for (const node of level.nodes || []) visit(node);
    for (const tree of page.hierarchy?.trees || []) for (const level of tree.levels || []) for (const node of level.nodes || []) visit(node);
  }
  return changed ? result : entry;
}

export const withHouseholdWorkplaceLinks = entry => projectHouseholdWorkplaces(entry, HOUSEHOLD_WORKPLACE_LINKS);
