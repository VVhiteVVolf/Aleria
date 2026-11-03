import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { CONFIRMED_CHARACTER_RETIREMENTS, characterRetirementMetadata } from '../../../CharakterDatenbank/assets/js/character-identity-retirements.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';

export const CHARACTER_RETIREMENT_PLAN_SCHEMA = 'aleria.confirmed-character-retirements';
const idOf = document => document?.name?.split('/').at(-1);
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const worldId = character => character.identity?.worldPersonId || character.genealogy?.worldPersonId || '';

export function planConfirmedCharacterRetirements({ documents, preparedAt }) {
  assert(Number.isFinite(Date.parse(preparedAt)), 'Gültiger Prüfzeitpunkt erforderlich.');
  const byId = new Map(documents.filter(Boolean).map(document => [idOf(document), document]));
  const entries = [], writes = [], canonicalChecks = new Map();
  for (const retirement of CONFIRMED_CHARACTER_RETIREMENTS) {
    const original = byId.get(retirement.legacyId);
    if (!original) continue;
    const canonical = byId.get(retirement.canonicalCharacterId);
    assert(canonical?.updateTime && original.updateTime, 'Bestätigte Haupt- und Altakte benötigen einen Versionsbeleg.');
    const oldData = decodeFirestoreFields(original.fields || {}), current = decodeFirestoreFields(canonical.fields || {});
    assert.equal(current.name, retirement.canonicalName, 'Hauptakte wurde zwischenzeitlich umbenannt; Identität erneut prüfen.');
    assert(!current.archived, 'Die bestätigte Hauptakte ist archiviert.');
    for (const candidate of [oldData, current]) assert(!worldId(candidate) || worldId(candidate) === retirement.canonicalWorldPersonId,
      'Abweichende explizite Weltperson; Zusammenführung verweigert.');
    const patch = { archived: true, mergeIdentity: characterRetirementMetadata(retirement) };
    if (oldData.archived === true && isDeepStrictEqual(oldData.mergeIdentity, patch.mergeIdentity)) continue;
    const fieldPaths = Object.keys(patch);
    entries.push({ legacyId: retirement.legacyId, canonicalCharacterId: retirement.canonicalCharacterId,
      expectedUpdateTime: original.updateTime, canonicalExpectedUpdateTime: canonical.updateTime,
      beforeSha256: hash(original.fields), canonicalBeforeSha256: hash(canonical.fields), patch,
      rollback: Object.fromEntries(fieldPaths.map(field => [field, Object.hasOwn(original.fields || {}, field)
        ? { restoreRestValue: original.fields[field] } : { deleteField: true }])) });
    writes.push({ update: { name: original.name, fields: encodeFirestoreFields(patch) },
      updateMask: { fieldPaths }, currentDocument: { updateTime: original.updateTime } });
    canonicalChecks.set(canonical.name, { verify: canonical.name, currentDocument: { updateTime: canonical.updateTime } });
  }
  // Tab configuration is deliberately untouched: it contains unrelated users'
  // placements. Archived profiles disappear through the shared list filter;
  // historical links resolve through mergeIdentity to the existing main record.
  return { schema: CHARACTER_RETIREMENT_PLAN_SCHEMA, schemaVersion: 1, preparedAt,
    summary: { retiredDocuments: entries.length, membershipUpdates: 0, canonicalProfileWrites: 0, liveResourceWrites: 0 },
    entries, writes: [...writes, ...canonicalChecks.values()] };
}

export function verifyCharacterRetirementPublication(plan, beforeDocuments, afterDocuments) {
  const before = new Map(beforeDocuments.filter(Boolean).map(document => [document.name, document]));
  const after = new Map(afterDocuments.filter(Boolean).map(document => [document.name, document]));
  for (const write of plan.writes) {
    if (write.verify) {
      assert.deepEqual(after.get(write.verify)?.fields, before.get(write.verify)?.fields, 'Hauptakte wurde verändert.');
      continue;
    }
    const original = before.get(write.update.name);
    const actual = after.get(write.update.name);
    assert(original && actual, 'Prüfdokument fehlt.');
    const expected = { ...original.fields, ...write.update.fields };
    assert.deepEqual(actual.fields, expected, 'Unbeteiligte Profildaten oder Reiterkonfiguration wurden verändert.');
  }
}
