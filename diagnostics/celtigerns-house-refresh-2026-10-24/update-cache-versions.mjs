import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const version = '20261024-housebio-v1';
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]);
for (const file of [...files('Stammbäume/assets/js').filter(f => f.endsWith('.js')), 'Stammbäume/Stammbaum.html']) {
  const before = readFileSync(file, 'utf8');
  const after = before.replaceAll('20261021-arvel-v3', version);
  if (after !== before) writeFileSync(file, after);
}
for (const file of ['Familien Häuser und Clans/haus.html', 'Familien Häuser und Clans/kleinehaeuser.html']) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/(haeuser\.registry\.js\?v=)[^"']+/g, '$1' + version)
    .replace(/(haeuser-page\.js\?v=)[^"']+/g, '$1' + version);
  if (after !== before) writeFileSync(file, after);
}
const gallery = 'Gallerien/krieger/index.html';
const before = readFileSync(gallery, 'utf8');
writeFileSync(gallery, before.replace('warrior-gallery.mjs?v=20261006-gwyllt', `warrior-gallery.mjs?v=${version}`)
  .replace('Krieger- und Rüstungsreferenzen Alerias, nach Häusern geordnet.', 'Krieger, Handwerker und bürgerliche Hausfiguren Alerias, nach Häusern geordnet.')
  .replace('Die Rüstungen, Farben und Krieger Alerias.', 'Die Krieger, Berufe und Hausfarben Alerias.')
  .replace('Krieger- und Rüstungsdarstellungen aus Hausbios und Referenzarchiven.', 'Krieger- und berufliche Hausdarstellungen aus Hausbios und Referenzarchiven.')
  .replace('Bestandsprüfung vom 6. Oktober 2026.', 'Bestandsprüfung vom 24. Oktober 2026. Bürgerliche Hausfiguren sind entsprechend ihrem Beruf oder Familienzeichen zugeordnet.'));
