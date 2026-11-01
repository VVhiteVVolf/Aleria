import { readFile } from 'node:fs/promises';
const sources = JSON.parse(await readFile(new URL('./baseline-sources.json', import.meta.url), 'utf8'));
export async function load(url, context, nextLoad) {
  const source = sources[url.split('?')[0]];
  return source === undefined ? nextLoad(url, context)
    : { format: 'module', source, shortCircuit: true };
}
