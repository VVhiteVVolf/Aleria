/** Authoring-only IO for country artwork catalogs; never imported by pages. */
import { access, readFile, writeFile } from 'node:fs/promises';

export function createCountryArtCatalogSource(root) {
  const readJson = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
  async function exists(file) {
    try { await access(new URL(file, root)); return true; }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  const jobsFrom = async file => (await readJson(`sources/${file}`)).jobs;
  async function artwork(category, stem) {
    const image = `assets/${category}/previews/${stem}.webp`;
    const fullsize = `assets/${category}/production/${stem}.png`;
    const ready = await exists(image) && await exists(fullsize);
    return { image: ready ? image : null, fullsize: ready ? fullsize : null, ready };
  }
  const emit = (file, exports) => writeFile(new URL(file, root),
    '/** Generated runtime metadata. Authoring prompts remain in sources. */\n'
      + exports.map(([name, value]) => `export const ${name} = ${JSON.stringify(value, null, 2)};`).join('\n') + '\n', 'utf8');
  return { readJson, exists, jobsFrom, artwork, emit };
}
