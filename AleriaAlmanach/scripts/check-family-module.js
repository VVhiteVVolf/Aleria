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
  'modules/family/editor/family-editor-ui.js',
  'modules/family/services/family-presentation-service.js',
  'modules/family/compatibility/family-legacy-bridge.js',
  'modules/family/migration/family-migration-service.js'
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
assert.match(moduleMarkup, /family-v2-source-data/);
assert.match(moduleMarkup, /data-module-editor-action="add-family-v2-record"/);
assert.match(inlineMarkup, /data-inline-action="add-family-v2-record"/);
assert.doesNotMatch(inlineMarkup, /family-v2-source-data/);
model.collections.forEach(definition => {
  assert.match(moduleMarkup, new RegExp(`data-family-v2-collection="${definition.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

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
assert.match(moduleEvents, /'migrate-family-v2'/);
assert.match(moduleEvents, /'restore-family-legacy'/);
assert.match(inlineEvents, /'migrate-family-v2'/);
assert.match(inlineEvents, /'restore-family-legacy'/);

console.log(`Family-Modulvertrag OK: ${model.collections.length} Editor-Sammlungen, reversible Legacy-Migration und verlustfreie Erweiterungsfelder.`);
