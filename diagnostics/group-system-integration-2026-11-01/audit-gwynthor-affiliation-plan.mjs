// Read-only evaluation of the reconciler's projection, stopping before its
// changed/check/write branch. Product map and source files are never written.
import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
const sourceUrl = new URL('../../Karten/tools/reconcile-gwynthor-affiliations.mjs', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const boundary = source.indexOf('const changed = JSON.stringify(state)');
if (boundary < 0) throw Error('The known read-only projection boundary has changed.');
const projection = source.slice(0, boundary).replace(/^import .*;\r?$/gm, '').replaceAll('import.meta.url', 'sourceUrl');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const evaluate = new AsyncFunction('readFile', 'runInNewContext', 'getRegisteredFamily', 'sourceUrl', `${projection}\nreturn { original, data, reviewed };`);
const { original, data, reviewed } = await evaluate(readFile, runInNewContext, getRegisteredFamily, sourceUrl);
const previousReview = JSON.parse(await readFile(new URL('../../Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/house-affiliation-review.json', import.meta.url), 'utf8'));
function fields(before, after) {
  return Object.fromEntries([...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map(key => [key, { before: before[key] ?? null, expected: after[key] ?? null }]));
}
function records(key) {
  const before = new Map(original.state[key].map(row => [row.id, row]));
  return data.state[key].flatMap(row => {
    const previous = before.get(row.id);
    const changes = previous ? fields(previous, row) : { added: row };
    return Object.keys(changes).length ? [{ id: row.id, title: row.title || row.name || '', changes }] : [];
  });
}
const report = { inputRevision: original.revision, pinCount: original.state.pins.length,
  pins: records('pins'), dominions: records('dominions'),
  otherChangedStateFields: Object.keys(data.state).filter(key => !['pins', 'dominions'].includes(key) && JSON.stringify(original.state[key]) !== JSON.stringify(data.state[key])),
  positionsPreserved: data.state.pins.every((pin, index) => ['id', 'x', 'y'].every(key => pin[key] === original.state.pins[index][key])),
  sourceFamilies: reviewed.filter(row => records('pins').some(pin => pin.id === row.pinId) || records('dominions').some(node => node.id === row.dominionId)).map(row => ({ pinId: row.pinId, familyId: row.familyId,
    houseProfile: row.houseProfile, dominionId: row.dominionId })),
  reviewChanges: reviewed.flatMap(row => {
    const old = previousReview.pins.find(previous => previous.pinId === row.pinId);
    const changes = old ? fields(old, row) : { added: row };
    return Object.keys(changes).length ? [{ pinId: row.pinId, familyId: row.familyId, changes }] : [];
  }) };
await writeFile(new URL('gwynthor-affiliation-plan.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, sourceFamilies: report.sourceFamilies.map(({ houseProfile, ...row }) => row) }, null, 2));
