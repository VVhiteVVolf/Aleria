import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { NORTHERN_FARMS } from '../../shared/gwynthor-northern-farms/northern-farms.mjs';
import { projectNorthernFarmPins } from '../modules/northern-farms/northern-farm-pins.mjs';

const args = process.argv.slice(2);
assert.ok(args.length === 1 && ['--check', '--write'].includes(args[0]), 'Use --check or --write.');
const target = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json', import.meta.url);
const original = await readFile(target, 'utf8');
const map = JSON.parse(original);
const pins = map.state.pins;
for (const farm of NORTHERN_FARMS) {
  const matches = pins.filter(pin => pin.id === farm.pinId);
  assert.equal(matches.length, 1, farm.pinId);
  assert.equal(matches[0].title, farm.seat, farm.pinId);
}
const projected = projectNorthernFarmPins(pins);
if (JSON.stringify(pins) !== JSON.stringify(projected)) {
  assert.equal(args[0], '--write', 'Nordhöfe-Projektion veraltet.');
  map.state.pins = projected;
  map.revision += 1;
  map.updatedAt = new Date().toISOString();
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  await writeFile(target, (JSON.stringify(map, null, 2) + '\n').replaceAll('\n', newline));
}
console.log(`${NORTHERN_FARMS.length} Nordhöfe abgeglichen.`);
