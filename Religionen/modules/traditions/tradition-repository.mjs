import { validateLoreBlocks } from '../lore/lore-validation.mjs';

export function validateTradition(tradition, { requireText, validateLocalPath, entryIds, context }) {
  if (!tradition || !Array.isArray(tradition.groups) || !tradition.groups.length) throw new Error(`Glaubensregister fehlt: ${context}`);
  requireText(tradition.title,context);
  requireText(tradition.intro,context);
  const groups = new Set(), members = new Set();
  for (const group of tradition.groups) {
    if (!/^[a-z][a-z0-9-]*$/.test(group.id) || groups.has(group.id)) throw new Error(`Ungültige Glaubensgruppe: ${context}.${group.id}`);
    groups.add(group.id);
    requireText(group.title,context);
    if (!Array.isArray(group.entries) || !group.entries.length) throw new Error(`Leere Glaubensgruppe: ${context}.${group.id}`);
    for (const member of group.entries) {
      if (!/^[a-z][a-z0-9-]*$/.test(member.id) || members.has(member.id)) throw new Error(`Doppelte oder ungültige Glaubensgestalt: ${context}.${member.id}`);
      members.add(member.id);
      requireText(member.name,context);
      if (typeof member.epithet !== 'string') throw new Error(`Aspektangabe fehlt: ${context}.${member.id}`);
      if (!Array.isArray(member.relatedIds) || new Set(member.relatedIds).size !== member.relatedIds.length || member.relatedIds.some(id=>!entryIds.has(id))) throw new Error(`Ungültige Glaubenszuordnung: ${context}.${member.id}`);
      if (!member.image) throw new Error(`Glaubensbild fehlt: ${context}.${member.id}`);
      validateLocalPath(member.image.src);
      requireText(member.image.alt,member.id);
      if (![member.image.width,member.image.height].every(value=>Number.isInteger(value) && value>0)) throw new Error(`Ungültige Glaubensbildmaße: ${context}.${member.id}`);
    }
  }
  if (tradition.notes !== undefined) {
    if (!Array.isArray(tradition.notes)) throw new Error(`Ungültige Glaubenshinweise: ${context}`);
    tradition.notes.forEach(note=>requireText(note,context));
  }
  if (tradition.quotation) {
    requireText(tradition.quotation.text,context);
    requireText(tradition.quotation.attribution,context);
  }
  if (tradition.hierarchy) {
    requireText(tradition.hierarchy.title,context);
    if (!Array.isArray(tradition.hierarchy.entries) || !tradition.hierarchy.entries.length) throw new Error(`Glaubensränge fehlen: ${context}`);
    const ranks = new Set();
    for (const rank of tradition.hierarchy.entries) {
      if (!/^[a-z][a-z0-9-]*$/.test(rank.id) || ranks.has(rank.id)) throw new Error(`Ungültiger Glaubensrang: ${context}.${rank.id}`);
      ranks.add(rank.id);
      requireText(rank.title,context);
      validateLoreBlocks(rank.blocks,`${context}.${rank.id}`);
      if (rank.military !== undefined) validateLoreBlocks(rank.military,`${context}.${rank.id}.military`);
    }
  }
}

export function traditionSearchTerms(tradition) {
  if (!tradition) return [];
  return [...tradition.groups.flatMap(group=>group.entries.map(member=>`${member.name} ${member.epithet}`)),
    ...(tradition.hierarchy?.entries || []).map(rank=>rank.title)];
}

export function traditionImagePaths(tradition) {
  return tradition ? tradition.groups.flatMap(group=>group.entries.map(member=>member.image.src)) : [];
}
