import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);
const html = fs.readFileSync(new URL('Kontinente/Estryll/Estryll.html', root), 'utf8');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('Kontinente/kontinente.registry.js', root), 'utf8'), context);
const realms = context.window.KONTINENTE_REGISTRY.filter(entry => entry.page
  && entry.hierarchy?.length === 3 && entry.hierarchy.some(part => part.slug === 'estryll'));
const articles = [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);
const destination = href => decodeURIComponent(new URL(href, 'https://aleria.local/Kontinente/Estryll/Estryll.html').pathname);
const links = markup => [...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(match => ({ href: destination(match[1]), body: match[2] }));

test('every created Estryll realm is reachable through both its name and its banner', () => {
  assert.ok(realms.length >= 11);
  for (const realm of realms) {
    const target = '/Kontinente/' + realm.page;
    const cards = articles.filter(article => links(article).some(link => link.href === target));
    assert.equal(cards.length, 1, `${realm.name}: one continent entry`);
    const card = cards[0];
    const heading = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] || '';
    assert.ok(links(heading).some(link => link.href === target), `${realm.name}: linked name`);
    assert.ok(links(card).some(link => link.href === target && /<img\b/.test(link.body)), `${realm.name}: linked banner`);
    assert.ok(fs.existsSync(new URL('.' + target, root)), target);
  }
});

test('all continent links resolve without exposing the experimental Uathneach proposal', () => {
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (href.startsWith('#')) continue;
    assert.ok(fs.existsSync(new URL('.' + destination(href), root)), href);
  }
  assert.ok(html.includes('/Kontinente/Alben/Der Schild von Ailith.html'));
  assert.ok(html.includes('id=leitheach'));
  assert.doesNotMatch(html, /\/Vorschau\/|uathneach-vorschau/);
});
