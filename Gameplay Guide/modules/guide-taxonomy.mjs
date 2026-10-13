import assert from 'node:assert/strict';

const treeAsset = path => !path ? '' : /^https?:|^\//.test(path) ? path : `/Stammbäume/${path}`;

// Family is always the primary placement. Group paths are independent, stable-ID
// memberships; for a person without a family, the first group becomes primary.
export function resolveGuideTaxonomy(registration, character, families) {
  const familyId = registration.familyId || character.genealogy?.sources?.[0]?.familyId;
  const family = families.find(entry => entry.id === familyId);
  if (familyId) assert.ok(family, `Unbekannte Guide-Familie: ${familyId}`);
  const groups = registration.groupPaths || [];
  for (const group of groups) {
    assert.ok(group.id && group.path?.length, 'Gruppenzuordnung benötigt ID und vollständigen Pfad');
    assert.ok(group.path.every(node => node.id && node.label), 'Gruppenpfade benötigen stabile IDs und Namen');
  }
  if (!family) {
    assert.ok(groups.length, `Guide ${registration.slug} benötigt Familie oder Gruppenzuordnung`);
    return { kind: 'group', path: groups[0].path, fullPath: groups[0].path, groups, emblem: '', sourceHref: '' };
  }
  const person = family.family.persons.find(p => p.worldPersonId === registration.worldPersonId
    || character.genealogy?.sources?.some(s => s.familyId === family.id && s.personId === p.id));
  assert.ok(person, `Figur fehlt in Stammbaum-Familie ${family.id}: ${registration.slug}`);
  const aliases = (registration.familyAliasIds || []).map(id => {
    const alias = families.find(f => f.id === id); assert.ok(alias, `Unbekannte Herkunftsfamilie: ${id}`);
    return { id, label: alias.title };
  });
  const fullPath = family.hierarchy.map(n => ({ id: n.level === 'family' ? n.slug : `${n.level}:${n.slug}`, label: n.title, level: n.level }));
  const path = fullPath.filter(n => ['kingdom', 'county', 'family'].includes(n.level)).map(n => ({ ...n }));
  const house = family.family.houses.find(h => h.id === person.houseId);
  const familyNode = path.find(n => n.level === 'family');
  if (aliases.length) familyNode.label += ' / ' + aliases.map(a => a.label.replace(/^(?:Haus|Clan)\s+/, '')).join(' / ');
  return { kind: 'family', familyId: family.id, aliases, path, fullPath, groups,
    emblem: treeAsset(house?.emblem), portrait: treeAsset(person.portrait),
    sourceHref: `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(family.id)}&mode=view&person=${encodeURIComponent(person.id)}` };
}

export function buildGuideDirectoryTree(guides, mode = 'family') {
  const root = [];
  for (const guide of guides) {
    const paths = mode === 'group' ? guide.taxonomy.groups.map(g => g.path) : [guide.taxonomy.path];
    for (const path of paths) {
      let siblings = root;
      for (const [index, part] of path.entries()) {
        let node = siblings.find(n => n.id === part.id);
        if (!node) { node = { ...part, children: [], slugs: [] }; siblings.push(node); }
        if (!node.slugs.includes(guide.slug)) node.slugs.push(guide.slug);
        if (index < path.length - 1) siblings = node.children;
      }
    }
  }
  const sort = nodes => { nodes.sort((a,b) => a.label.localeCompare(b.label, 'de')); nodes.forEach(n => sort(n.children)); };
  sort(root); return root;
}
