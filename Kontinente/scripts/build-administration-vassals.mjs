import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { resolveAdministrationPortrait } from '../modules/administration/administration-portrait-sources.mjs';

// The territorial council remains the owner of its office holders. This build
// exposes those same records to the county without maintaining a second roster.
const repositoryRoot = new URL('../../', import.meta.url);
const territoryRoot = 'Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht';
const output = new URL('../modules/administration/data/celtigerns-vassals.generated.mjs', import.meta.url);
const helperFile = new URL('../assets/js/herrschaft-data.js', import.meta.url);
const helperSource = await readFile(helperFile, 'utf8');
const territories = [
  ['gwendolyns-ufer', 'Baronie Gwendolyns Ufer', 'baronie.data.js'],
  ['arthus-streben', 'Baronie Arthus Streben', 'baronie.data.js'],
  ['gafyr', 'Herrschaft der Gafyr', 'herrschaft.data.js'],
  ['saethwyr', 'Herrschaft der Saethwyr', 'herrschaft.data.js'],
  ['wyrm', 'Herrschaft der Wyrm', 'herrschaft.data.js'],
  ['rhonwens-traenen', 'Herrschaft Rhonwens Tränen', 'herrschaft.data.js'],
];
const officePatterns = {
  militaer: /^Marschall\b/u,
  klerus: /^Vikar(?:in)?\b/u,
  gerichtsbarkeit: /^Justiziar(?:in)?\b/u,
  finanzen: /^Kämmer(?:er|erin)\b/u,
  spionage: /^Schatten\b/u,
  diplomatie: /^Herold(?:in)?\b/u,
  magie: /^Ratsmagier(?:in)?\b/u,
  unterhaltung: /^Bard(?:e|in)\b/u,
};

function named(value) {
  const text = String(value || '').trim();
  return /^[\s.?!…–—-]*$/u.test(text) ? '' : text;
}

async function localPortrait(value, source) {
  // Keep a valid original when no exact locally archived source is known.
  // Runtime image fallback belongs to the portrait component.
  value = resolveAdministrationPortrait(value);
  if (/^https:\/\//u.test(value || '')) {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname ? value : '';
  }
  if (!value?.startsWith('/') || value.startsWith('//')) return '';
  const path = decodeURIComponent(value.split(/[?#]/u)[0]);
  const file = new URL(`.${path}`, repositoryRoot);
  if (!file.href.startsWith(repositoryRoot.href)) throw new Error(`Bildpfad außerhalb des Projekts: ${value}`);
  try { await access(file); }
  catch { throw new Error(`Lokales Portrait fehlt in ${source}: ${value}`); }
  return value;
}

async function readTerritoryData(source) {
  // Only trusted, versioned local data scripts are evaluated. No browser,
  // network, process, filesystem or Firebase APIs are exposed to their context.
  const context = vm.createContext({ window: {} });
  vm.runInContext(helperSource, context, { filename: fileURLToPath(helperFile), timeout: 1000 });
  vm.runInContext(await readFile(new URL(source, repositoryRoot), 'utf8'), context, {
    filename: source,
    timeout: 1000,
  });
  const territory = context.window.KONTINENTE_DATA;
  if (!territory?.meta?.id || !territory.view?.councilGroups) throw new Error(`Fehlende Ratsdaten: ${source}`);
  return territory;
}

async function readTerritory([id, folder, filename]) {
  const source = `${territoryRoot}/${folder}/${filename}`;
  const href = `/${territoryRoot}/${folder}/${folder}.html`;
  await access(new URL(`.${href}`, repositoryRoot));
  const territory = await readTerritoryData(source);
  const members = territory.view.councilGroups.flatMap(group => group.members);
  const offices = {};
  for (const [area, pattern] of Object.entries(officePatterns)) {
    const matches = members.filter(member => pattern.test(member.office));
    if (matches.length !== 1) throw new Error(`${source}: ${matches.length} statt eines Ratsamts für ${area}`);
    const member = matches[0];
    offices[area] = {
      title: member.office,
      name: named(member.name),
      portrait: await localPortrait(member.imageSrc, source),
    };
  }
  return { id, scopeId: territory.meta.id, name: territory.name, href, source: `/${source}`, offices };
}

async function readTerritorialContacts() {
  // Camruisge is a diarchy without a documented eight-office council. Only
  // its northern lordship belongs to Celtigerns Wacht; Oilean is not imported.
  const source = `${territoryRoot}/Insel Camruisge/insel.data.js`;
  const href = `/${territoryRoot}/Insel Camruisge/Insel Camruisge.html`;
  await access(new URL(`.${href}`, repositoryRoot));
  const territory = await readTerritoryData(source);
  const members = territory.view.councilGroups.flatMap(group => group.members);
  const contacts = members.filter(member => member.office === 'Lehenswart Aberllans');
  if (contacts.length !== 1 || !named(contacts[0].name)) throw new Error(`${source}: Der belegte Lehenswart Aberllans fehlt.`);
  const contact = contacts[0];
  return [{
    id: 'aberllan',
    name: named(contact.name),
    title: contact.office,
    portrait: await localPortrait(contact.imageSrc, source),
    jurisdiction: 'Aberllan · nördliches Camruisge',
    href,
    source: `/${source}`,
    description: 'Der Lehenswart vertritt Aberllan im nördlichen Camruisge unter der administrativen Gewalt der Grafschaft Celtigerns Wacht. Für die örtlichen Fachämter sind noch keine einzelnen Zuständigkeiten oder Amtsinhaber belegt. Der südliche Inselteil Oilean untersteht Leitheach beziehungsweise Tír na Sleagh und gehört nicht zu dieser Grafschaftsverbindung.',
  }];
}

const records = [];
for (const territory of territories) records.push(await readTerritory(territory));
const territorialContacts = await readTerritorialContacts();
const result = `// Generated from territorial council sources. Do not edit by hand.\n// Rebuild: node Kontinente/scripts/build-administration-vassals.mjs\nexport const territorialContacts = ${JSON.stringify(territorialContacts, null, 2)};\n\nexport default ${JSON.stringify(records, null, 2)};\n`;
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8') !== result) throw new Error('Vasallenregister ist veraltet. build-administration-vassals.mjs ausführen.');
} else {
  await mkdir(new URL('.', output), { recursive: true });
  await writeFile(output, result, 'utf8');
}
console.log(`Verwaltung: ${records.length} Vasallen mit jeweils ${Object.keys(officePatterns).length} Ratsämtern und ${territorialContacts.length} territoriale Verbindung ${process.argv.includes('--check') ? 'geprüft' : 'erzeugt'}.`);
