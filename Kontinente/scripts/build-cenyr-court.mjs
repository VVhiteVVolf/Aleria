import { readFile, writeFile } from 'node:fs/promises';
import { renderOfficesPage } from '../modules/cenyr-court/offices-template.mjs';
import { renderSuccessionPage } from '../modules/cenyr-court/succession-template.mjs';

const check = process.argv.includes('--check');
const pages = [['aemter.html', renderOfficesPage()], ['kronfolge.html', renderSuccessionPage()]];
for (const [name, html] of pages) {
  const file = new URL(`../Estryll/Königreich Cenyr/${name}`, import.meta.url);
  if (check) {
    const current = await readFile(file, 'utf8');
    if (current !== html) throw new Error(`${name} ist veraltet. node Kontinente/scripts/build-cenyr-court.mjs ausführen.`);
  } else {
    await writeFile(file, html, 'utf8');
  }
}
console.log(`Cenyr: ${pages.length} Seiten ${check ? 'geprüft' : 'erzeugt'}.`);
