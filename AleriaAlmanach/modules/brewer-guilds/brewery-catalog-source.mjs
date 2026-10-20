// Node-only editorial adapter. Consumers receive current generated catalogues;
// no historical snapshots or hand-maintained second list of brewery prices.
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

export async function readBreweryCatalogs() {
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(await readFile(new URL('./brewer-guilds-data.js', import.meta.url), 'utf8'), context);
  return structuredClone(context.SECTIONS.flatMap(section => section.entries || []));
}
