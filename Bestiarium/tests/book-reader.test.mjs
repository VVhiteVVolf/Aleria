import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderTopicArticle } from '../modules/topic-article/topic-article-template.mjs';
import { renderBookSource, renderInline, renderBookBlock } from '../modules/book-reader/book-content.mjs';
import { TOPIC_ARTICLE_IDS } from '../modules/topic-article/topic-article-registry.mjs';
import { BESTIARY_TOPICS } from '../modules/topic-board/topic-board-data.js';

const directory = new URL('../themen/wesen-des-infernalen/', import.meta.url);
const topic = JSON.parse(await readFile(new URL('thema.json', directory), 'utf8'));

test('the first book preserves all 44 paragraphs and five chapters from the supplied source', async () => {
  assert.equal(topic.presentation, 'book');
  assert.deepEqual(topic.sections.map(section => section.blocks.length), [3, 7, 5, 6, 7, 5, 5, 6]);
  assert.equal(topic.sections.filter(section => section.id.startsWith('kapitel-')).length, 5);
  const source = renderBookSource(topic);
  assert.equal((source.match(/<p /g) || []).length, 44);
  assert.match(source, /3\.504/);
  assert.match(source, /beneiden/);
  assert.match(source, /seinen Fall/);
  assert.equal((await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n'), renderTopicArticle(topic));
  assert(TOPIC_ARTICLE_IDS.includes(topic.id));
  assert.equal(BESTIARY_TOPICS.find(entry => entry.id === topic.id).href, './themen/wesen-des-infernalen/index.html');
});

test('book content escapes authored HTML and rejects executable links and duplicate anchors', () => {
  assert.equal(renderInline('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.throws(() => renderInline([{ type: 'link', href: 'javascript:alert(1)', children: ['link'] }]));
  assert.throws(() => renderBookSource({ sections: [{ id: 'same', title: 'a', blocks: [{ id: 'same', type: 'paragraph', content: 'b' }] }] }));
  assert.throws(() => renderInline([{ type: 'iframe' }]));
  assert.match(renderBookBlock({ id: 'figure', type: 'figure', src: './image.png', alt: 'Unbeschnitten', width: 600, height: 1200, caption: ['Bildunterschrift'] }), /<figcaption>Bildunterschrift<\/figcaption>/);
});

test('one source provides semantic HTML, standard paragraph input and normal fragment links', () => {
  const rendered = renderBookSource({ sections: [{ id: 'intro', title: 'Titel', paragraphs: ['Absatz'] }] });
  assert.match(rendered, /data-book-anchor="intro-absatz-1">Absatz/);
  assert.equal(renderInline([{ type: 'link', href: '#intro', children: [{ type: 'em', children: ['Zum Anfang'] }] }]), '<a href="#intro"><em>Zum Anfang</em></a>');
});
