import fs from 'node:fs/promises';
import { reviewedFief } from '../../Stammbäume/assets/js/modules/albic-territories/fief-catalog.js';

const root = new URL('../', import.meta.url), check = process.argv.includes('--check');
const realms = ['Leitheach', 'Aislearneach', 'Dunfal', 'Blaithneach', 'Faelaorn', 'Ceitheach'];
const read = async path => JSON.parse(await fs.readFile(new URL(path, root), 'utf8'));

for (const realm of realms) {
  const { territories } = await read(realm + '/territories.import.json');
  const byId = new Map(territories.map(t => [t.id, t]));
  for (const file of ['regions.source.json', 'places.source.json']) {
    let source;
    try { source = await read(realm + '/' + file); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    function review(value) {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(review); return; }
      const territory = byId.get(value.dominionId);
      if (territory && reviewedFief(territory.id)) {
        value.name = territory.name;
        if ('shortName' in value) value.shortName = territory.name;
      }
      // Only territorial display metadata changes. Original prose and source
      // captures remain verbatim, as do every coordinate and geometry path.
      for (const [key, child] of Object.entries(value)) if (!['text', 'source', 'sourceRef'].includes(key)) review(child);
    }
    review(source);
    if (file === 'places.source.json') {
      // An explicit local ruler can override inherited heraldry. Respect that
      // ruler while replacing a stale copy of its former regional banner.
      for (const place of source.descriptions || []) if (place.ruler?.familyId) {
        const territory = territories.find(t => t.familyId === place.ruler.familyId && reviewedFief(t.id));
        if (territory) { place.ruler.banner = territory.banner; place.ruler.bannerHref = territory.href; }
      }
    }
    const path = new URL(realm + '/' + file, root), content = JSON.stringify(source, null, 2) + '\n';
    if (check) {
      if (await fs.readFile(path, 'utf8') !== content) throw new Error(`Veraltete Gebietsbezeichnungen: ${realm}/${file}`);
    } else await fs.writeFile(path, content);
  }
}
console.log('Albische Grenzbeschriftungen und örtliche Banner abgeglichen; Quelltexte und Geometrien erhalten.');
