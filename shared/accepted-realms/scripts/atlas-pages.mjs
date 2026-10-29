import { realms } from '../catalog.mjs';
import { renderContinentPage, continents, escapeHtml as escape } from '../../../Kontinente/modules/continent-overview/page-shell.mjs';

const descriptions = {
  aldingen: 'Silber, Pferdezucht und Seehäfen prägen das Großherzogtum der Aldinger.',
  goldmund: 'Goldreiches Gebirgsland der Alwener, geprägt von Banken und kaiserlichem Erbe.',
  weisenfluh: 'Das Erlenkönigreich mit fünf Provinzen und seinen albischen Wurzeln.',
  moinneach: 'Zehn Stadtgebiete zwischen Mangroven und Schwarzwasser. Fürstensitz: Gergonax.',
  iathneach: 'Albisches Fürstentum zwischen Waldtälern und Inselküste. Hauptstadt: Botharin.',
  deitheach: 'Früheres albisches Fürstentum. Seit zwanzig Jahren von der Triarchie beherrscht.',
  triarchie: 'Besetzte Teile Aldingens und Iathneachs unter der Herrschaft dreier Machthaber.',
};
function realmCard(realm) {
  const href = escape(realm.territories[0].href);
  return `<article class="realm-card${realm.historical ? ' realm-card--faded' : ''}" role="listitem">
    <h3><a href="${href}">${escape(realm.title)}</a></h3>
    ${realm.crest ? `<span class="orte-image-slot realm-icon-slot" data-orte-image-key="${realm.id}-landeszeichen"><a class="realm-card-link" href="${href}"><img src="${escape(realm.crest)}" width="210" height="210" alt="Landeszeichen ${escape(realm.name)}" loading="lazy"></a></span>` : '<span class="realm-open-emblem" aria-label="Landeszeichen noch nicht benannt">?</span>'}
    <p class="realm-card-meta">${escape(descriptions[realm.id])}</p>
  </article>`;
}
export async function buildAtlasPages(output, read) {
  const entries = [];
  for (const name of ['Lothir', 'Aldervan']) {
    const continent = continents.find(c => c.name === name), id = `kontinent-${continent.id}`;
    const countries = realms.filter(r => r.continent === name);
    const groups = [
      { id: `${continent.id}-reiche`, title: 'Länder und Herrschaften', items: countries.filter(r => !r.historical) },
      { id: `${continent.id}-historisch`, title: 'Historische Länder', items: countries.filter(r => r.historical) },
    ].filter(group => group.items.length);
    const content = groups.map(g => `<section class="continent-realm-section" aria-labelledby="${g.id}"><h2 id="${g.id}" data-orte-explicit-inline>${g.title}</h2><div class="realm-grid" role="list">${g.items.map(realmCard).join('\n')}</div></section>`).join('\n');
    await output(`Kontinente/${name}/${name}.html`, renderContinentPage({ continent, content, chapters: groups }));
    const hierarchy = [{ type: 'Sammlung', name: 'Kontinente', slug: 'kontinente' }, { type: 'Kontinent', name, slug: continent.id }];
    await output(`Kontinente/${name}/kontinent.data.js`, `window.KONTINENTE_DATA = ${JSON.stringify({ meta: { id, title: `Kontinent ${name} – Aleria`, type: 'Kontinent', status: 'Entwurf', template: 'kontinent' }, name: `Kontinent ${name}`, hierarchy, canonicalPath: `Kontinente > ${name}` }, null, 2)};\nwindow.ORT_DATA = window.KONTINENTE_DATA;\n`);
    entries.push({ id, slug: continent.id, aliases: [continent.id], name: `Kontinent ${name}`, type: 'Kontinent', page: `${name}/${name}.html`, data: `${name}/kontinent.data.js`, hierarchy });
  }
  const file = 'Kontinente/kontinente.registry.js', registry = await read(file);
  const block = `  // BEGIN ACCEPTED_CONTINENTS_GENERATED\n${entries.map(e => '  ' + JSON.stringify(e) + ',').join('\n')}\n  // END ACCEPTED_CONTINENTS_GENERATED\n`;
  const pattern = /  \/\/ BEGIN ACCEPTED_CONTINENTS_GENERATED\r?\n[\s\S]*?  \/\/ END ACCEPTED_CONTINENTS_GENERATED\r?\n/;
  await output(file, pattern.test(registry) ? registry.replace(pattern, block) : registry.replace(/(window\.KONTINENTE_REGISTRY\s*=\s*\[\r?\n)/, '$1' + block));
}
