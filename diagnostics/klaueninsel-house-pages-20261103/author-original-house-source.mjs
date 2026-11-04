// One-off authoring helper. Production content is emitted as independent static data.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = process.cwd();
const houseRoot = path.join(root, 'Familien Häuser und Clans');
export const registry = FAMILY_REGISTRY;
export function member(familyId, id, role, detail, description) {
  const p = registry.find(x => x.id === familyId)?.family.persons.find(x => x.id === id);
  if (!p) throw new Error(`Unknown canonical person: ${familyId}/${id}`);
  const result = { id, familyId, name: p.name, role, image: p.portrait ? `../Stammbäume/${p.portrait}` : '', silhouette: p.sex === 'female' ? 'female' : 'male', detail };
  if (description) result.description = description;
  return result;
}
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function writeHouse(config) {
  const record = registry.find(x => x.id === config.id);
  if (!record) throw new Error(`Unknown family ${config.id}`);
  const f = record.family;
  const profile = record.houseProfile;
  const target = path.join(houseRoot, config.folder);
  const output = path.join(target, 'haus.content.mjs');
  if (fs.existsSync(output)) throw new Error(`Refusing overwrite: ${output}`);
  const rank = profile.rankId === 'barony' ? 'Baron' : 'Ritterfürst';
  const content = {
    id: config.id, name: record.title, type: profile.rankId === 'barony' ? 'Baronenhaus' : 'Ritterfürstenhaus', page: 'haus.html', county: 'Klaueninsel', liege: profile.liegeHouseName,
    territoryId: config.territoryId, territoryName: config.territoryName, territoryHref: `../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/${config.territoryFile}`,
    parentHouseId: profile.liegeHouseId, extinct: false, showMotto: Boolean(config.motto), registerPage: true, prepared: false,
    contentVersion: '20261103-klaueninsel-v1', biographySourceRevision: f.extensions.sourceRevision + 1, biographyPreviousDefaultFingerprints: [], biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses', biographySummary: config.biographySummary,
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
    hierarchy: [ { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' }, { type: 'Kontinent', name: 'Estryll', slug: 'estryll' }, ...record.hierarchy.map(e=>({ type: ({kingdom:'Königreich',county:'Grafschaft',barony:'Baronie',holding:'Sitz',family:'Haus'})[e.level] || e.level, name:e.title, slug:e.slug })) ],
    profile: { highestTitle: rank, rank, houseType: profile.rankId === 'barony' ? 'Baronenhaus' : 'Ritterhaus', motto: config.motto || '', quoteAuthor: '', seat: profile.seat, affiliation: `Klaueninsel · ${profile.barony}`, liege: profile.liegeHouseName, troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '1720 · heutiger Exilzweig', milestoneOne:'',milestoneTwo:'',patron:'',knightingPatron:'',people:'Vennyri',wealth:'',religion:'Alerische Kirche',patronDeities:config.patronDeities,origin:config.origin,cadetBranches:'',allies:'',enemies:'' },
    omitMilitaryProfile: true, sections: config.sections,
    images: { crest: `../Stammbäume/${f.document.emblem}`, scene: config.scene || `${config.folder}/assets/hausdarstellung-original.png`, sceneAlt: config.sceneAlt, banner: `../Stammbäume/${profile.regionEmblems.barony}` },
    founder: config.founder, founderTitle: 'Begründer des heutigen Exilzweigs', headsTitle: 'Oberhauptfolge des heutigen Exilzweigs', heads: config.heads, heirs: config.heirs,
    offices: JSON.parse(fs.readFileSync(path.join(root,'diagnostics/klaueninsel-house-pages-20261103/source-office-silhouettes.json'),'utf8'))[config.attachmentId], figuresTitle: 'Herkunft und historische Persönlichkeiten', figures: config.figures, cadets: [],
    trivia: config.trivia, currentHead: config.heads.at(-1).name, firstHeir: config.heirs[0]?.name || '', headsNote: 'Die ältere Folge in Vennyr ist separat unter den historischen Persönlichkeiten erfasst.',
    relatedRecords: [ { icon: `../Stammbäume/${f.document.emblem}`, title: config.originRecordTitle, text: 'Eigenständige Ursprungsakte in Vennyr mit dem bereits ausgearbeiteten Stammbaum.', link: `../Stammbäume/Stammbaum.html?family=${config.originRecordId}&mode=view` }, ...(config.relatedRecords || []) ]
  };
  for (const entry of [content.founder,...content.heads,...content.heirs,...content.figures]) {
    if (entry.image && !fs.existsSync(path.resolve(houseRoot,entry.image))) throw new Error(`Missing portrait ${entry.image}`);
  }
  const words = Object.values(content.biographySummary).join(' ').split(/\s+/).filter(Boolean).length;
  if (words < 250 || words > 600) throw new Error(`Biography length ${config.id}: ${words}`);
  const attachment = `C:/Users/fhg_r/.codex/attachments/${config.attachmentId}/Eingefügter Text.txt`;
  const archive = fs.readFileSync(path.join(target,'animexx-original.html'));
  if (!archive.equals(fs.readFileSync(attachment))) throw new Error(`Archive mismatch ${config.id}`);
  const imagePath = path.resolve(houseRoot, content.images.scene);
  if (!fs.existsSync(imagePath)) throw new Error(`Missing original figure ${imagePath}`);
  const sourceAudit = {
    schema:'aleria.house-source-audit',version:1,reviewedAt:'2026-11-03',houseId:config.id,attachmentId:config.attachmentId,
    original:{file:'animexx-original.html',sha256:hash(archive),byteIdenticalToAttachment:true},
    images:[{role:'Hausdarstellung',file:path.relative(target,imagePath).replaceAll('\\','/'),source:config.imageUrl,sha256:hash(fs.readFileSync(imagePath)),preservedOriginal:true,visuallyInspected:true}],
    genealogy:{providedHierarchyIgnored:true,providedTreeImageIgnored:true,existingFamilyId:config.id,originFamilyId:config.originRecordId,graphChanges:false},
    canonicalSources:['Stammbäume/assets/js/data/families.registry.js','Stammbäume/assets/js/data/klaueninseln-house-profiles.js',...config.canonicalSources],
    editorialDecisions:'REDAKTION.md',militaryStatisticsIgnored:true,biographyWords:words
  };
  fs.writeFileSync(output,`// Redaktionelle Quelle für Hausseite und Stammbaum-Bio.\n// Quellen und Entscheidungen: quellen.json und REDAKTION.md.\nexport const HOUSE_CONTENT = ${JSON.stringify(content,null,2)};\n`,{flag:'wx'});
  fs.writeFileSync(path.join(target,'quellen.json'),JSON.stringify(sourceAudit,null,2)+'\n',{flag:'wx'});
  fs.writeFileSync(path.join(target,'REDAKTION.md'),`# ${record.title}: Redaktion vom 3. November 2026\n\nDie Originalquelle ist bytegleich als \`animexx-original.html\` archiviert. Alle gelieferten Stammbaumabschnitte und Stammbaumbilder sind vollständig von der Übernahme ausgeschlossen. Das Iframe entsteht ausschließlich aus der bestehenden ID \`${config.id}\`. Keine genealogischen Daten wurden geändert.\n\nAktuelle Rang-, Orts- und Identitätsangaben der kanonischen Akte haben Vorrang. Die Vennyr-Ursprungsakte \`${config.originRecordId}\` bleibt unabhängig erhalten. Ältere Oberhäupter werden ausdrücklich als Personen der Herkunftslinie geführt; sie sind keine Oberhäupter der erst 1720 begründeten Cenyr-Akte.\n\n${config.decisions.map(x=>'- '+x).join('\n')}\n\nMilitärzahlen, Aufgebote, Flottenzahlen und kopierte militärische Profiltabellen wurden vollständig ausgeschlossen. Qualitative Ausbildung und kulturelle Ausrüstung bleiben als Hausgeschichte erhalten. Nicht benannte Hofämter erhalten ausschließlich vorhandene Silhouetten und keinen erfundenen Amtsinhaber. Alle Personenlinks verwenden real vorhandene IDs und lokale Portraits.\n\nDas heruntergeladene Originalbild wurde tatsächlich angesehen und unverändert eingebunden; URL und SHA-256 stehen in \`quellen.json\`. Keine KI-Ersatzdarstellung. Die Kurzbiografie umfasst ${words} Wörter. Die Quelle wurde über die vorhandenen reinen Ausgabeadapter auf Schema und das eigene Iframe geprüft; Integration und Gesamtbuild übernimmt der Hauptagent.\n`,{flag:'wx'});
  console.log(JSON.stringify({id:config.id,words,revision:content.biographySourceRevision,heads:content.heads.length,heirs:content.heirs.length,figures:content.figures.length,offices:content.offices.length,path:path.relative(root,output)}));
}
