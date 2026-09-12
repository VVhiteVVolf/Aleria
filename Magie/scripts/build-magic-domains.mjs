import { readFile, writeFile } from 'node:fs/promises';
import { readReligionCatalog } from '../../Religionen/modules/content/content-repository.mjs';
import { getMagicDomainCircles } from '../modules/domains/magic-domain-repository.mjs';
import { renderMagicDomains } from '../modules/domains/magic-domain-template.mjs';

const target = new URL('../index.html', import.meta.url);
const original = await readFile(target, 'utf8');
const start = '<!-- magic-domains:start -->';
const end = '<!-- magic-domains:end -->';
const from = original.indexOf(start);
const to = original.indexOf(end);
if (from < 0 || to <= from || original.indexOf(start, from + 1) >= 0 || original.indexOf(end, to + 1) >= 0) {
  throw new Error('Eindeutiger Domänenbereich fehlt in Magie/index.html');
}
const circles = getMagicDomainCircles(readReligionCatalog());
const newline = original.includes('\r\n') ? '\r\n' : '\n';
const domainHtml = renderMagicDomains(circles).replace(/\r?\n/g, newline);
const generated = `${original.slice(0, from + start.length)}${newline}${domainHtml}${newline}        ${original.slice(to)}`;
if (process.argv.includes('--check')) {
  if (generated !== original) throw new Error('Domänenregister ist veraltet. Bitte build:magic ausführen.');
} else if (generated !== original) await writeFile(target, generated, 'utf8');
console.log(`${circles.reduce((sum, circle) => sum + circle.count, 0)} magische Domänen ${process.argv.includes('--check') ? 'geprüft' : 'abgeglichen'}.`);
