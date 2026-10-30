import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { BALCHDER_PROFILE_IDS } from '../../firebase/scripts/content/balchder-character-plan.mjs';
import { buildCharacterDatabase } from '../lib/character-database-model.mjs';
import { mergeCharacterExportAssignments } from '../lib/character-export-assignments.mjs';
import { mergeCharacterRecordProjections } from '../lib/character-record-projections.mjs';

const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const check = process.argv.includes('--check');
const [registry, snapshot, report, verification] = await Promise.all([
  'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json',
  'AleriaAlmanach/assets/biographies/balchder-vertragsstube/2026-10-30/publication-verification.json'
].map(readJson));
assert(verification.existingFieldsPreserved && verification.profiles.every(p => p.biography), 'Bestätigte Online-Veröffentlichung fehlt.');
const exports = await Promise.all(BALCHDER_PROFILE_IDS.map(async id => {
  const sourcePath = `Charakter Archiv Exporte/${id}-veroeffentlicht-2026-10-30.json`;
  const entry = { ...await readJson(sourcePath), sourcePath };
  assert.equal(entry.character.identity.worldPersonId, `person--haus-balchder--${id}`);
  assert(verification.profiles.some(p => p.id === entry.character.id && p.name === entry.character.name));
  return entry;
}));
const charTabs = mergeCharacterExportAssignments(snapshot.charTabs, exports);
const group = 'Gwynthor', subgroup = 'Gwynthor - Haus Balchder', ids = exports.map(e => e.character.id);
charTabs.subtabs ||= {};
charTabs.subtabMap ||= {};
charTabs.subtabs[group] = [...new Set([...(charTabs.subtabs[group] || []), subgroup])];
charTabs.subtabMap[group] = { ...charTabs.subtabMap[group], [subgroup]: [...new Set([...(charTabs.subtabMap[group]?.[subgroup] || []), ...ids])] };
const candidates = ['haus-balchder', 'haus-gelyn'].map(getRegisteredFamily).flatMap(createFamilyCandidates);
const records = exports.flatMap(entry => buildCharacterDatabase({ characters: [entry.character], charTabs, exportedAt: entry.exportedAt }, candidates, { sourcePath: entry.sourcePath }).records);
for (const item of records) {
  const previous = registry.records.find(r => r.recordId === item.record.recordId);
  if (previous) {
    assert.equal(item.path, previous.path, 'Bestehenden Aktenpfad erhalten.');
    item.record.local = (await readJson('CharakterDatenbank/' + previous.path)).local;
    if (item.record.local.authoredFeature) item.snapshotCharacter.localRecord.authoredFeature = item.record.local.authoredFeature;
  }
  assert.equal(item.record.classification.primary.id, 'haus-balchder');
}
const result = mergeCharacterRecordProjections({ registry, snapshot, report }, records, exports, charTabs);
const outputs = records.map(item => ['CharakterDatenbank/' + item.path, item.record]);
outputs.push(['CharakterDatenbank/registry.json', result.registry], ['CharakterDatenbank/generated/characters.snapshot.json', result.snapshot], ['CharakterDatenbank/generated/sync-report.json', result.report]);
for (const [path, data] of outputs) {
  const url = new URL(path, root), text = JSON.stringify(data, null, 2) + '\n';
  if (check) assert.equal(await readFile(url, 'utf8'), text, `Veraltete Balchder-Projektion: ${path}`);
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); }
}
console.log(JSON.stringify({ checked: check, profiles: records.length, unrelatedProfilesPreserved: snapshot.characters.filter(c => !ids.includes(c.id)).length }));
