import { readFile, writeFile } from 'node:fs/promises';
import { TOPIC_ARTICLE_IDS } from '../modules/topic-article/topic-article-registry.mjs';
import { renderTopicArticle } from '../modules/topic-article/topic-article-template.mjs';

const check = process.argv.includes('--check');
for (const id of TOPIC_ARTICLE_IDS) {
  const directory = new URL(`../themen/${id}/`, import.meta.url);
  const topic = JSON.parse(await readFile(new URL('thema.json', directory), 'utf8'));
  if (topic.id !== id) throw new Error(`Topic id does not match directory: ${id}`);
  const html = renderTopicArticle(topic);
  const output = new URL('index.html', directory);
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated topic is out of date: ${id}. Run node Bestiarium/scripts/build-topic-articles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} Bestiarium topic: ${id}`);
}
