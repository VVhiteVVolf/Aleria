import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderWellenruhPage } from '../modules/battles/battle-render.mjs';

const file = new URL('../Schlachten/Erste-Seeschlacht-bei-Wellenruh.html', import.meta.url);
const html = renderWellenruhPage();
if (process.argv.includes('--check')) {
  if (await readFile(file, 'utf8') !== html) throw new Error('Die Schlachtseite ist nicht aktuell. node Ereignisse/scripts/build-battles.mjs ausführen.');
  console.log('Schlachtseite aktuell.');
} else {
  await mkdir(new URL('../Schlachten/', import.meta.url), { recursive: true });
  await writeFile(file, html);
  console.log('Schlachtseite Wellenruh erstellt.');
}
