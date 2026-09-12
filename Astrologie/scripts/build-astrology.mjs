import { readFile, writeFile } from 'node:fs/promises';
import '../../AleriaAlmanach/modules/core/aleria-calendar.js';
import { createEphemeris } from '../modules/ephemeris/ephemeris-model.mjs';
import { readAstrologyDeities } from '../modules/zodiac/zodiac-repository.mjs';
import { renderAstrologyPage } from '../modules/page/astrology-template.mjs';

const calendar = globalThis.AleriaCalendar;
const content = renderAstrologyPage({ deities: readAstrologyDeities(), calendar, sky: createEphemeris(calendar).at(calendar.current()) });
const path = new URL('../index.html', import.meta.url);
if (process.argv.includes('--check')) {
  const current = await readFile(path, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
  if (current.replace(/\r\n/g, '\n') !== content) {
    console.error('Astrologie/index.html ist nicht aktuell. Bitte build:astrology ausführen.');
    process.exitCode = 1;
  } else console.log('Astrologieseite geprüft.');
} else {
  await writeFile(path, content, 'utf8');
  console.log('Astrologieseite erzeugt.');
}
