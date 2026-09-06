import { readFile, readdir, writeFile } from 'node:fs/promises';
import { getMaximumHitPoints, getHitPointProgression, upgradeCharacterHitPoints, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const root = new URL('../../Charakter Archiv Exporte/', import.meta.url);
const check = process.argv.includes('--check');
let count = 0;
for (const file of await readdir(root)) {
  if (!file.endsWith('.json')) continue;
  const path = new URL(encodeURIComponent(file), root);
  const data = JSON.parse(await readFile(path, 'utf8'));
  // Archive snapshots remain historical; individual exports provide current overlays.
  if (data.type !== 'aleria-character' || !data.character?.combatProfile) continue;
  const previous = data.character.combatProfile;
  const next = upgradeCharacterHitPoints(previous);
  next.hitPoints.vitality.legacyIncrease ??= getHitPointProgression(next).vitality;
  data.character.combatProfile = sanitizeCharacterCombatProfile(next);
  if (/^\d+\s*\/\s*\d+\s*(?:TP|LP)?$/.test(data.character.inventory?.hitpoints || '')) {
    data.character.inventory.hitpoints = `${next.hitPoints.current ?? getMaximumHitPoints(next)} / ${getMaximumHitPoints(next)} LP`;
  }
  const normalized = `${JSON.stringify(data, null, 2)}\n`;
  if (normalized !== await readFile(path, 'utf8')) {
    if (check) throw new Error(`Vitalität nicht abgeglichen: ${file}`);
    await writeFile(path, normalized);
  }
  console.log(`${data.character.name}: ${next.hitPoints.current ?? getMaximumHitPoints(next)}/${getMaximumHitPoints(next)} LP`);
  count += 1;
}
console.log(`${count} bestehende Einzelbögen ${check ? 'geprüft' : 'abgeglichen'}.`);
