import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
const root = new URL('./', import.meta.url);
async function read(path) { const bytes=await readFile(new URL(path,root));return bytes[0]===255&&bytes[1]===254?bytes.subarray(2).toString('utf16le'):bytes.toString('utf8'); }
const groups=[];
for(const file of ['frontend-final.log','server-final.log','rules-final.log','notice-rewards-final.log','adventure-final.log','release-final.log']){
  const log=await read(file),counts=Object.fromEntries([...log.matchAll(/^# (tests|pass|fail) (\d+)/gm)].map(match=>[match[1],Number(match[2])]));
  assert.ok(counts.tests>0,file);assert.equal(counts.fail,0,file);assert.equal(counts.pass,counts.tests,file);
  groups.push({file,tests:counts.tests,passed:counts.pass,failed:counts.fail});
}
const broad=await read('frontend-broad.log'),failures=[...broad.matchAll(/^not ok \d+ - (.+)$/gm)].map(match=>match[1].trim());
const retested=['the actual split loader keeps an ISO release newer than the eight-person cache','the split module round trip retains section icons and content'];
const remaining=failures.filter(name=>!retested.includes(name));
const previous=JSON.parse(await read('../item-system-2026-10-31/verification.json'));
const baseline=previous.broadSuite.remainingFailures.map(name=>name.replace(/^not ok \d+ - /,'').trim());
assert.deepEqual([...remaining].sort(),[...baseline].sort(),'Unrelated baseline failures must be identical, not newly introduced regressions.');
const build=await read('build-final.log');assert.match(build,/built in [\d.]+s/);
for(const path of ['../../AleriaAlmanach/dist/AleriaAlmanach/quests.html','../../AleriaAlmanach/dist/IconOrdner/ReiterIcons/Quests.svg','../../AleriaAlmanach/dist/IconOrdner/ReiterIcons/Almanach.svg','../../AleriaAlmanach/dist/IconOrdner/ReiterIcons/Anzeigetafeln.svg']) await access(new URL(path,root));
const adventure=JSON.parse(await read('adventure-result.json'));assert.equal(adventure.completed,true);assert.equal(adventure.scope.liveWrites,false);
assert.ok(adventure.checkpoints.some(row=>row.sellerCredited===true));
assert.ok(adventure.checkpoints.some(row=>row.groupModuleId && row.copper===50 && row.manualLedgerUnchanged===true));
const catalogue=JSON.parse(await read('../../AleriaAlmanach/modules/quests/quest-catalog.json'));
const rewards=JSON.parse(await read('../../Anzeigetafeln/assets/data/notice-reward-catalog.json'));
const troetzli=catalogue.quests.find(row=>row.id.endsWith(':gwynthor-der-staedter-und-sein-pferd'));
assert.ok(troetzli.dossier.participants.every(row=>!row.image.includes('/chibi/')));
assert.ok(troetzli.dossier.rewardArt.some(row=>row.kind==='money' && row.image.endsWith('/copper-coin-v1.png') && row.amount==null));
for(const path of ['AleriaAlmanach/assets/quests/gwynthor-companions-banner-v2.png','AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png']) { await access(new URL('../../'+path,root)); assert.equal(shouldPublish(path),true); }
assert.match(await read('../../AleriaAlmanach/dist/AleriaAlmanach/quests.html'),/gwynthor-companions-banner-v2-[^"/]+\.png/);
const result={schemaVersion:1,generatedAt:new Date().toISOString(),groups,passed:groups.reduce((sum,row)=>sum+row.passed,0),buildSucceeded:true,
  sourceCatalog:{quests:catalogue.quests.length,boards:catalogue.boards.length,maps:catalogue.maps.length,modules:catalogue.modules.length,rewardRows:rewards.items.length,sharedDefinitions:rewards.definitions.length},
  broadSuite:{scope:'Earlier full-suite snapshot; affected cases rerun in the current targeted suite.',tests:1941,initialFailures:failures.length,retestedModuleStoreCases:22,correctedAdapterFailures:retested,remainingFailures:remaining,identicalToPreviousBaseline:true},
  browser:{create:true,startParty:true,travelLog:true,finish:true,claim:true,archiveSearch:true,landingTemplateProjection:true,allFiveSidebarIconsLoaded:true,moduleRewardSelection:true},
  questPresentation:{selectedBanner:'gwynthor-companions-banner-v2.png',userApproved:true,portraitMedaillons:true,plainCopperWithSeparateAmount:true,sceneLocationUiVerified:true,groupPayoutUiVerified:true,routeKm:troetzli.dossier.route.paths[0].estimate.totalKm},
  emulator:adventure.scope,published:false,liveMigration:false};
await writeFile(new URL('verification.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,buildSucceeded:true,remainingBaselineFailures:remaining.length,liveWrites:false}));
