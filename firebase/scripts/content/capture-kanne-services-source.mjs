import { readFile, writeFile } from 'node:fs/promises';
import { createContentPublicationClient } from './content-publication-client.mjs';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { KANNE_MODULE_ID } from '../../../AleriaAlmanach/modules/krumme-kanne/krumme-kanne-module.mjs';
const target = new URL('../../../AleriaAlmanach/modules/krumme-kanne/source/module-before-services.json', import.meta.url);
try {
  await readFile(target);
  console.log('Die vorhandene Ausgangsfassung bleibt unverändert.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const { request } = await createContentPublicationClient();
  const raw = await request(`/module_store_entries/${KANNE_MODULE_ID}`);
  if (!raw) throw new Error('Das bestehende Kanne-Modul fehlt.');
  const data = decodeFirestoreFields(raw.fields);
  const entry = data.entry || JSON.parse(data.entryJson);
  await writeFile(target, JSON.stringify({ schemaVersion: 1, capturedAt: new Date().toISOString(), entry }, null, 2) + '\n', { flag: 'wx' });
  console.log(`Aktuelle Kanne gesichert: ${entry.pages.length} Seiten.`);
}
