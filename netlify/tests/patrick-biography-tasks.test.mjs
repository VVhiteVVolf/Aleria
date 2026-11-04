import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { isTaskInput, selectBuildTasks } from '../build/site-build-plan.mjs';
import { PATRICK_BIOGRAPHY_ASSETS } from '../../AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs';

const task=SITE_BUILD_TASKS.find(row=>row.id==='patrick-biographies');
const files=[
  'AleriaAlmanach/modules/patrick-biographies/source/biographies-2026-11-03.json',
  'AleriaAlmanach/modules/patrick-biographies/biography-source.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs',
  'Stammbäume/assets/js/data/house-hamnett-family.js',
  'Stammbäume/assets/js/data/house-sgrechiwr-family.js',
  'Stammbäume/assets/js/data/house-draenmelyn-family.js',
  'Stammbäume/assets/js/data/house-swyll-family.js',
  'CharakterDatenbank/assets/js/character-identity-retirements.mjs',
  'CharakterDatenbank/lib/character-record-projections.mjs',
  'AleriaAlmanach/modules/creatures/catalog/patrick-biography-companions.js',
  'firebase/scripts/content/character-retirement-plan.mjs',
  'AleriaAlmanach/tests/patrick-biography-family-integration.test.mjs'
];

test('shared sources, artwork, three family projections, retirement guards and projection helpers invalidate the focused gate',()=>{
  assert(task);
  for(const file of files)assert(isTaskInput(task,file),file);
  for(const value of Object.values(PATRICK_BIOGRAPHY_ASSETS))if(value.startsWith('/'))assert(isTaskInput(task,decodeURIComponent(value).slice(1)),value);
  const tree=files.map(file=>({file,object:`100644 blob ${'a'.repeat(40)}`}));
  const options={now:Date.parse('2026-11-03T12:00:00Z'),runtime:'node/test',siteId:'patrick-feature-test'};
  const baseline={version:1,siteId:options.siteId,commit:'a'.repeat(40),tasks:Object.fromEntries(selectBuildTasks([task],tree,options).map(value=>[value.id,{fingerprint:value.fingerprint,verifiedAt:'2026-11-03T11:59:59Z'}]))};
  assert.equal(selectBuildTasks([task],tree,{...options,baseline})[0].run,false);
  for(const file of files)assert.equal(selectBuildTasks([task],tree.map(row=>row.file===file?{...row,object:`100644 blob ${'b'.repeat(40)}`}:row),{...options,baseline})[0].run,true,file);
  assert.equal(isTaskInput(task,'Vorschau/Unrelated/draft.mjs'),false);
});

test('every feature gate command exists and checks remain read-only',()=>{
  const root=new URL('../../',import.meta.url);
  for(const command of task.commands){
    assert(!command.includes('--apply')&&!command.includes('--publish'));
    if(command[0]==='--test')for(const file of command.filter(value=>value.endsWith('.mjs')||value.endsWith('.js')))assert(existsSync(new URL(file,root)),file);
    else{assert(command.includes('--check'),command.join(' '));assert(existsSync(new URL(command[0],root)),command[0]);}
  }
  for(const name of ['patrick-biography-family-integration','patrick-biographies','character-identity-retirements','gethin-character-links','creature-bestiary'])assert(task.commands.some(command=>command.includes(`AleriaAlmanach/tests/${name}.test.mjs`)),name);
});
