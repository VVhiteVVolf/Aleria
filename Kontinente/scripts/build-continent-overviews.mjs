import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderContinentPage, continents, continentBanner, escapeHtml } from '../modules/continent-overview/page-shell.mjs';
import { buildAtlasPages } from '../../shared/accepted-realms/scripts/atlas-pages.mjs';

const root = new URL('../../', import.meta.url), check = process.argv.includes('--check');
const read = file => readFile(new URL(file, root), 'utf8');
async function output(file, text) {
  const url = new URL(file, root), previous = await readFile(url, 'utf8').catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
  if (check) { if (previous !== text) throw Error(`Kontinentübersicht veraltet: ${file}`); }
  else if (previous !== text) { await mkdir(new URL('./', url), { recursive: true }); await writeFile(url, text); }
}
const continentCard = c => `<article class="continent-card" role="listitem">
  <h2 data-orte-explicit-inline>${escapeHtml(c.name)}</h2>
  <span class="orte-image-slot continent-banner-slot" data-orte-image-key="${c.imageKey}" data-orte-image-label="Banner ${c.name}" data-orte-image-width="100" data-orte-image-format="banner" data-orte-image-max-height="280" aria-label="Banner ${c.name}">
    ${c.href ? `<a class="continent-card-link" href="${c.href}" aria-label="Kontinent ${c.name} öffnen">` : ''}<img src="${continentBanner(c)}" alt="Banner ${c.name}" loading="lazy">${c.href ? '</a>' : ''}
  </span><span class="atlas-entry-status">${c.href ? 'Länder entdecken ↗' : 'Noch kein Eintrag'}</span>
</article>`;
await output('Kontinente/index.html', renderContinentPage({ content: `<div class="atlas-register-heading"><span>Das Kontinentregister</span><span>VIII Kontinente</span></div><div class="continent-grid continent-grid--overview" role="list">${continents.map(continentCard).join('\n')}</div>` }));
const body = await read('Kontinente/modules/continent-overview/estryll-body.source.html');
const chapters = [...body.matchAll(/<h2 id="([^"]+)"[^>]*>([^<]+)<\/h2>/g)].map(([, id, title]) => ({ id, title: title.replaceAll('&uuml;', 'ü').replaceAll('&Uuml;', 'Ü') }));
await output('Kontinente/Estryll/Estryll.html', renderContinentPage({ continent: continents.find(c => c.id === 'estryll'), content: body, chapters,
  extraScripts: ['/Kontinente/modules/alben/continent-links.mjs?v=alben-20261022a'] }));
await buildAtlasPages(output, read);
console.log(`Vier Kontinentübersichten ${check ? 'geprüft' : 'mit gemeinsamer Atlas-Schale erzeugt'}.`);
