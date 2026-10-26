import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourceProposal,sourceProposals,variants} from '../Moinneach/proposal-data.mjs';
import {createProposalState} from '../Moinneach/proposal-state.mjs';
import {escapeHtml,renderSettlements,renderVariants,renderRegions} from '../Moinneach/proposal-render.mjs';
import {regionalDesigns,individualBanners} from '../Moinneach/regional-designs.mjs';
import {warriors} from '../Moinneach/warrior-data.mjs';
import {renderClanDetails} from '../Moinneach/clan-details.mjs';

const root=new URL('../Moinneach/',import.meta.url);

test('every clan has a preserved warrior, a real class link and editable variant-specific details',async()=>{
 const manifest=JSON.parse(await readFile(new URL('assets/warriors/manifest.json',root),'utf8'));
 const prompts=JSON.parse(await readFile(new URL('assets/warriors/prompts.json',root),'utf8'));
 const classes=await readFile(new URL('../../Klassenordner/Klassenseite.html',root),'utf8');
 assert.deepEqual(warriors.map(item=>item.id).sort(),sourceProposal.clans.map(item=>item.id).sort());
 assert.equal(manifest.entries.length,11);
 assert.equal(prompts.prompts.length,11);
 for(const warrior of warriors){
  const entry=manifest.entries.find(item=>item.id===warrior.id);
  assert.ok(entry&&warrior.materials&&warrior.resourceBasis&&warrior.helmet,warrior.id);
  assert.ok(classes.includes(`id="klasse-moinneach-${warrior.classId}"`),warrior.classId);
  assert.deepEqual(entry.alpha.dimensions,[1024,1536]);
  assert.equal(entry.alpha.touchesCanvas,false,warrior.id);
  assert.equal(entry.proof.rgbUnchanged,true);
  for(const [file,hash] of [[entry.source,entry.sourceSha256],[entry.production,entry.productionSha256],[entry.preview,entry.previewSha256]]){
   assert.equal(createHash('sha256').update(await readFile(new URL(file,root))).digest('hex'),hash,file);
  }
  const prompt=prompts.prompts.find(item=>item.id===warrior.id);
  assert.ok(prompt.prompt.length>1000&&prompt.references.length>=3,warrior.id);
  for(const proposal of sourceProposals){
   const clan=proposal.clans.find(item=>item.id===warrior.id);
   const html=renderClanDetails(proposal,clan,true);
   assert.ok(html.includes(warrior.image)&&html.includes(warrior.fullsize));
   assert.ok(html.includes(`#klasse-moinneach-${warrior.classId}`));
   assert.ok(html.includes(`value="${clan.seat}" selected`));
   assert.match(html,/data-role="clan-form"/);
  }
 }
 const state=createProposalState(sourceProposals);
 state.update('barrex',{seat:'gergonax',note:'<draft>'});
 assert.match(renderClanDetails(state.current(),state.current().clans[0],false),/&lt;draft&gt;/);
 assert.equal(sourceProposal.clans[0].seat,'tarvex');
});

test('Brigantex uses its corrected Druchtan crest and bestiary reference, preserving the supplied original',async()=>{
 const art=JSON.parse(await readFile(new URL('brigantex-art.json',root),'utf8'));
 const audit=JSON.parse(await readFile(new URL('brigantex-alpha-audit.json',root),'utf8'));
 const supplied=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));
 const original=supplied.find(item=>item.file===art.original);
 assert.ok(original);
 assert.equal(createHash('sha256').update(await readFile(new URL(art.original,root))).digest('hex'),original.sha256);
 assert.notDeepEqual(await readFile(new URL(art.original,root)),await readFile(new URL(art.production,root)));
 assert.equal(audit.rgbUnchanged,true);
 const clan=sourceProposal.clans.find(item=>item.id==='brigantex');
 const html=renderClanDetails(sourceProposal,clan,false);
 assert.ok(html.includes(warriors.find(item=>item.id==='brigantex').creatureHref));
 assert.match(html,/auf einem Drúchtán/);
 assert.doesNotMatch(html,/zu Pferd/);
 assert.ok(html.includes(art.original));
 await stat(new URL(art.bestiary,root));
 assert.match(art.prompt,/FOUR/);
 assert.match(art.bannerCorrection.prompt,/FOUR-LEGGED/);
});

test('all eleven supplied clans retain their explicit seats, including both clans in Tarvex',()=>{
 const expected={Barrex:'tarvex',Cethrenn:'tarvex',Kerlaouen:'druanax',Damona:'drunemax',Caddach:'amabactoix',Adruinna:'vironax',Avernax:'arvonax',Brigantex:'taranux',Keravel:'senodex',Nemetex:'camulax',Rowak:'gergonax'};
 assert.deepEqual(Object.fromEntries(sourceProposal.clans.map(clan=>[clan.name,clan.seat])),expected);
 assert.equal(sourceProposal.settlements.length,10);
 assert.equal(new Set(sourceProposal.clans.map(clan=>clan.id)).size,11);
 for(const place of sourceProposal.settlements){
  assert.ok(sourceProposal.clans.some(clan=>clan.seat===place.id),place.name);
  for(const position of [place.point,place.pin])assert.ok(position.length===2&&position.every(value=>Number.isFinite(value)&&value>=0&&value<=100));
 }
 assert.ok(sourceProposal.clans.every(clan=>clan.rank===null&&clan.liege===null));
 assert.deepEqual(variants.map(variant=>variant.regionCount),[10,3,5]);
 assert.equal((renderVariants(variants,'alternative-2').match(/aria-pressed="true"/g)||[]).length,1);
 assert.match(renderVariants(variants,'alternative-2'),/Fünf Sumpflande/);
});

test('eight named alternatives and all ten individual territories have square tribal banners',async()=>{
 assert.deepEqual(Object.keys(regionalDesigns),['alternative-1','alternative-2']);
 assert.deepEqual(Object.keys(individualBanners).sort(),sourceProposal.settlements.map(place=>place.id).sort());
 assert.ok(sourceProposal.regions.every(region=>region.design.kind==='banner-only'&&region.design.name===region.label&&!region.design.source));
 assert.equal(new Set(sourceProposal.regions.map(region=>region.design.banner)).size,10);
 const designs=sourceProposals.flatMap(proposal=>proposal.regions.flatMap(region=>region.design?.source?[region.design]:[]));
 assert.equal(designs.length,8);
 assert.equal(new Set(designs.map(design=>design.name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase())).size,8);
 const art=JSON.parse(await readFile(new URL('banner-art.json',root),'utf8'));
 assert.equal(art.length,10);
 for(const design of designs){
  assert.match(design.name,/^Tir na /);
  assert.ok(design.landscape&&design.rationale&&design.motif&&design.byname&&design.meaning);
  assert.ok(design.clanReferences.every(id=>sourceProposal.clans.some(clan=>clan.id===id)));
  assert.equal(new URL(design.source).hostname,'www.teanglann.ie');
  const metadata=art.find(asset=>asset.file===design.banner);
  assert.ok(metadata,design.name);
  assert.equal(metadata.style,'tribal-worn-v2');
 }
 for(const metadata of art){
  const bytes=await readFile(new URL(metadata.file,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),metadata.sha256);
  assert.equal(bytes.toString('ascii',1,4),'PNG');
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],metadata.dimensions);
  assert.equal(metadata.dimensions[0],metadata.dimensions[1]);
  assert.equal(bytes[25],6,'True RGBA output');
 }
 for(const proposal of sourceProposals){
  assert.equal((renderRegions(proposal).match(/data-action="show-region"/g)||[]).length,proposal.regions.length);
 }
 const alternatives=new Set(designs.map(design=>design.banner));
 const supplemental=sourceProposal.regions.map(region=>region.design.banner).filter(file=>!alternatives.has(file));
 assert.deepEqual(supplemental.sort(),['assets/marcach-banner-tribal.png','assets/ndragan-banner-tribal.png']);
 assert.equal(sourceProposal.regions.find(region=>region.id==='drunemax').design.banner,'assets/ndragan-banner-tribal.png');
 assert.equal(sourceProposal.regions.find(region=>region.id==='taranux').design.banner,'assets/marcach-banner-tribal.png');
});

test('territorial alternatives cover every city exactly once and keep independent working assignments',()=>{
 for(const proposal of sourceProposals){
  assert.deepEqual(proposal.regions.flatMap(region=>region.seats).sort(),proposal.settlements.map(place=>place.id).sort());
  assert.deepEqual(proposal.clans,sourceProposal.clans);
  assert.equal((renderRegions(proposal).match(/data-clan=/g)||[]).length,11);
 }
 assert.deepEqual(sourceProposals[1].regions.map(region=>region.seats),[
  ['tarvex','druanax','drunemax'],['gergonax','vironax','amabactoix'],['camulax','senodex','arvonax','taranux']]);
 assert.deepEqual(sourceProposals[2].regions.map(region=>region.seats),[
  ['tarvex','drunemax'],['druanax','gergonax'],['vironax','amabactoix'],['camulax','senodex'],['arvonax','taranux']]);
 const state=createProposalState(sourceProposals);
 state.update('barrex',{seat:'gergonax',note:'Erster Entwurf'});
 state.select('alternative-1');
 assert.equal(state.current().clans[0].seat,'tarvex');
 state.update('barrex',{seat:'camulax',note:'Zweiter Entwurf'});
 state.select('original');
 assert.equal(state.current().clans[0].seat,'gergonax');
 state.reset();
 state.select('alternative-1');
 assert.equal(state.current().clans[0].seat,'camulax');
 assert.throws(()=>state.select('missing'),/Unbekannte Variante/);
 assert.equal(sourceProposals[0].clans[0].seat,'tarvex');
});

test('editing a proposal preserves the original assignments and can be reset without persistence',()=>{
 const state=createProposalState(sourceProposal);
 state.update('barrex',{seat:'gergonax',note:'Ein alternativer Sitz.'});
 assert.equal(state.current().clans.find(clan=>clan.id==='barrex').seat,'gergonax');
 assert.equal(sourceProposal.clans.find(clan=>clan.id==='barrex').seat,'tarvex');
 assert.equal(state.current().clans.find(clan=>clan.id==='cethrenn').seat,'tarvex');
 assert.throws(()=>state.update('barrex',{seat:'missing',note:''}),/Unbekannter/);
 assert.throws(()=>state.update('barrex',{seat:'tarvex',note:'a'.repeat(1201)}),/Ungültige/);
 state.reset();assert.deepEqual(state.current(),sourceProposal);
 assert.deepEqual(createProposalState(sourceProposal).current(),sourceProposal);
 assert.equal(state.toggleEditing(),true);
 assert.equal(state.toggleEditing(),false);
 assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});

test('map and crests preserve the supplied original image bytes and actual image dimensions',async()=>{
 const manifest=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));
 assert.equal(manifest.length,15);
 for(const asset of manifest){
  const bytes=await readFile(new URL(asset.file,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
 }
 for(const proposal of sourceProposals){
  const map=await readFile(new URL(proposal.map,root));
  if(proposal.map.endsWith('.webp')){
   assert.equal(map.toString('ascii',8,16),'WEBPVP8X');
   assert.deepEqual([map.readUIntLE(24,3)+1,map.readUIntLE(27,3)+1],proposal.imageSize);
  }else{
   assert.equal(map.toString('ascii',1,4),'PNG');
   assert.deepEqual([map.readUInt32BE(16),map.readUInt32BE(20)],proposal.imageSize);
  }
 }
 for(const clan of sourceProposal.clans)await stat(new URL('assets/'+clan.crest,root));
 assert.equal(manifest.find(asset=>asset.file==='assets/adruinna.png').sourceFile,'Arduinna.png');
});

test('all local proposal dependencies resolve, with no canonical registry or remote persistence coupling',async()=>{
 for(const name of (await readdir(root)).filter(name=>/\.(html|mjs|css)$/.test(name))){
  const source=await readFile(new URL(name,root),'utf8');
  for(const match of source.matchAll(/(?:from\s+['"]|(?:src|href)="|url\(['"]?)(\.\.?\/[^'"\s)]+|assets\/[^'"\s)]+|[\w-]+\.(?:mjs|css))/g)){
   if(!match[1].includes('${'))await stat(new URL(match[1],root));
  }
  assert.doesNotMatch(source,/\bon(?:click|input|change)=|localStorage|sessionStorage|firebase|families\.registry|kontinente\.registry/i,name);
 }
 const cards=renderSettlements(sourceProposal);
 assert.equal((cards.match(/data-seat=/g)||[]).length,10);
 assert.equal((cards.match(/class="clan-entry"/g)||[]).length,11);
 assert.match(cards,/Adruinna/);assert.doesNotMatch(cards,/Arduinna/);
 const html=await readFile(new URL('index.html',root),'utf8');
 assert.match(html,/noindex,nofollow/);
});
