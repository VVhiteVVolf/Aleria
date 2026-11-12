import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { renderCenyrCounties } from '../modules/cenyr-navigation/counties.mjs';

const registryContext = { window: {} };
vm.runInNewContext(await readFile(new URL('../kontinente.registry.js', import.meta.url), 'utf8'), registryContext);
const page = new URL('../Estryll/Königreich Cenyr/Königreich von Cenyr.html', import.meta.url);
const before = await readFile(page, 'utf8');
const marker = /<!-- cenyr-counties:start -->[\s\S]*?<!-- cenyr-counties:end -->/;
if (!marker.test(before)) throw new Error('Markierter Grafschaftsabschnitt fehlt.');
const after = before.replace(marker, `<!-- cenyr-counties:start -->\n${renderCenyrCounties(registryContext.window.KONTINENTE_REGISTRY)}\n<!-- cenyr-counties:end -->`);
if (process.argv.includes('--check')) {
  if (after !== before) throw new Error('Cenyrs Grafschaftsverweise sind veraltet.');
} else if (after !== before) await writeFile(page, after, 'utf8');
console.log(`Cenyrs neun Grafschaftsverweise ${process.argv.includes('--check') ? 'geprüft' : 'erzeugt'}.`);
