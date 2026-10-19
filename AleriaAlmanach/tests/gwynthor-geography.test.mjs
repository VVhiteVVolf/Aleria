import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { projectGwynthorPath, projectGwynthorSections, migrateGwynthorModuleStore,
  GWYNTHOR_CITY_PATH, GWYNTHOR_BANNKREIS_PATH, GWYNTHOR_AREA_ICONS } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
const tab = 'Völker & Kulturen', region = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft'];
const node = (id, title, parentId) => ({ id, title, parentId, tab, desc: '', sortOrder: 0 });
const fixture = () => ({ version: 5, updatedAtClient: 123,
  moduleSectionNodes: [node('root', tab, ''), node('cenyr', 'Cenyr', 'root'), node('county', region[1], 'cenyr'), node('barony', region[2], 'county'),
    node('city-old-id', 'Gwynthor', 'barony'), node('rural-old-id', 'Gwynthor - Bannkreis', 'city-old-id'),
    node('owain-old-id', 'Owains Anwesen & Gestüt', 'rural-old-id'), node('guild-old-id', 'Die Klingende Münze - Gwynthor', 'city-old-id')],
  customSections: [{ key: 'Gwynthor', tab, nodeId: 'city-old-id', path: [...region, 'Gwynthor'], entries: [{ id: 'city-shop', title: 'Ein Laden', pages: [{ sessionPage: true, commentThreadKey: 'permanent-thread', sessionDateAleria: { year: 1740, month: 3, day: 9 } }] }] },
    { key: 'Owains Anwesen & Gestüt', tab, nodeId: 'owain-old-id', path: [...region, 'Gwynthor', 'Gwynthor - Bannkreis', 'Owains Anwesen & Gestüt'], entries: [{ id: 'modul-1781813764249', title: 'Owains Anwesen & Gestüt', pages: [] }] }],
  moduleNodeAssignments: { 'city-shop': 'city-old-id', 'modul-1781813764249': 'owain-old-id' },
  moduleSectionMoves: { 'guild-shop': { key: 'Die Klingende Münze - Gwynthor', tab, nodeId: 'guild-old-id', path: [...region, 'Gwynthor', 'Die Klingende Münze - Gwynthor'] } },
  entryOverrides: { kept: { id: 'kept', title: 'Bearbeitet' } }, hiddenModuleIds: { hidden: true }
});
function pathOf(nodes, id) {
  const result = [], seen = new Set(); let current = nodes.find(node => node.id === id);
  while (current?.parentId) {
    assert.ok(!seen.has(current.id), 'no parent cycle'); seen.add(current.id);
    result.unshift(current.title); current = nodes.find(node => node.id === current.parentId);
  }
  return result;
}

test('urban paths move below the Bannkreis while Owain and unrelated places retain their geographic distinction', () => {
  assert.deepEqual(projectGwynthorPath([...region, 'Gwynthor', 'Castell Draig']), [...GWYNTHOR_CITY_PATH, 'Castell Draig']);
  assert.deepEqual(projectGwynthorPath([...region, 'Gwynthor', 'Gwynthor - Bannkreis', 'Owains Anwesen & Gestüt']), [...GWYNTHOR_BANNKREIS_PATH, 'Owains Anwesen & Gestüt']);
  assert.deepEqual(projectGwynthorPath(GWYNTHOR_CITY_PATH), GWYNTHOR_CITY_PATH);
  const other = [...region, 'Lysfaen']; assert.equal(projectGwynthorPath(other), other);
  const group = [...region, 'Gwynthor']; assert.equal(projectGwynthorPath(group, 'Gruppen'), group);
});

test('reparenting preserves every old node ID, entry identity, override, scene key and saved date without cycles', () => {
  const original = fixture(), before = JSON.stringify(original), migrated = migrateGwynthorModuleStore(original);
  for (const old of original.moduleSectionNodes) assert.ok(migrated.moduleSectionNodes.some(node => node.id === old.id));
  assert.deepEqual(pathOf(migrated.moduleSectionNodes, 'city-old-id'), GWYNTHOR_CITY_PATH);
  assert.deepEqual(pathOf(migrated.moduleSectionNodes, 'rural-old-id'), GWYNTHOR_BANNKREIS_PATH);
  assert.deepEqual(pathOf(migrated.moduleSectionNodes, 'owain-old-id'), [...GWYNTHOR_BANNKREIS_PATH, 'Owains Anwesen & Gestüt']);
  assert.deepEqual(pathOf(migrated.moduleSectionNodes, 'guild-old-id'), [...GWYNTHOR_CITY_PATH, 'Die Klingende Münze - Gwynthor']);
  assert.equal(migrated.customSections[0].entries[0], original.customSections[0].entries[0]);
  assert.deepEqual(migrated.moduleNodeAssignments, original.moduleNodeAssignments);
  assert.equal(migrated.entryOverrides, original.entryOverrides); assert.equal(migrated.hiddenModuleIds, original.hiddenModuleIds);
  assert.equal(migrated.updatedAtClient, original.updatedAtClient);
  assert.equal(JSON.stringify(original), before);
  assert.deepEqual(migrateGwynthorModuleStore(migrated), migrated);
  for (const node of migrated.moduleSectionNodes) pathOf(migrated.moduleSectionNodes, node.id);
});

test('a mixed legacy section separates the stud from city shops and fresh builtin registration does not recreate the old city folder', () => {
  const stud = { id: 'modul-1781813764249', title: 'Owains Anwesen & Gestüt' }, shop = { id: 'city-shop' };
  const sections = [{ key: 'Gwynthor', tab, path: [...region, 'Gwynthor'], entries: [shop, stud] }];
  const split = projectGwynthorSections(sections);
  assert.equal(split.length, 2); assert.deepEqual(split[0].path, GWYNTHOR_CITY_PATH);
  assert.deepEqual(split[1].path, [...GWYNTHOR_BANNKREIS_PATH, 'Owains Anwesen & Gestüt']);
  assert.equal(split[1].entries[0], stud);
  const state = migrateGwynthorModuleStore({}, sections);
  const projected = projectGwynthorSections(sections, { nodes: state.moduleSectionNodes });
  for (const section of projected) assert.deepEqual(pathOf(state.moduleSectionNodes, section.nodeId), section.path);
  assert.ok(state.moduleSectionNodes.some(node => node.title === 'Zum Roten Tor'));
  assert.ok(!state.moduleSectionNodes.some(node => node.title === 'Gwynthor'));
});

test('official category icons already exist in the shared asset collection', async () => {
  for (const icon of Object.values(GWYNTHOR_AREA_ICONS)) await access(new URL(`../${icon}`, import.meta.url));
});
