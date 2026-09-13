import { readFile, writeFile } from 'node:fs/promises';
import { renderChapterRegister, renderEventCatalog } from '../modules/catalog/events-render.mjs';

const page = new URL('../index.html', import.meta.url);
const before = await readFile(page, 'utf8');
let after = before;
for (const [name, content] of [['register', renderChapterRegister()], ['catalog', renderEventCatalog()]]) {
  const pattern = new RegExp(`(<!-- events:${name}:start -->)[\\s\\S]*?(<!-- events:${name}:end -->)`);
  if (!pattern.test(after)) throw new Error(`Fehlender Generierungsbereich: ${name}`);
  after = after.replace(pattern, (_, start, end) => `${start}\n${content}\n${end}`);
}
if (process.argv.includes('--check')) {
  if (after !== before) throw new Error('Ereignisübersicht veraltet. Bitte build-events.mjs ausführen.');
  console.log('Ereignisübersicht ist aktuell.');
} else if (after !== before) {
  await writeFile(page, after, 'utf8');
  console.log('Ereignisübersicht aktualisiert.');
}
