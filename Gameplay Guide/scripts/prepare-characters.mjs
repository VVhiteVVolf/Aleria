import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { planGameplayGuideRelease } from '../../firebase/functions/scripts/gameplay-guide-release-model.mjs';
import { GAIS_COMPANION } from '../../AleriaAlmanach/modules/creatures/catalog/gais-companion.js';
import { sanitizeCreature, makeCreatureExportPayload } from '../../AleriaAlmanach/modules/creatures/creature-model.js';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';
const root = new URL('../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const write = (path, data) => writeFile(new URL(path, root), JSON.stringify(data, null, 2) + '\n');
const folder = 'Charakter Archiv Exporte/gefaehrten/gameplay-guide-2026-10-13';
await mkdir(new URL(folder + '/', root), { recursive: true });
const registry = await read('CharakterDatenbank/registry.json'), snapshot = await read('CharakterDatenbank/generated/characters.snapshot.json');
const now = new Date().toISOString();
let changes = 0;
for (const id of ['bSYZYAEOwiRgy44f6OmO', 'person--haus-wyrm--gais-wyrm']) {
  const entry = registry.records.find(r => r.firestoreDocumentId === id); assert.ok(entry);
  const path = 'CharakterDatenbank/' + entry.path, record = await read(path);
  const patch = planGameplayGuideRelease(record.character); if (!patch) continue;
  const before = structuredClone(record.character);
  const projected = snapshot.characters.find(c => c.id === id); assert.ok(projected);
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'combatProfile.techniques') { record.character.combatProfile.techniques = value; projected.combatProfile.techniques = structuredClone(value); }
    else { assert.ok(['inventory', 'biography'].includes(key)); record.character[key] = value; projected[key] = structuredClone(value); }
  }
  for (const key of ['hitPoints','resources','conditions','weapons','armorItems','abilities']) assert.deepEqual(record.character.combatProfile[key], before.combatProfile[key]);
  record.character.updatedAt = now; projected.updatedAt = now;
  const overlay = { id, name: record.character.name, updatedAt: now,
    ...(patch.inventory ? { inventory: record.character.inventory } : {}),
    ...(patch.biography ? { biography: record.character.biography } : {}),
    ...(patch['combatProfile.techniques'] ? { combatProfile: record.character.combatProfile } : {}) };
  const sourcePath = `${folder}/${id}-entwurf.json`;
  await write(sourcePath, { type: 'aleria-character', version: 3, exportedAt: now, character: record.character });
  const overlayPath = `Charakter Archiv Exporte/gameplay-guide-${id}-2026-10-13.json`;
  await write(overlayPath, { type: 'aleria-character', version: 3, mergeStrategy: 'replace-exported-fields', exportedAt: now, character: overlay });
  record.sources.firestoreExports.push(overlay);
  const documentIds = record.sources.firestoreExports.map(c => c.id).filter(Boolean);
  record.links.firestore.documentIds = documentIds; record.links.firestore.documents.push({ documentId: id, createdAt: '', updatedAt: now });
  const hash = characterDatabaseContentHash(record.character, record.classification, documentIds);
  record.sync = { ...record.sync, sourceArchive: overlayPath, sourceExportedAt: now, sourceUpdatedAt: now, sourceDocumentIds: documentIds, contentHash: hash };
  projected.localRecord = { ...projected.localRecord, contentHash: hash, firestoreDocumentIds: documentIds };
  entry.contentHash = hash; entry.firestoreDocumentIds = documentIds;
  for (const data of [registry, snapshot]) { data.sourceExportedAt = now; data.sourceOverlays = [...new Set([...(data.sourceOverlays || []), overlayPath])].sort(); }
  await write(path, record); changes++;
}
if (changes) { await write('CharakterDatenbank/registry.json', registry); await write('CharakterDatenbank/generated/characters.snapshot.json', snapshot); }
await write(`${folder}/rabenstolz.json`, makeCreatureExportPayload(sanitizeCreature(GAIS_COMPANION)));
console.log(`Gameplay-Vorbereitung: ${changes} Besitzerakten aktualisiert; Kampfressourcen erhalten.`);
