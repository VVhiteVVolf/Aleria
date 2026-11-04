// Bounded Ivarsheim authoring, using the shared Aldrimar composition adapter.
import { readFile, writeFile, mkdir, access, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createReviewedAldrimarHouseContent } from '../../Familien Häuser und Clans/modules/house-content/reviewed-aldrimar-house-content.mjs';

const root = new URL('../../', import.meta.url);
const resume = process.argv.includes('--resume');
const feature = new URL('Familien Häuser und Clans/', root);
const json = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const baseline = await json('baseline.json');
const review = await json('source-content.json');
if (review.status !== 'editorially-reviewed-ready') throw Error('Editorial review incomplete.');
const summaries = await json('biography-summaries.json');
const trachwyll = await json('trachwyll-content.json');
const hrafnvald = await json('hrafnvald-content.json');
const originals = await json('original-images.json');
const generated = await json('hrafnvald-generated-images.json');
const safeName = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const records = FAMILY_REGISTRY.filter(record => record.folderPath[0] === 'Aldrimar' && record.folderPath[1] === 'Ivarsheim');
if (records.length !== 13) throw Error(`Expected 13 Ivarsheim records, got ${records.length}.`);
const territory = { id: 'jarltum-ivarsheim', name: 'Jarltum Ivarsheim', href: '../Kontinente/Estryll/Königreich Aldrimar/Jarltum Ivarsheim/Jarltum Ivarsheim.html' };
const inputs = await Promise.all(records.map(async record => {
  const old = baseline.find(row => row.id === record.id);
  if (record.id !== 'haus-hrafnvald' && (!old || JSON.stringify(old.profile) !== JSON.stringify(record.family.document.houseProfile))) throw Error(`Profile drift: ${record.id}`);
  const source = record.id === 'haus-trachwyll' ? trachwyll : review.houses.find(row => row.id === record.id);
  const narrative = record.id === 'haus-hrafnvald' ? hrafnvald.sections : source.reviewedSections;
  const summary = record.id === 'haus-hrafnvald' ? hrafnvald.summary : record.id === 'haus-trachwyll' ? trachwyll.biographySummary : summaries[record.id];
  const art = originals.find(row => row.id === record.id && row.primary) || (record.id === 'haus-hrafnvald' ? generated.find(row => row.role === 'warrior') : null);
  if (!art?.assetPath || !summary?.overview) throw Error(`Missing reviewed inputs: ${record.id}`);
  await access(new URL(art.assetPath, root));
  const relativeDirectory = `Estryll/Aldrimar/Ivarsheim/${record.folderPath.slice(2).map(safeName).join('/')}/${safeName(record.title)}`;
  const directory = new URL(`${relativeDirectory}/`, feature);
  try { await access(new URL('haus.content.mjs', directory)); if (!resume) throw Error(`Existing source ${record.id}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { record, old, source, narrative, summary, art, relativeDirectory, directory };
}));

const created = [];
for (const { record, old, source, narrative, summary, art, relativeDirectory, directory } of inputs) {
  const content = createReviewedAldrimarHouseContent({ record, territory, image: `../${art.assetPath}`,
    contentVersion: '20261103-ivarsheim-v1', sections: narrative, biographySummary: summary,
    trivia: record.id === 'haus-hrafnvald' ? [] : source.reviewedTrivia || [] });
  if (record.id === 'haus-hrafnvald') {
    const liv = record.family.persons.find(person => person.id === 'liv');
    content.figuresTitle = 'Familie und Verbindungen';
    content.figures = [{ id: liv.id, familyId: record.id, name: liv.name, role: 'Heimgekehrte Angehörige',
      description: 'Liv stammt aus Clan Hrafnvald. Sie verließ Hrolf Wolfshorn 1731 und kehrte mit einem Teil ihrer Kinder zu ihrem Herkunftsclan zurück.', image: '', silhouette: 'female' }];
    content.relatedRecords = ['wolfshorn', 'bleiddorn'].map(name => ({ title: `Clan ${name === 'wolfshorn' ? 'Wolfshorn' : 'Bleiddorn'}`,
      text: 'Familienverbindungen aus Livs früherer Ehe.', link: `../Stammb%C3%A4ume/Stammbaum.html?family=haus-${name}&mode=view`, icon: '' }));
  }
  if (resume) {
    try {
      const existing = (await import(new URL('haus.content.mjs', directory))).HOUSE_CONTENT;
      if (JSON.stringify(existing) !== JSON.stringify(content)) throw Error(`Preserving edited source: ${record.id}`);
    } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
  }
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', directory), `// Geprüfte redaktionelle Quelle; kanonische Familienakten bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(content, null, 2)};\n`);
  if (source?.source?.archive) await copyFile(new URL(source.source.archive, root), new URL('animexx-source-2026-11-03.html', directory));
  const bytes = await readFile(new URL(art.assetPath, root));
  const manifest = { id: record.id, source: source?.source || null,
    authority: { familyId: record.id, baselineSourceRevision: old?.sourceRevision ?? 1, profile: record.family.document.houseProfile },
    genealogy: { imported: false, familyId: record.id, iframe: true }, militaryStatistics: { imported: false },
    illustration: { ...art, sha256: sha(bytes) },
    ...(record.id === 'haus-hrafnvald' ? { authorialDecisions: hrafnvald.sourceDecisions } : {}),
    decisions: [...(source?.decisions || []), 'Vorlagenstammbäume und Militärstatistiken vollständig ignoriert.', 'Aktuelle Orts- und Rangangaben sowie stabile Identitäten haben Vorrang.'] };
  await writeFile(new URL('source-manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n');
  created.push({ id: record.id, relativeDirectory, image: art.assetPath, extinct: content.extinct, prepared: content.prepared });
}
await writeFile(new URL('created-house-sources.json', import.meta.url), JSON.stringify(created, null, 2) + '\n');
console.log(`${created.length} Ivarsheim-Quellen angelegt.`);
