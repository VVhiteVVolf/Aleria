// Read-only check for explicit title/type conflicts; generic and unknown labels stay uninterpreted.
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const rows = JSON.parse(fs.readFileSync(new URL('inventory-current.json', import.meta.url), 'utf8'));
const metadata = new Map(JSON.parse(fs.readFileSync(new URL('../coverage-audit/public-family-metadata.json', import.meta.url), 'utf8')).map(row => [row.id, row]));
const forbidden = {
  commoner: /ritter|baron|gr[aä]f|k[oö]nig|adels/i,
  knight: /ritterf[üu]rst|baron|gr[aä]f|k[oö]nig|b[üu]rger/i,
  'knight-prince': /baron|gr[aä]f|k[oö]nig|b[üu]rger/i,
  barony: /ritterf[üu]rst|gr[aä]f|k[oö]nig|b[üu]rger/i,
  county: /ritterf[üu]rst|baron|k[oö]nig|b[üu]rger/i,
  royal: /ritterf[üu]rst|baron|gr[aä]f|b[üu]rger/i,
};
const results = [];
for (const row of rows) {
  const { HOUSE_CONTENT: content } = await import(new URL(row.contentPath, root));
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(new URL(row.dataPath, root), 'utf8'), context);
  const page = context.window.HAEUSER_DATA;
  const rankId = metadata.get(row.id).houseProfile.rankId;
  const labels = {
    authoredType: content.type || '',
    generatedType: page.meta.type || '',
    authoredHighestTitle: content.profile.highestTitle || '',
    generatedHighestTitle: page.profile.highestTitle || '',
    authoredRank: content.profile.rank || '',
    generatedRank: page.profile.rank || '',
  };
  const conflicts = Object.entries(labels).filter(([, value]) => forbidden[rankId]?.test(value)).map(([field, value]) => ({ field, value }));
  results.push({ familyId: row.id, canonicalRankId: rankId, labels, conflicts });
}
const conflicts = results.filter(row => row.conflicts.length);
const result = {
  publicHousesChecked: results.length,
  method: 'Only explicit contradictions in authored/generated type and title labels. Generic Ritterhaus/Clan/Familie and unknown ranks do not imply a different rank.',
  conflicts,
  passed: conflicts.length === 0,
  houses: results,
};
fs.writeFileSync(new URL('final-rank-type-check.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ publicHousesChecked: results.length, conflicts, passed: result.passed }));
process.exitCode = result.passed ? 0 : 1;
