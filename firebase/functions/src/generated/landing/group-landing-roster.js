export function groupNameKey(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/^(?:lady|lord|sir|dame)\s+/i, '').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
}

const placeholder = /^(?:\?+|vakant|nicht benannt|unbekannt|neue[rn]? (?:rang|unterrang)|rang\s*\d*|abenteurer\s*\d+|pagen?|matrosen?|matrosinnen|gehilfen?)$/i;
const role = /^(?:anführer.*|kommandant.*|hauptmann.*|leibgardist.*|leutnant.*|ritter(?:\s.*)?|knapp[ei].*|page(?:n|\s.*)?|erster maat|zweiter maat|kapitän.*|schiffskapitän.*|steuer(?:mann|frau)|boot(?:smann|sfrau)|quartiermeister.*|wachmeister.*|navigator.*|schiffs.*|waffenmeister.*|waffenknecht.*|segelmeister.*|ausguck.*|proviantmeister.*|seiler.*|handwerker.*|feldscher.*|altmatros.*)$/i;
const plainGroupLabel = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
export const isNamedGroupPerson = value => {
  const label = plainGroupLabel(value);
  return !!label && !placeholder.test(label) && !role.test(label)
    && !/^(?:n\.?\s*n\.?|unbesetzt|(?:noch )?offen|nicht besetzt|vakante? stelle|[-\u2013\u2014_.?]+)$/i.test(label)
    && !/^(?:haus|clan|familie)\s/i.test(label);
};

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
      if (/\b(?:schiffskatzen|tierbegleiter|reittiere|tiere|schiffstiere|pferde|katzen)\b/i.test(`${tree.label || ''} ${level.label || ''}`)) continue;
      if (/ehemalig|verstorben|gefallen|pensioniert|ruhestand/i.test(`${tree.label || ''} ${level.label || ''}`)) continue;
      const subtitle = plainGroupLabel(node.subtitle), title = plainGroupLabel(node.title);
      if (/^(?:haus|clan|familie)\s/i.test(title)) continue;
      const inverted = role.test(subtitle) && isNamedGroupPerson(title);
      const name = inverted ? title : subtitle;
      if (!isNamedGroupPerson(name)) continue;
      const character = matchGroupCharacter(name, characters);
      const id = 'hierarchy:' + groupNameKey(name);
      const position = { role: inverted ? subtitle : title, treeLabel: tree.label || '', levelLabel: level.label || '', hierarchyPageIndex: pageIndex };
      const existing = result.get(id) || [...result.values()].find(member => character?.id && member.characterId === character.id);
      if (existing) {
        existing.positions.push(position);
        existing.role = [...new Set(existing.positions.map(position => position.role).filter(Boolean))].join(' · ');
        continue;
      }
      result.set(id, { id, name, kind: 'character', role: position.role, positions: [position], portrait: node.portrait || '', badgeIcon: node.icon || '',
        characterId: character?.id || '', treeLabel: tree.label || '', levelLabel: level.label || '',
        hierarchyPageIndex: pageIndex, source: 'hierarchy' });
    }
  }
  return [...result.values()];
}

export function groupMemberRecordId(member) {
  return member?.kind === 'creature' ? member.creatureId || '' : member?.characterId || '';
}

export function resolveGroupRoster(entry, state, characters = [], creatures = []) {
  const overrides = new Map((state.members || []).map(member => [member.id, member]));
  const roster = collectGroupRoster(entry, characters).map(member => ({
    assignment: 'reserve', status: 'auto', note: '', ...member, ...overrides.get(member.id),
    characterId: overrides.get(member.id)?.linkMode === 'none' ? '' : overrides.get(member.id)?.characterId || member.characterId,
    name: member.name, role: member.role, portrait: member.portrait, source: 'hierarchy',
    badgeIcon: overrides.get(member.id)?.badgeIcon ?? member.badgeIcon
  }));
  const recordKeys = new Set(roster.filter(member => groupMemberRecordId(member)).map(member => `${member.kind}:${groupMemberRecordId(member)}`));
  const names = new Set(roster.map(member => `${member.kind}:${groupNameKey(member.name)}`));
  for (const guest of state.guests || []) {
    const kind = guest.kind === 'creature' || guest.creatureId ? 'creature' : 'character';
    const recordId = kind === 'creature' ? guest.creatureId : guest.characterId;
    const key = `${kind}:${recordId}`;
    if ((recordId && recordKeys.has(key)) || names.has(`${kind}:${groupNameKey(guest.name)}`)) continue;
    const record = (kind === 'creature' ? creatures : characters).find(item => item.id === recordId);
    roster.push({ ...guest, kind, name: record?.name || guest.name, portrait: record?.portrait || guest.portrait, source: 'guest', treeLabel: kind === 'creature' ? 'Tierbegleiter' : 'Gäste' });
    if (recordId) recordKeys.add(key);
    names.add(`${kind}:${groupNameKey(guest.name)}`);
  }
  return roster;
}
