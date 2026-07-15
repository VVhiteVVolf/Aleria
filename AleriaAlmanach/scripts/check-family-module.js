#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sources = [
  'modules/module-editor/module-editor-data.js',
  'modules/family/family-api.js',
  'modules/family/editor/family-editor-model.js',
  'modules/family/workbench/family-workbench-state.js',
  'modules/family/workbench/family-workbench-ui.js',
  'modules/family/editor/family-editor-ui.js',
  'modules/family/services/family-presentation-service.js',
  'modules/family/compatibility/family-legacy-bridge.js',
  'modules/family/migration/family-migration-service.js',
  'modules/family/adapters/family-chart-adapter.js',
  'modules/family/workbench/family-workbench-controller.js'
];
const context = vm.createContext({ console, structuredClone });

sources.forEach(relativePath => {
  const absolutePath = path.join(root, relativePath);
  vm.runInContext(fs.readFileSync(absolutePath, 'utf8'), context, { filename: relativePath });
});

const familyApi = context.AleriaFamily;
const model = familyApi.editor.model;
const ui = familyApi.editor.ui;
const migration = familyApi.migration;
const presentation = familyApi.services.presentation;

assert.equal(familyApi.schema, 'aleria.family');
assert.equal(familyApi.schemaVersion, 2);
assert.equal(model.collections.length, 16, 'Alle fachlichen Sammlungen müssen im Editor registriert sein.');

const family = model.createDefaultFamily(0);
assert.equal(model.isVersioned(family), true);
assert.equal(family.genealogy.persons.length, 3);
assert.equal(family.genealogy.partnerships.length, 1);
assert.equal(family.genealogy.parentages.length, 1);

const moduleMarkup = ui.buildFields(family, 'module');
const inlineMarkup = ui.buildFields(family, 'inline');
assert.match(moduleMarkup, /data-family-editor-version="2"/);
assert.match(moduleMarkup, /family-direct-workbench/);
assert.match(moduleMarkup, /family-v2-source-data/);
assert.match(moduleMarkup, /data-family-workbench-chart/);
assert.match(moduleMarkup, /data-family-workbench-action="add-person"/);
['partner', 'child', 'parent', 'association'].forEach(relationType => {
  assert.match(moduleMarkup, new RegExp(`data-family-relation-type="${relationType}"`));
});
['document', 'fantasy', 'view'].forEach(manager => {
  assert.match(moduleMarkup, new RegExp(`data-family-manager="${manager}"`));
});
assert.match(moduleMarkup, /data-family-workbench-orientation/);
assert.doesNotMatch(moduleMarkup, /data-module-editor-action="add-family-v2-record"/);
assert.doesNotMatch(moduleMarkup, /family-v2-panel/);
assert.match(inlineMarkup, /family-direct-workbench/);
assert.match(inlineMarkup, /family-v2-source-data/);

const personInspector = familyApi.workbench.ui.buildPersonInspector(family, 'cassian-vael');
assert.match(personInspector, /data-family-person-field="identity\.displayName"/);
assert.match(personInspector, /data-family-person-field="profile\.portrait\.src"/);
assert.match(personInspector, /data-family-person-field="recordType"/);
assert.match(personInspector, /data-family-workbench-action="edit-relation"/);

const relativeEditor = familyApi.workbench.ui.buildRelativeEditor(family, 'cassian-vael', 'partner');
assert.match(relativeEditor, /data-family-relative-target="true"/);
assert.match(relativeEditor, /Neue Person anlegen/);
assert.match(relativeEditor, /data-family-relative-field="kind"/);
assert.doesNotMatch(relativeEditor, /Personen-ID/);

const documentManager = familyApi.workbench.ui.buildManager(family, 'document');
assert.match(documentManager, /data-family-collection="document\.facts"/);
assert.match(documentManager, /data-family-collection="genealogy\.sources"/);
assert.match(documentManager, /data-family-record-id="@0"/);
const fantasyManager = familyApi.workbench.ui.buildManager(family, 'fantasy');
model.collections.filter(definition => definition.group === 'fantasy').forEach(definition => {
  assert.match(fantasyManager, new RegExp(`data-family-collection="${definition.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

const directState = familyApi.workbench.state;
const editedFact = directState.updateCollectionRecord(family, 'document.facts', '@0', 'value', 'Südturm');
assert.equal(editedFact.document.facts[0].value, 'Südturm');
const removedFact = directState.removeCollectionRecord(editedFact, 'document.facts', '@0');
assert.equal(removedFact.document.facts.length, 0);
const removedHouse = directState.removeCollectionRecord(family, 'genealogy.fantasy.houses', 'haus-vael');
assert.equal(removedHouse.genealogy.fantasy.houses.length, 0);
assert.equal(removedHouse.genealogy.fantasy.lineages[0].houseId, null);
assert.equal(removedHouse.genealogy.fantasy.titles[0].houseId, null);
const addedPartner = directState.addRelative(family, {
  anchorId: 'cassian-vael',
  relationType: 'partner',
  personValues: { 'identity.displayName': 'Mira Vael', 'profile.tagline': 'Diplomatin' },
  relationValues: { kind: 'engagement', status: 'active' }
});
assert.equal(addedPartner.family.genealogy.persons.length, 4);
assert.equal(addedPartner.family.genealogy.partnerships.length, 2, 'Mehrere Partnerschaften bleiben getrennte Beziehungen.');
assert.equal(directState.findPerson(addedPartner.family, addedPartner.personId).identity.displayName, 'Mira Vael');
assert.equal(addedPartner.family.genealogy.partnerships.at(-1).kind, 'engagement');

const addedChild = directState.addRelative(addedPartner.family, {
  anchorId: 'cassian-vael',
  relationType: 'child',
  personValues: { 'identity.displayName': 'Tavian Vael' },
  coParentId: addedPartner.personId,
  relationValues: { kind: 'adoptive', 'legitimacy.status': 'legitimized' }
});
assert.deepEqual(JSON.parse(JSON.stringify(addedChild.family.genealogy.parentages.at(-1).parentIds)), ['cassian-vael', addedPartner.personId]);
assert.equal(addedChild.family.genealogy.parentages.at(-1).kind, 'adoptive');
assert.equal(addedChild.family.genealogy.parentages.at(-1).legitimacy.status, 'legitimized');

const addedAssociation = directState.addRelative(addedChild.family, {
  anchorId: 'cassian-vael',
  relationType: 'association',
  personId: addedPartner.personId,
  anchorRole: 'guardian',
  relativeRole: 'ward',
  relationValues: { kind: 'guardianship', label: 'Vormundschaft' }
});
assert.equal(addedAssociation.family.genealogy.associations.at(-1).participants[0].role, 'guardian');
const renamed = directState.updatePerson(addedAssociation.family, addedPartner.personId, 'identity.displayName', 'Mira von Vael');
assert.equal(directState.findPerson(renamed, addedPartner.personId).identity.displayName, 'Mira von Vael');
const cleaned = directState.removePerson(renamed, addedPartner.personId);
assert.equal(directState.findPerson(cleaned, addedPartner.personId), null);
assert.equal(cleaned.genealogy.associations.some(item => item.id === addedAssociation.relationId), false);

const directEditor = {
  matches: selector => selector === '.family-workbench',
  querySelector: selector => selector === '.family-v2-source-data' ? { value: JSON.stringify(addedChild.family) } : null
};
const directBlock = { querySelector: selector => selector === '.family-v2-editor' ? directEditor : null };
const directlyCollected = ui.collect(directBlock, undefined);
assert.equal(directlyCollected.genealogy.persons.length, 5);
assert.equal(directlyCollected.genealogy.partnerships.length, 2);
assert.equal(directlyCollected.genealogy.parentages.length, 2);

const editable = model.clone(family);
editable.extensions['test.top-level'] = { retained: true };
editable.genealogy.persons[0].extensions['test.person'] = { retained: true };
editable.genealogy.parentages[0].extensions['test.parentage'] = { retained: true };

function input(pathValue, fieldValue, type = 'text', recordField = '') {
  return {
    dataset: {
      familyPath: pathValue,
      familyValueType: type,
      ...(recordField ? { familyRecordField: recordField } : {})
    },
    type,
    value: fieldValue,
    checked: Boolean(fieldValue)
  };
}

function recordRow(record, definition, index) {
  const fields = [];
  if (definition.path === 'genealogy.persons' && index === 0) {
    fields.push(input(`${definition.path}.${index}.identity.displayName`, 'Aeron der Bewahrte', 'text', 'identity.displayName'));
  }
  return {
    dataset: { familyOriginalId: String(record?.id || '') },
    matches: selector => selector === '.family-v2-record',
    querySelectorAll: selector => selector === '.me-family-v2-record-field' ? fields : []
  };
}

const lists = new Map(model.collections.map(definition => {
  const records = model.getPath(editable, definition.path, []);
  return [definition.path, { children: records.map((record, index) => recordRow(record, definition, index)) }];
}));
const editor = {
  querySelector(selector) {
    if (selector === '.family-v2-source-data') return { value: JSON.stringify(editable) };
    const match = selector.match(/^\[data-family-v2-list="(.+)"\]$/);
    return match ? lists.get(match[1]) || null : null;
  },
  querySelectorAll(selector) {
    return selector === '.me-family-v2-top-field'
      ? [input('document.title', 'Haus Vael – Revidierte Akte')]
      : [];
  }
};
const block = { querySelector: selector => selector === '.family-v2-editor' ? editor : null };
const collected = ui.collect(block, undefined);
assert.equal(collected.document.title, 'Haus Vael – Revidierte Akte');
assert.equal(collected.genealogy.persons[0].identity.displayName, 'Aeron der Bewahrte');
assert.deepEqual(collected.extensions['test.top-level'], { retained: true });
assert.deepEqual(collected.genealogy.persons[0].extensions['test.person'], { retained: true });
assert.deepEqual(collected.genealogy.parentages[0].extensions['test.parentage'], { retained: true });
assert.deepEqual(collected.genealogy.parentages[0].parentIds, ['aeron-vael', 'lyria-vael']);

assert.deepEqual(JSON.parse(JSON.stringify(model.readFieldValue(input('', 'eins, zwei, , drei', 'array')))), ['eins', 'zwei', 'drei']);
assert.deepEqual(JSON.parse(JSON.stringify(model.readFieldValue(input('', 'a:guardian, b:ward', 'participantRoles')))), [
  { personId: 'a', role: 'guardian' },
  { personId: 'b', role: 'ward' }
]);
assert.equal(model.readFieldValue(input('', '', 'number')), null);
assert.equal(model.readFieldValue(input('', '12', 'number')), 12);
assert.equal(model.readFieldValue({ dataset: { familyValueType: 'boolean' }, checked: true }), true);

const legacy = {
  id: 'haus-nachtwind',
  eyebrow: 'Chronik',
  organizationTitle: 'Haus Nachtwind',
  subtitle: 'Die geteilte Linie',
  details: [{ icon: '✦', label: 'Sitz', value: 'Dämmerfeste' }],
  layoutMode: 'vertical',
  treeDisplayMode: 'tabs',
  trees: [{
    id: 'hauptlinie',
    label: 'Hauptlinie',
    levels: [
      { nodes: [
        { id: 'alrik', title: 'Alrik', subtitle: 'Fürst', familyType: 'direct' },
        { id: 'sera', title: 'Sera', subtitle: 'Fürstin', familyType: 'direct' }
      ] },
      { nodes: [
        { id: 'nera', title: 'Nera', subtitle: 'Erbin', familyType: 'direct', parentIds: ['alrik', 'sera'] },
        { id: 'tavian', title: 'Tavian', subtitle: 'Mündel', familyType: 'ward' }
      ] }
    ],
    connections: [
      { from: 'alrik', to: 'sera', relationType: 'spouse', label: 'Ehe' },
      { from: 'alrik', to: 'sera', relationType: 'affair', label: 'Frühere Affäre' },
      { from: 'sera', to: 'tavian', relationType: 'ward', label: 'Vormundschaft' }
    ]
  }]
};
const legacySnapshot = JSON.stringify(legacy);
assert.equal(migration.canMigrate(legacy), true);
const migrated = migration.migrate(legacy);
assert.equal(JSON.stringify(legacy), legacySnapshot, 'Migration darf die Quelle nicht verändern.');
assert.equal(migrated.migrated, true);
assert.equal(model.isVersioned(migrated.family), true);
assert.equal(migrated.family.id, 'haus-nachtwind');
assert.equal(migrated.family.genealogy.persons.length, 4);
assert.equal(migrated.family.genealogy.partnerships.length, 2, 'Ehe und Affäre bleiben getrennte Partnerschaften.');
assert.equal(migrated.family.genealogy.parentages.length, 1);
assert.equal(migrated.family.genealogy.associations[0].kind, 'guardianship');
assert.equal(migrated.family.extensions['aleria.legacy'].projectedAtRuntime, false);
assert.equal(migrated.family.extensions['aleria.legacy'].migratedExplicitly, true);
assert.equal(migrated.family.extensions['aleria.migration'].explicit, true);
assert.equal(migration.canRestore(migrated.family), true);
assert.deepEqual(migration.restore(migrated.family), legacy);
assert.equal(migration.migrate(family).migrated, false);
assert.equal(migration.migrate(legacy, { keepLegacySnapshot: false }).family.extensions['aleria.migration'].legacySnapshot, null);

const migratedMarkup = ui.buildFields(migrated.family, 'module');
assert.match(migratedMarkup, /data-module-editor-action="restore-family-legacy"/);
assert.match(migratedMarkup, /Explizit aus dem Legacy-Format migriert/);

const fantasyFamily = model.clone(family);
fantasyFamily.genealogy.fantasy.bloodlines = [{ id: 'silberblut', name: 'Silberblut' }];
fantasyFamily.genealogy.fantasy.bloodlineLinks = [{ personId: 'cassian-vael', bloodlineId: 'silberblut' }];
fantasyFamily.genealogy.fantasy.successionDecisions = [{ personId: 'cassian-vael', rank: 1, status: 'heir' }];
const projector = presentation.createProjector(fantasyFamily.genealogy);
const cardMeta = projector.get({ id: 'cassian-vael', life: { birth: '412 n. E.', death: '489 n. E.' } });
assert.match(cardMeta.contextLine, /Anspruch: Herr des Nordturms/);
assert.match(cardMeta.contextLine, /Haus Vael/);
assert.match(cardMeta.contextLine, /Hauptlinie Vael/);
assert.match(cardMeta.contextLine, /Erbfolge 1/);
assert.match(cardMeta.contextLine, /Silberblut/);
assert.match(cardMeta.lifeLine, /412 n\. E\./);
assert.match(cardMeta.lifeLine, /489 n\. E\./);

const migrationSource = fs.readFileSync(path.join(root, 'modules/family/migration/family-migration-service.js'), 'utf8');
assert.doesNotMatch(migrationSource, /\blocalStorage\b|\bsessionStorage\b|\bfirebase\b|\bsetDoc\b|\bupdateDoc\b/i);
const moduleEvents = fs.readFileSync(path.join(root, 'modules/module-editor/module-editor-events.js'), 'utf8');
const inlineEvents = fs.readFileSync(path.join(root, 'modules/inline-editor/inline-editor-events.js'), 'utf8');
const workbenchController = fs.readFileSync(path.join(root, 'modules/family/workbench/family-workbench-controller.js'), 'utf8');
assert.match(moduleEvents, /'migrate-family-v2'/);
assert.match(moduleEvents, /'restore-family-legacy'/);
assert.match(inlineEvents, /'migrate-family-v2'/);
assert.match(inlineEvents, /'restore-family-legacy'/);
assert.equal(typeof familyApi.workbench.mount, 'function');
assert.equal(typeof familyApi.workbench.unmount, 'function');
assert.equal(typeof familyApi.workbench.getState, 'function');
assert.equal(typeof familyApi.workbench.restore, 'function');
assert.doesNotMatch(workbenchController, /global\.f3|\.createChart\s*\(/, 'Nur der Family-Chart-Adapter darf die Library kennen.');

console.log(`Family-Modulvertrag OK: interaktive Workbench, ${model.collections.length} Editor-Sammlungen, reversible Legacy-Migration und verlustfreie Erweiterungsfelder.`);
