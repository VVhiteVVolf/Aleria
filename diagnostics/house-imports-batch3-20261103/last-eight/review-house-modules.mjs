// Independent local review. Writes only this diagnostic directory.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const batch = new URL('../', import.meta.url);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
const before = readJson(new URL('before-house-pages.json', batch));
const protectedOrigins = readJson(new URL('protected-origin-families.json', batch));
const { FAMILY_REGISTRY } = await import(new URL('Stammbäume/assets/js/data/families.registry.js', root));
const familyById = new Map(FAMILY_REGISTRY.map(row => [row.id, row.family]));
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const sha256 = input => createHash('sha256').update(input).digest('hex');
const graphHash = family => sha256(JSON.stringify(Object.fromEntries(graphKeys.map(key => [key, family[key]]))));
const scan = directory => existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? scan(url) : [url];
}) : [];
const modules = scan(new URL('Estryll/Cenyr/Graue_Weite/', feature)).filter(url => url.pathname.endsWith('/haus.content.mjs'));
const loaded = new Map(await Promise.all(modules.map(async url => {
  const { HOUSE_CONTENT } = await import(url);
  return [HOUSE_CONTENT.id, { content: HOUSE_CONTENT, url }];
})));
const originalImages = new Map([
  ...readJson(new URL('first-seven/image-manifest.json', batch)).filter(row => row.role === 'warrior').map(row => [row.houseId, row.sha256]),
  ...readJson(new URL('downloads.json', import.meta.url)).filter(row => row.role === 'figure').map(row => [row.id, row.sha256])
]);
const rankPatterns = { county: /^Graf$/, barony: /^Baron$/, 'knight-prince': /^Ritterfürst$/, 'dun-tiarna': /^Dún Tiarna(?: \(Baron\))?$/, 'mor-tiarna': /^Mor Tiarna(?: \(Graf\))?$/, unknown: /^(?:Nicht überliefert|Nicht vermerkt|Unbekannt)$/ };
const report = { expected: before.length, available: loaded.size, houses: [], protectedOrigins: [] };
for (const baseline of protectedOrigins) {
  const family = familyById.get(baseline.id);
  report.protectedOrigins.push({ id: baseline.id, graphUnchanged: graphHash(family) === baseline.graphFingerprint, profileUnchanged: JSON.stringify(family.document.houseProfile) === JSON.stringify(baseline.profile), revisionUnchanged: family.extensions.sourceRevision === baseline.sourceRevision });
}
for (const baseline of before) {
  const family = familyById.get(baseline.id), entry = loaded.get(baseline.id);
  const row = { id: baseline.id, checks: [], warnings: [] };
  const check = (name, passed) => row.checks.push({ name, passed: Boolean(passed) });
  check('existing graph unchanged', graphHash(family) === baseline.graphFingerprint);
  check('canonical profile unchanged', JSON.stringify(family.document.houseProfile) === JSON.stringify(baseline.profile));
  check('module present', entry);
  if (entry) {
    const { content, url } = entry;
    check('canonical seat', content.profile.seat === baseline.profile.seat);
    check('canonical county', content.county === baseline.profile.county);
    check('canonical rank', rankPatterns[baseline.profile.rankId]?.test(content.profile.highestTitle));
    check('military profile omitted', content.omitMilitaryProfile === true && ['troopStrength', 'tiarna', 'kerns', 'fleet'].every(key => content.profile[key] === ''));
    const prose = JSON.stringify([content.sections, content.biographySummary, content.trivia]);
    check('source genealogy and empty prompts absent', !/<table|tumblr_otwjgn|Titel hier einfügen|Dialog von Figur|Platzhalter:/i.test(prose));
    check('no statistical military headcounts', !/\b(?:[1-9]\d{2,}|\d{1,3}(?:\.\d{3})+)\s*(?:Krieger|Waffenknechte|Stadtwachen|Kriegsschiffe|Ritter\b)/i.test(prose));
    const cards = [content.founder, ...(content.heads || []), ...(content.heirs || []), ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
    check('person cards bind existing named people', cards.every(card => card.id && card.familyId && !/^(?:\?+|Name|Nicht benannt)\s*$/i.test(card.name || '') && familyById.get(card.familyId)?.persons.some(person => person.id === card.id)));
    const imageUrl = content.images.scene && new URL(content.images.scene, feature);
    check('main figure resolves locally', imageUrl && existsSync(imageUrl));
    check('original figure bytes preserved', imageUrl && existsSync(imageUrl) && sha256(readFileSync(imageUrl)) === originalImages.get(baseline.id));
    const dataUrl = new URL('haus.data.js', url);
    check('generated page data present', existsSync(dataUrl));
    if (existsSync(dataUrl)) {
      const context = { window: {} };
      vm.runInNewContext(readFileSync(dataUrl, 'utf8'), context);
      const frame = new URL(context.window.HAEUSER_DATA.familyTreeEmbed.src, feature);
      check('existing family read-only iframe', frame.searchParams.get('family') === baseline.id && frame.searchParams.get('mode') === 'view' && frame.pathname === new URL('Stammbäume/Stammbaum.html', root).pathname);
    }
    if (baseline.id === 'haus-lyfant-caer-asgwrn') check('Cledwyn leads southern Lyfant line', content.currentHead === 'Cledwyn Lyfant');
    if (baseline.id === 'haus-tanwyn') check('Tanwyn remains historical without a current ruler', !content.currentHead && !content.profile.seat && content.extinct === true);
    for (const expression of [/\b(?:vor wenigen Wochen|seit zwei Jahrzehnten|in den letzten 20 Jahren)\b/gi, /\b\d+\s+Jahre(?:n)?\b/gi]) {
      for (const match of prose.matchAll(expression)) row.warnings.push(`Manual context review: ${match[0]}`);
    }
  }
  report.houses.push(row);
}
report.failed = report.houses.flatMap(row => row.checks.filter(check => !check.passed).map(check => `${row.id}: ${check.name}`));
for (const row of report.protectedOrigins) if (!row.graphUnchanged || !row.profileUnchanged || !row.revisionUnchanged) report.failed.push(`${row.id}: protected origin changed`);
report.complete = loaded.size === before.length && report.failed.length === 0;
writeFileSync(new URL('module-review.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ complete: report.complete, expected: report.expected, available: report.available, failed: report.failed, warnings: report.houses.flatMap(row => row.warnings.map(warning => `${row.id}: ${warning}`)) }));
process.exitCode = report.complete ? 0 : 1;
