import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../',import.meta.url), base = new URL('./',import.meta.url);
const before = JSON.parse(await readFile(new URL('before.json',base),'utf8'));
const records = new Map(FAMILY_REGISTRY.map(row=>[row.id,row]));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const graph = family => Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]||[]]));
const changes = [], families = {};
for(const old of before.records.filter(row=>row.targets.length||row.partnerships.length)) {
  const family = records.get(old.id).family;
  for(const [collection,rows,expected] of [['persons',old.targets,before.targets],['partnerships',old.partnerships,before.partnerships]]) {
    for(const entity of rows) for(const [field,after] of Object.entries(expected[`${old.id}/${entity.id}`])) {
      const current = family[collection].find(row=>row.id===entity.id);
      if(current[field]!==after) throw new Error(`Unapplied status decision: ${old.id}/${entity.id}/${field}`);
      if(entity[field]!==after) changes.push({familyId:old.id,collection,entityId:entity.id,field,before:entity[field],after});
    }
  }
  families[old.id]={previousGraphFingerprint:old.graphFingerprint,graphFingerprint:hash(graph(family)),previousRevision:old.sourceRevision,revision:old.sourceRevision+1};
}
const inventory={schema:'aleria.reviewed-house-life-status-corrections',date:'2026-11-04',
  authority:'Im Zweifel lebend, außer Tod eindeutig belegt. Neuere Nutzeranweisung ersetzt für diese15 Statusfälle die frühere Vorgabe nur auflisten; Jahres- und Geschlechtskonflikte bleiben unverändert.',
  policy:'Ein unbekanntes Todesjahr oder eine Markierung ausschließlich im ausdrücklich ignorierten alten Stammbaum ist hier kein hinreichender Todesbeleg gegen eine lebende aktuelle Gegenakte. Kein globaler Wechsel der Bedeutung historischer Todesfelder.',
  aliveCases:before.cases.filter(row=>row.decision==='alive').map(row=>row.worldPersonId),
  confirmedDeaths:[{worldPersonId:'person--haus-varangr--hadvar-varangr',death:'1713',evidence:['Stammbäume/assets/js/data/house-varangr-family.js: Todesjahr1713 und Eheende1713','Aktuelle Varangr-Hausseite: historische Amtszeit1704–1713']},
    {worldPersonId:'person--haus-arth--afanen-1660-arth',death:'1710',evidence:['Stammbäume/assets/js/data/house-crafanc-family.js: Todesjahr1710 und Eheende1710']}],
  changes,families};
const fixture={schema:'aleria.authorized-house-life-status-review',date:'2026-11-04',families,changes,cases:before.cases,
  preservedCounterpartConflicts:JSON.parse(await readFile(new URL('../house-lore-fixes-20261104/remaining-twenty-counterparts.json',base),'utf8')).findings.filter(row=>!row.fields.includes('status'))};
await writeFile(new URL('Stammbäume/assets/data/source-inventories/house-life-status-corrections-20261104.json',root),JSON.stringify(inventory,null,2)+'\n');
await writeFile(new URL('Familien Häuser und Clans/tests/fixtures/house-life-status-corrections-20261104.json',root),JSON.stringify(fixture,null,2)+'\n');
await writeFile(new URL('remaining-five-counterparts.json',base),JSON.stringify({status:'listed-only-no-alignment',count:fixture.preservedCounterpartConflicts.length,findings:fixture.preservedCounterpartConflicts},null,2)+'\n');
console.log(JSON.stringify({changes:changes.length,families:Object.keys(families).length,aliveCases:inventory.aliveCases.length,confirmedDeaths:inventory.confirmedDeaths.length,remaining:fixture.preservedCounterpartConflicts.length}));
