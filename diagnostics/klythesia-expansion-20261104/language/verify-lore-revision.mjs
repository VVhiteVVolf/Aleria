import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const root=new URL('../../../',import.meta.url);
const here=new URL('./',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const baseline=JSON.parse(await readFile(new URL('protected-baseline.json',here),'utf8'));
const amendments=JSON.parse(await readFile(new URL('changes.json',here),'utf8'));

async function source(path,before=false){
  let text=await read(path);
  if(before)for(const change of amendments.changes.filter(change=>change.path===path).reverse()){
    assert.equal(text.split(change.after).length-1,1,`Unique amendment: ${path} / ${change.field}`);
    text=text.replace(change.after,change.before);
  }
  return text;
}

async function loadEntries(before=false){
  const seed=await source('AleriaAlmanach/data/sections.js',before);
  const context=vm.createContext({console});
  for(const [,factory]of seed.matchAll(/\b(create[A-Za-z0-9_]+)\(/g)){
    context[factory]=()=>factory==='createPiracySections'?[]:{};
  }
  for(const path of [
    'AleriaAlmanach/modules/name-list/name-list-data.js',
    'AleriaAlmanach/modules/script-table/script-table-data.js',
    'AleriaAlmanach/modules/language/package-language-tables.js',
    'AleriaAlmanach/modules/language/ishtaran/ishtaran-data.js',
    'AleriaAlmanach/modules/language/ishtaran/ishtaran-entry.js',
    'AleriaAlmanach/modules/language/language-reference-entries.js',
    'AleriaAlmanach/modules/language/language-data.js'
  ])vm.runInContext(await source(path,before),context,{filename:path});
  vm.runInContext(seed,context,{filename:'data/sections.js'});
  const selected=clone(vm.runInContext('SECTIONS.flatMap(section=>section.entries).filter(entry=>["kanaanith","infernal-nharazim","stoicheia","lingua-argenti","ishtaran"].includes(entry.id))',context));
  assert.equal(selected.length,5);
  return {selected,context};
}

const mutableOrigins=new Set([
  'Ursprung in Tirnara','Zarakhuls Zwangssprache und Orins Eingriff',
  'Herkunft & Reichsreform','Vom Kana’anith zum Stoicheia',
  'Aechanath, Aechneach und die zerstreuten Zungen',
  'Phalantia und Klythesia: getrennte Reiche, gemeinsame Sprache',
  'Maghath, Maghneach und der Sprachbruch'
]);
function preservedLanguageStructure(entry){
  const result=clone(entry);
  delete result.pages[0].description;
  result.pages[0].stats=result.pages[0].stats.filter(([label])=>label!=='Herkunft');
  const language=result.pages.find(page=>page.languagePage).language;
  delete language.family;
  language.sections=language.sections.filter(section=>!mutableOrigins.has(section.title));
  return result;
}

const report={status:'running',checkedAt:new Date().toISOString(),protectedFiles:[],languages:[],phalantia:{},publishing:false};
for(const record of baseline.files){
  const actual=createHash('sha256').update(await readFile(new URL(record.path,root))).digest('hex');
  assert.equal(actual,record.sha256,`Protected source changed: ${record.path}`);
  report.protectedFiles.push({path:record.path,unchanged:true});
}
const before=await loadEntries(true),after=await loadEntries();
for(const previous of before.selected){
  const current=after.selected.find(entry=>entry.id===previous.id);
  assert.deepEqual(preservedLanguageStructure(current),preservedLanguageStructure(previous),`${previous.id}: corpus, grammar, other sections, metadata and interfaces`);
  const page=current.pages.find(page=>page.languagePage);
  after.context.inputLanguage=page.language;
  const sanitized=clone(vm.runInContext('sanitizeLanguageData(inputLanguage)',after.context));
  assert.equal(sanitized.sections.length,page.language.sections.length,`${current.id}: editor must retain every section`);
  assert.deepEqual(sanitized.sections,page.language.sections);
  report.languages.push({id:current.id,sections:page.language.sections.length,allSectionsSurviveEditor:true,corpusAndGrammarUnchanged:true});
}
const {REALM_CONTEXT}=await import(new URL('Vorschau/Phalantia/realm-context.mjs',root));
const {history,culture,...identityGovernment}=REALM_CONTEXT;
assert.deepEqual({...identityGovernment,culture:culture.filter(item=>item.title!=='Glaube und Schrift')},baseline.phalantia);
report.phalantia={historyArticles:history.length,governmentMarriageEstatesAndIdentityUnchanged:true};
const regressionOutput=await readFile(new URL('regressions-in-process.tap',here),'utf8');
assert.match(regressionOutput,/# tests 13\r?\n# suites 0\r?\n# pass 13\r?\n# fail 0/);
report.existingRegressions={passed:13,failed:0,proof:'regressions-in-process.tap',execution:'Imported four existing node:test suites into one process; node --test child spawning is unavailable in this sandbox.'};
for(const file of amendments.files){
  const currentHash=createHash('sha256').update(await readFile(new URL(file.path,root))).digest('hex');
  assert.equal(currentHash,file.afterSha256,`Unexpected edits after inventory: ${file.path}`);
}
report.status='passed';
await writeFile(new URL('verification.json',here),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles.length,languages:report.languages,phalantia:report.phalantia}));
