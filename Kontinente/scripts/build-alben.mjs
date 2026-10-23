import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyViewLink } from '../../Stammbäume/assets/js/services/family-links.js';
import { renderOverview, renderOffices, renderPrincipalityEntries } from '../modules/alben/page-template.mjs';

const base = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const read = path => readFile(new URL(path, base), 'utf8');
const json = async path => JSON.parse(await read(`modules/alben/${path}.source.json`));
const [fianna, culture, offices, { principalities }, registrySource, administrationSource] = await Promise.all([
  json('fianna'), json('culture'), json('offices'), json('principalities'),
  read('kontinente.registry.js'), read('modules/administration/administration-content.js'),
]);
const registryContext = { window: {} };
vm.runInNewContext(registrySource, registryContext);
const administrationContext = { window: {} };
vm.runInNewContext(administrationSource, administrationContext);
const branches = fianna.branches.map(branch => {
  const area = administrationContext.window.ALERIA_ADMINISTRATION_CONTENT.areas.find(area => area.id === branch.area);
  if (!area) throw new Error(`Unbekannter Verwaltungsbereich: ${branch.area}`);
  return { ...branch, imageSrc: area.imageSrc };
});

const person = getRegisteredFamily(fianna.chair.familyId)?.family.persons.find(person => person.id === fianna.chair.personId);
if (!person) throw new Error('Der Vorsitzende der Fianna fehlt in der kanonischen Familienakte.');
const presentation = {
  councilGroups: [{
    title: 'Vorsitz des Rates der Fianna',
    members: [{
      office: fianna.chair.office, name: person.name, featured: true,
      imageSrc: '/Stammbäume/' + person.portrait,
      href: '/Stammbäume/' + createFamilyViewLink(fianna.chair.familyId, fianna.chair.personId),
      note: 'Fürst von Dunfal',
    }],
  }],
};
const hierarchy = [
  { type: 'Sammlung', name: 'Kontinente', slug: 'kontinente' },
  { type: 'Konföderation', name: 'Der Schild von Ailith', slug: 'schild-von-ailith' },
];
const entry = {
  id: 'schild-von-ailith', slug: 'schild-von-ailith', aliases: ['alben', 'albische-fuerstentuemer'],
  name: 'Der Schild von Ailith', type: 'Konföderation',
  page: 'Alben/Der Schild von Ailith.html', data: 'Alben/alben.data.mjs?v=alben-20261022a',
  dataType: 'module', hierarchy,
};
const block = '  // BEGIN ALBEN_GENERATED\n' + JSON.stringify(entry, null, 2).split('\n').map(line => '  ' + line).join('\n') + ',\n  // END ALBEN_GENERATED\n';
const marker = /  \/\/ BEGIN ALBEN_GENERATED\r?\n[\s\S]*?  \/\/ END ALBEN_GENERATED\r?\n/;
const registry = marker.test(registrySource)
  ? registrySource.replace(marker, block)
  : registrySource.replace(/window.KONTINENTE_REGISTRY = \[\r?\n/, 'window.KONTINENTE_REGISTRY = [\n' + block);
const metadata = {
  meta: { id: entry.id, title: 'Der Schild von Ailith – Alben', type: entry.type, status: 'Im Aufbau', template: 'koenigreich' },
  name: entry.name, canonicalPath: 'Kontinente > Der Schild von Ailith', hierarchy,
};
const files = new Map([
  ['Alben/Der Schild von Ailith.html', renderOverview({ fianna, culture, principalities, branches }, registryContext.window.KONTINENTE_REGISTRY)],
  ['Alben/aemter.html', renderOffices(offices)],
  ['Alben/fuerstentum.html', renderPrincipalityEntries(principalities)],
  ['Alben/alben.data.mjs', 'export default ' + JSON.stringify(metadata, null, 2) + ';\n'],
  ['modules/alben/presentation.generated.json', JSON.stringify(presentation, null, 2) + '\n'],
  ['kontinente.registry.js', registry],
]);
for (const [path, content] of files) {
  const target = new URL(path, base);
  if (check) {
    if (await read(path) !== content) throw new Error(`${path} ist veraltet. build-alben.mjs ausführen.`);
  } else {
    await mkdir(new URL('./', target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}
console.log(`Alben: drei Seiten, ${principalities.length} fürstliche Einträge und ${offices.groups.reduce((sum, group) => sum + group.offices.length, 0)} Ämter/Titel ${check ? 'geprüft' : 'erzeugt'}.`);
