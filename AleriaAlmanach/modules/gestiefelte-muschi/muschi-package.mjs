// Node-only editorial loader; venue models receive their inputs explicitly.
import { readFile } from 'node:fs/promises';
import { buildPenderyn } from '../brewer-guilds/penderyn-model.mjs';
import { buildTeyrngarch } from '../brewer-guilds/teyrngarch-model.mjs';
import { buildGestiefelteMuschi } from './muschi-module.mjs';
export async function buildMuschiPackage() {
  const source = name => readFile(new URL(`../brewer-guilds/sources/${name}.json`, import.meta.url), 'utf8').then(JSON.parse);
  const [penderyn, teyrngarch] = await Promise.all([source('penderyn'), source('teyrngarch')]);
  return buildGestiefelteMuschi([buildPenderyn(penderyn), buildTeyrngarch(teyrngarch)]);
}
