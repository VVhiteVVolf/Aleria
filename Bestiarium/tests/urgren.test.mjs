import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GLANNADEOR_SAGA, GLANNADEOR_LAMENT } from '../../shared/urgren/glannadeor-lore.mjs';
import { GLANNADEOR_PLAY } from '../../shared/urgren/glannadeor-play.mjs';
import { formatGlannadeorLament } from '../../shared/urgren/glannadeor-publications.mjs';
import { PREDATOR_SUBGROUPS } from '../modules/predator-profile/predator-registry.mjs';
import { renderPredatorOverview } from '../modules/predator-profile/predator-overview-template.mjs';
import { renderPredatorReadingLinks } from '../modules/predator-profile/predator-reading-links.mjs';
import { GLANNADEOR_CAST, GLANNADEOR_PRODUCTION } from '../../AleriaAlmanach/modules/gwynthor-theater/theater-glannadeor.mjs';
import { THEATER_PEOPLE } from '../../AleriaAlmanach/modules/gwynthor-theater/theater-people.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const json = async relative => JSON.parse(await readFile(path.join(root, relative), 'utf8'));

test('Bären lead through the Urgren article to Madrúach as the first species', async () => {
  const parent = await json('Bestiarium/tiere/raubtiere/baeren/uebersicht.json');
  const group = parent.atlas.groups.find(item => item.id === 'urgren');
  assert.equal(group.entries[0].href, './urgren/index.html');
  const overview = await json('Bestiarium/tiere/raubtiere/baeren/urgren/uebersicht.json');
  assert.equal(overview.atlas.groups[0].entries[0].id, 'madruach');
  assert.equal(overview.atlas.groups[0].entries[0].href, '../madruach/index.html');
  const html = await readFile(path.join(root, 'Bestiarium/tiere/raubtiere/baeren/urgren/index.html'), 'utf8');
  assert.equal(html, renderPredatorOverview(overview, PREDATOR_SUBGROUPS[0].navigation));
  for (const chapter of GLANNADEOR_SAGA.chapters) assert(html.includes(chapter.title));
  assert(html.includes('href="../index.html">Bären</a>'));
  const profile = await json('Bestiarium/tiere/raubtiere/baeren/madruach/profil.json');
  assert.equal(profile.subgroup.id, 'urgren');
  assert.equal(profile.group.id, 'baeren');
});

test('the saga preserves the accepted sequence and keeps early Cormac distinct', () => {
  const text = JSON.stringify(GLANNADEOR_SAGA);
  for (const phrase of ['sieben Söhne und eine Tochter', 'Monat um Monat', 'Keiner kehrte zurück', 'Fear Doirich', 'bronzene', 'Jahrhunderte', 'fraß ihn', 'Ahnenbaum', 'Tageslicht', 'gewaltsam erzwungenen']) assert(text.includes(phrase), phrase);
  assert.match(text, /widersprach ihm.*Dennoch zog der Sohn hinaus/);
  assert.match(GLANNADEOR_SAGA.identityNote, /Namensvetter/);
  const oath = text.indexOf('Alles, was diesen Bären');
  assert(oath > text.indexOf('Ein alter Rabe'));
  assert(text.indexOf('Die Feuerprobe des Sohnes') > oath);
  assert(text.indexOf('Der Baum ohne Morgen') > text.indexOf('Der Reif im Blut'));
});

test('the song is a complete editable original with repeated chorus and final lament', async () => {
  assert.equal(GLANNADEOR_LAMENT.verses.length, 18);
  assert(GLANNADEOR_LAMENT.verses.every(lines => lines.length === 4));
  const text = await readFile(path.join(root, 'Bestiarium/tiere/raubtiere/baeren/urgren/unter-eichen-unter-stein.txt'), 'utf8');
  assert.equal(text, formatGlannadeorLament());
  assert.equal(text.match(/^Kehrvers$/gm).length, 6);
  assert(text.includes('ich werde deine Eiche sein.'));
  assert(text.includes('kein überliefertes irisches Lied'));
});

test('five playable acts use the existing cast and preserve the ending', () => {
  assert.equal(GLANNADEOR_PLAY.acts.length, 5);
  assert(GLANNADEOR_PLAY.acts.every(act => act.scenes.every(scene => scene.direction && scene.lines.length)));
  for (const role of GLANNADEOR_CAST) assert(THEATER_PEOPLE.some(person => person.key === role.key && person.name === role.actor));
  assert.equal(new Set(GLANNADEOR_CAST.map(role => role.key)).size, GLANNADEOR_CAST.length);
  assert.match(GLANNADEOR_PRODUCTION.cast, /Aelir als Fear Doirich/);
  assert.match(GLANNADEOR_PRODUCTION.cast, /Roderich als Madra Rua/);
  assert.match(JSON.stringify(GLANNADEOR_PLAY.acts[4]), /Kein lebender Zweig erblickte je das Tageslicht/);
});

test('every publication image, stylesheet and local link resolves', async () => {
  for (const relative of ['Bestiarium/tiere/raubtiere/baeren/urgren/index.html', 'Bestiarium/tiere/raubtiere/baeren/madruach/index.html', 'Bestiarium/tiere/raubtiere/baeren/urgren/klagelied.html', 'AleriaAlmanach/assets/gwynthor-theater/productions/der-eid-von-glannadeor/rollenheft.html']) {
    const html = await readFile(path.join(root, relative), 'utf8');
    for (const [, href] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (href.startsWith('#')) continue;
      const url = new URL(href, 'http://aleria.local/' + relative);
      assert.equal(url.origin, 'http://aleria.local');
      await access(path.join(root, decodeURIComponent(url.pathname)));
    }
  }
});

test('further reading escapes authored links and labels', () => {
  const html = renderPredatorReadingLinks([{ href: '" onfocus="alert(1)', title: '<script>x</script>', description: '<img src=x>' }]);
  assert(!html.includes('<script>'));
  assert(!html.includes('<img src=x>'));
  assert(html.includes('&quot; onfocus=&quot;'));
});
