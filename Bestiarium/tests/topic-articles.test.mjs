import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_TOPIC_GROUPS } from '../modules/topic-board/topic-board-data.js';
import { TOPIC_ARTICLE_IDS } from '../modules/topic-article/topic-article-registry.mjs';
import { renderTopicArticle } from '../modules/topic-article/topic-article-template.mjs';

const expected = {
  'kalpa-morgath': { title: 'Morgath', sections: 6, facts: 9, paragraphs: 12 },
  'risse-manat': { title: 'Manât', sections: 7, facts: 9, paragraphs: 7 },
  geweihte: { title: 'Geweihte', sections: 5, facts: 6, paragraphs: 9 },
  gefallene: { title: 'Gefallene', sections: 5, facts: 6, paragraphs: 20 },
  lichtalben: { title: 'Celestiale', sections: 5, facts: 6, paragraphs: 21 },
  dunkelalben: { title: 'Infernale', sections: 5, facts: 6, paragraphs: 6 }
};

function paragraphCount(sections) {
  return sections.reduce((total, section) => total
    + (section.paragraphs?.length || 0)
    + (section.afterword?.length || 0)
    + (section.subsections || []).reduce((sum, subsection) => sum + (subsection.paragraphs?.length || 0), 0), 0);
}

for (const id of TOPIC_ARTICLE_IDS) {
  test(`${id}: generated topic page retains its source structure and blank art slot`, async () => {
    const directory = new URL(`../themen/${id}/`, import.meta.url);
    const topic = JSON.parse(await readFile(new URL('thema.json', directory), 'utf8'));
    const html = await readFile(new URL('index.html', directory), 'utf8');
    assert.equal(topic.id, id);
    assert.equal(topic.title, expected[id].title);
    assert.equal(topic.sections.length, expected[id].sections);
    assert.equal(topic.facts.length, expected[id].facts);
    assert.equal(paragraphCount(topic.sections), expected[id].paragraphs);
    assert.equal(topic.themeImage, null);
    assert.equal(html.replace(/\r\n/g, '\n'), renderTopicArticle(topic));
    assert.match(html, /topic-theme-figure-empty/);
    assert(!/topic-theme-image|https?:\/\/|animexx|BILDCHEN|„\s*\.{3,}\s*“/i.test(html));
    await access(new URL(topic.icon.src, directory));
  });
}

test('the six sphere-lore notes link to their local topic pages', async () => {
  const group = BESTIARY_TOPIC_GROUPS.find(entry => entry.id === 'sphaerenkunde');
  assert.deepEqual(group.entries.map(entry => entry.id), TOPIC_ARTICLE_IDS);
  assert(group.entries.every(entry => entry.href === `./themen/${entry.id}/index.html`));
  await Promise.all(group.entries.map(entry => access(new URL(`../${entry.href.slice(2)}`, import.meta.url))));
});

test('header icon manifest documents six generated transparent assets', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/topic-icon-prompts.json', import.meta.url), 'utf8'));
  assert.equal(manifest.generator, 'OpenAI built-in image_gen');
  assert.equal(manifest.icons.length, 6);
  assert(manifest.icons.every(icon => icon.transparent && icon.width === 512 && icon.height === 512 && icon.prompt));
  await Promise.all(manifest.icons.map(icon => access(new URL(`../assets/${icon.file}`, import.meta.url))));
});

test('topic template escapes authored text', () => {
  const text = '<img src=x onerror="alert(1)">';
  const topic = {
    id: 'escape', title: text, subtitle: text, classification: text, folio: text, lead: text,
    icon: { src: './icon.webp', width: 1, height: 1, alt: text }, themeImage: null,
    tags: [text], factsTitle: text, facts: [{ label: text, value: text }],
    sections: [{ id: 'intro', title: text, paragraphs: [text], points: [{ title: text, text, details: [text] }] }]
  };
  const html = renderTopicArticle(topic);
  assert(!html.includes(text));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
