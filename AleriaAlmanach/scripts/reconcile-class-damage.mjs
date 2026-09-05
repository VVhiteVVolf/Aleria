import { readFile, writeFile } from 'node:fs/promises';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';

const root = new URL('../../Charakter%20Archiv%20Exporte/', import.meta.url);
const check = process.argv.includes('--check');
let updated = 0;
for (const file of ['fenrir-varulv.json', 'freya-skald.json', 'rhiannon-draig.json']) {
  const url = new URL(file, root);
  const exported = JSON.parse(await readFile(url, 'utf8'));
  const previous = exported.character.combatProfile;
  const next = reconcileClassDamageRevisions(previous);
  if (JSON.stringify(previous) === JSON.stringify(next)) continue;
  if (check) throw new Error(`${file} enthält noch die früheren Schadensregeln.`);
  exported.character.combatProfile = next;
  await writeFile(url, `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
  updated++;
}
console.log(`Schadensregeln für Skjaldr, Skalde und Magier geprüft; ${updated} Bögen aktualisiert.`);
