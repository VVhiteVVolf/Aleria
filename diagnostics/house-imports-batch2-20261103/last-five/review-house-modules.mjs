// Local independent review only. No production data or files are changed.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const batch = new URL('../', import.meta.url);
const { FAMILY_REGISTRY } = await import(new URL('Stammbäume/assets/js/data/families.registry.js', root));
const { WEIDEBUCHT_HOUSE_PROFILES } = await import(new URL('Stammbäume/assets/js/data/weidebucht-house-profiles.js', root));
const before = JSON.parse(readFileSync(new URL('before-house-pages.json', batch), 'utf8'));
const firstImages = JSON.parse(readFileSync(new URL('first-five/image-manifest.json', batch), 'utf8'));
const lastImages = JSON.parse(readFileSync(new URL('downloads.json', import.meta.url), 'utf8'));
const originalImages = new Map([
  ...firstImages.filter(row => row.role === 'warrior').map(row => [row.houseId, row.sha256]),
  ...lastImages.filter(row => row.role === 'source-warrior').map(row => [`haus-${row.slug}`, row.sha256])
]);
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const sha256 = input => createHash('sha256').update(input).digest('hex');
const scan = directory => existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? scan(url) : [url];
}) : [];
const modules = scan(new URL('Estryll/Cenyr/Weidebucht/', feature))
  .filter(url => url.pathname.endsWith('/haus.content.mjs'));
const loaded = new Map(await Promise.all(modules.map(async url => {
  const { HOUSE_CONTENT } = await import(url);
  return [HOUSE_CONTENT.id, { content: HOUSE_CONTENT, url }];
})));
const report = { expected: before.length, available: loaded.size, results: [] };
const titleByRank = { county: 'Graf', barony: 'Baron', 'knight-prince': 'Ritterfürst', commoner: 'Bürger', laird: 'Laird', 'mor-tiarna': 'Mor Tiarna' };
for (const baseline of before) {
  const record = FAMILY_REGISTRY.find(row => row.id === baseline.id);
  const family = record.family;
  const row = { id: baseline.id, checks: [], warnings: [] };
  const check = (name, passed, detail) => row.checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });
  check('existing family graph unchanged', sha256(JSON.stringify(Object.fromEntries(graphKeys.map(key => [key, family[key]])))) === baseline.graphFingerprint);
  const entry = loaded.get(baseline.id);
  check('authored module present', entry);
  if (entry) {
    const { content, url } = entry;
    const profile = WEIDEBUCHT_HOUSE_PROFILES[baseline.id.replace(/^haus-/, '')];
    check('canonical current seat', content.profile.seat === profile.seat);
    check('canonical county', content.county === profile.county);
    check('canonical rank', content.profile.highestTitle === titleByRank[profile.rankId]);
    check('military profile omitted', content.omitMilitaryProfile === true && ['troopStrength', 'tiarna', 'kerns', 'fleet'].every(key => content.profile[key] === ''));
    const strings = JSON.stringify([content.sections, content.biographySummary, content.trivia]);
    check('no imported source genealogy table', !/<table|tumblr_otwjgn|Titel hier einfügen|Dialog von Figur|Platzhalter:/i.test(strings));
    check('no statistical military headcounts', !/\b(?:[1-9]\d{2,}|\d{1,3}(?:\.\d{3})+)\s*(?:Krieger|Waffenknechte|Stadtwachen|Kriegsschiffe|Ritter\b)/i.test(strings));
    const cards = [content.founder, ...(content.heads || []), ...(content.heirs || []), ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
    check('person cards resolve existing named people', cards.every(card => card.id && card.familyId && !/^(?:\?+|Name|Gründer|Nicht benannt)\s*$/i.test(card.name || '') && FAMILY_REGISTRY.find(f => f.id === card.familyId)?.family.persons.some(p => p.id === card.id)));
    if (baseline.id === 'haus-trisceil') check('Wylan founder is not presented as Trisceil founder', content.founder?.id !== 'melwas-wylan' && !(content.figures || []).some(card => card.id === 'melwas-wylan' && /Gründer/i.test(card.role)));
    if (baseline.id === 'haus-tannau') check('Tannau remains a civilian house', /Bürger/i.test(content.type));
    const original = originalImages.get(baseline.id);
    const imageUrl = content.images.scene && new URL(content.images.scene, feature);
    check('main figure resolves locally', imageUrl && existsSync(imageUrl));
    if (original && imageUrl && existsSync(imageUrl)) check('original source figure preserved byte for byte', sha256(readFileSync(imageUrl)) === original);
    const pageContext = { window: {} };
    const pageUrl = new URL('haus.data.js', url);
    if (existsSync(pageUrl)) {
      vm.runInNewContext(readFileSync(pageUrl, 'utf8'), pageContext);
      const iframe = new URL(pageContext.window.HAEUSER_DATA.familyTreeEmbed.src, feature);
      check('canonical read-only family iframe', iframe.searchParams.get('family') === baseline.id && iframe.searchParams.get('mode') === 'view' && iframe.pathname === new URL('Stammbäume/Stammbaum.html', root).pathname);
    } else check('generated page data present', false);
    for (const expression of [/\b(?:vor wenigen Wochen|seit zwei Jahrzehnten|in den letzten 20 Jahren)\b/gi, /\b(?:Baronie Esgairmor|Grafschaft Melwas Au|Wylan O'Dewet|Wylan O'Penrith)\b/gi, /\b\d+\s+Jahre(?:n)?\b/gi]) {
      for (const match of strings.matchAll(expression)) row.warnings.push(`Manual prose review: ${match[0]}`);
    }
  }
  report.results.push(row);
}
report.failed = report.results.flatMap(row => row.checks.filter(check => !check.passed).map(check => `${row.id}: ${check.name}`));
report.complete = loaded.size === before.length && report.failed.length === 0;
const target = new URL('module-review.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ complete: report.complete, available: report.available, expected: report.expected, failed: report.failed, warnings: report.results.flatMap(row => row.warnings.map(warning => `${row.id}: ${warning}`)), report: fileURLToPath(target) }));
process.exitCode = report.complete ? 0 : 1;
