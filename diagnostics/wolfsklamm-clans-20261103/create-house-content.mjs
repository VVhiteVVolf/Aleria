// One-time bounded content import. Existing family graphs are read only.
import { readFile, writeFile, access, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createReviewedAldrimarHouseContent } from '../../Familien Häuser und Clans/modules/house-content/reviewed-aldrimar-house-content.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const json = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const baseline = await json('baseline.json');
const review = await json('source-content.json');
const summaries = await json('biography-summaries.json');
const originals = await json('original-images.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const safeName = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
if (review.status !== 'editorially-reviewed-ready') throw Error('Editorial review incomplete.');
const records = FAMILY_REGISTRY.filter(record => record.folderPath[0] === 'Aldrimar' && record.folderPath[1] === 'Schwarzfenn');
if (records.length !== 11 || baseline.length !== 11) throw Error('Unexpected Schwarzfenn scope.');
const territory = { id: 'jarltum-schwarzfenn', name: 'Jarltum Schwarzfenn', href: '../Kontinente/Estryll/Königreich Aldrimar/Jarltum Schwarzfenn/Jarltum Schwarzfenn.html' };

// Assemble and validate the complete allowlist before the first content write.
const pending = await Promise.all(records.map(async record => {
  const old = baseline.find(row => row.id === record.id);
  const source = review.houses.find(row => row.id === record.id);
  const summary = summaries[record.id];
  const art = originals.find(row => row.id === record.id && row.primary);
  if (!old || !source || !summary?.overview || !art?.assetPath || !Array.isArray(source.decisions)) throw Error(`Incomplete inputs: ${record.id}`);
  if (JSON.stringify(old.profile) !== JSON.stringify(record.family.document.houseProfile)) throw Error(`Profile drift: ${record.id}`);
  for (const [key, value] of Object.entries(old.graph)) if (JSON.stringify(value) !== JSON.stringify(record.family[key])) throw Error(`Graph drift: ${record.id}/${key}`);
  await access(new URL(source.source.archive, root));
  const bytes = await readFile(new URL(art.assetPath, root));
  if (sha(bytes) !== art.sha256) throw Error(`Original image changed: ${record.id}`);
  const relativeDirectory = `Estryll/Aldrimar/Schwarzfenn/${record.folderPath.slice(2).map(safeName).join('/')}/${safeName(record.title)}`;
  const directory = new URL(`${relativeDirectory}/`, feature);
  try { await access(new URL('haus.content.mjs', directory)); throw Error(`Existing source: ${record.id}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const content = createReviewedAldrimarHouseContent({ record, territory, image: `../${art.assetPath}`,
    contentVersion: '20261103-schwarzfenn-v1', sections: source.reviewedSections,
    biographySummary: summary, trivia: source.reviewedTrivia || [] });
  if (record.id === 'haus-ragnulf') {
    // Canonical titles name Bjölf as heir and Gulvar explicitly as second heir;
    // the source person-array order is not a succession order.
    const order = ['bjolf-ragnulf', 'gulvar-ragnulf'];
    content.heirs.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    content.firstHeir = 'Bjölf Ragnulf';
    content.sections.succession = 'Bjölf Ragnulf ist der Erbe des Clans. Gulvar Ragnulf folgt als zweiter Erbe.';
  }
  if (record.id === 'haus-helgr') {
    // The canonical first heir has a death entry. Do not silently promote a
    // living second/third/fourth heir to a newly confirmed primary successor.
    content.firstHeir = '';
  }
  if (record.id === 'haus-eisbrand') {
    content.type = 'Nicht anerkanntes Haus';
    content.profile.houseType = 'Nicht anerkanntes Bastard- und Banditenhaus';
    content.sectionTitles = { knighthood: '4. Bewaffnung und Gefolge' };
    content.illustrationCategory = 'Hausdarstellung';
    content.images.sceneAlt = 'Originale Gruppenabbildung · Haus Eisbrand';
    content.headsTitle = 'Überlieferte Hausführer';
    content.officesTitle = 'Gefolge und Aufgaben';
  }
  const manifest = { id: record.id, source: source.source,
    authority: { familyId: record.id, baselineSourceRevision: old.sourceRevision, profile: old.profile },
    genealogy: { imported: false, familyId: record.id, iframe: true },
    militaryStatistics: { imported: false }, illustration: { ...art, sha256: sha(bytes) },
    decisions: [...source.decisions, 'Jarltum Schwarzfenn und der Hauptsitz Wolfsklamm bleiben unterschiedliche Gebietsebenen.',
      'Vorlagenstammbäume und Militärstatistiken vollständig ignoriert.', 'Die bestehenden Familienakten bleiben unverändert.'] };
  return { id: record.id, directory, relativeDirectory, source, content, manifest, image: art.assetPath };
}));

for (const row of pending) {
  await mkdir(row.directory, { recursive: true });
  await writeFile(new URL('haus.content.mjs', row.directory), `// Geprüfte redaktionelle Quelle; kanonische Familienakten bleiben maßgeblich.\nexport const HOUSE_CONTENT = ${JSON.stringify(row.content, null, 2)};\n`);
  await copyFile(new URL(row.source.source.archive, root), new URL('animexx-source-2026-11-03.html', row.directory));
  await writeFile(new URL('source-manifest.json', row.directory), JSON.stringify(row.manifest, null, 2) + '\n');
}
await writeFile(new URL('created-house-sources.json', import.meta.url), JSON.stringify(pending.map(({ id, relativeDirectory, content, image }) =>
  ({ id, relativeDirectory, image, extinct: content.extinct, prepared: content.prepared })), null, 2) + '\n');
console.log(`${pending.length} Schwarzfenn-Hausquellen angelegt.`);
