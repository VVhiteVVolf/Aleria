export function groupNameKey(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/^(?:lady|lord|sir|dame)\s+/i, '').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
}

const placeholder = /^(?:\?+|vakant|nicht benannt|unbekannt|neue[rn]? (?:rang|unterrang)|rang\s*\d*|abenteurer\s*\d+|pagen?|matrosen?|matrosinnen|gehilfen?)$/i;
const role = /^(?:anführer.*|kommandant.*|hauptmann.*|leibgardist.*|leutnant.*|ritter(?:\s.*)?|knapp[ei].*|page.*|erster maat|zweiter maat|kapitän.*|schiffskapitän.*|steuer(?:mann|frau)|boot(?:smann|sfrau)|quartiermeister.*|wachmeister.*|navigator.*|schiffs.*|waffenmeister.*|waffenknecht.*|segelmeister.*|ausguck.*|proviantmeister.*|seiler.*|handwerker.*|feldscher.*|altmatros.*)$/i;
export const isNamedGroupPerson = value => !!String(value || '').trim() && !placeholder.test(String(value).trim()) && !role.test(String(value).trim()) && !/^(?:haus|clan|familie)\s/i.test(String(value).trim());

export function matchGroupCharacter(name, characters = []) {
  const key = groupNameKey(name);
  const matches = characters.filter(character => [character.name, ...(character.aliases || [])].some(alias => groupNameKey(alias) === key));
  return matches.length === 1 ? matches[0] : null;
}

export function collectGroupRoster(entry = {}, characters = []) {
  const result = new Map();
  for (const [pageIndex, page] of (entry.pages || []).entries()) {
    if (!page.hierarchyPage) continue;
    const hierarchy = page.hierarchy || {};
    const trees = hierarchy.trees?.length ? hierarchy.trees : [{ id: 'main', label: 'Hierarchie', levels: hierarchy.levels || [] }];
    for (const tree of trees) for (const level of tree.levels || []) for (const node of level.nodes || []) {
      if (/ehemalig|verstorben|gefallen|pensioniert|ruhestand/i.test(`${tree.label || ''} ${level.label || ''}`)) continue;
      const subtitle = String(node.subtitle || '').trim(), title = String(node.title || '').trim();
      if (/^(?:haus|clan|familie)\s/i.test(title)) continue;
      const inverted = role.test(subtitle) && isNamedGroupPerson(title);
      const name = inverted ? title : subtitle;
      if (!isNamedGroupPerson(name)) continue;
      const character = matchGroupCharacter(name, characters);
      const id = 'hierarchy:' + groupNameKey(name);
      if (result.has(id)) continue;
      result.set(id, { id, name, role: inverted ? subtitle : title, portrait: node.portrait || '', badgeIcon: node.icon || '',
        characterId: character?.id || '', treeLabel: tree.label || '', levelLabel: level.label || '',
        hierarchyPageIndex: pageIndex, source: 'hierarchy' });
    }
  }
  return [...result.values()];
}

export function resolveGroupRoster(entry, state, characters = []) {
  const overrides = new Map((state.members || []).map(member => [member.id, member]));
  const roster = collectGroupRoster(entry, characters).map(member => ({
    assignment: 'reserve', status: 'auto', note: '', ...member, ...overrides.get(member.id),
    characterId: overrides.get(member.id)?.linkMode === 'none' ? '' : overrides.get(member.id)?.characterId || member.characterId,
    name: member.name, role: member.role, portrait: member.portrait, source: 'hierarchy',
    badgeIcon: overrides.get(member.id)?.badgeIcon ?? member.badgeIcon
  }));
  const characterIds = new Set(roster.map(member => member.characterId).filter(Boolean));
  const names = new Set(roster.map(member => groupNameKey(member.name)));
  for (const guest of state.guests || []) {
    if (characterIds.has(guest.characterId) || names.has(groupNameKey(guest.name))) continue;
    const character = characters.find(item => item.id === guest.characterId);
    roster.push({ ...guest, name: character?.name || guest.name, portrait: character?.portrait || guest.portrait, source: 'guest', treeLabel: 'Gäste' });
    if (guest.characterId) characterIds.add(guest.characterId);
    names.add(groupNameKey(guest.name));
  }
  return roster;
}
