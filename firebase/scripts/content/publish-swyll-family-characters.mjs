// Explicit editorial release. Dry run by default; storage upload and one atomic
// character/config commit are separate, repeatable stages.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {getRegisteredFamily} from '../../../Stammbäume/assets/js/data/families.registry.js';
import {resolveRegisteredFamilyUpgrade} from '../../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import {createContentPublicationClient,backupContentPublication} from './content-publication-client.mjs';
import {decodeFirestoreFields,encodeFirestoreFields} from '../backup/firestore-value-codec.mjs';
import {planSwyllFamilyCharacters} from './swyll-family-character-plan.mjs';
import {SWYLL_FAMILY_PROFILES} from './swyll-family-biography-content.mjs';

const root=new URL('../../../',import.meta.url);
const release=new URL('AleriaAlmanach/assets/biographies/swyll-family/2026-10-18/',root);
const staging=new URL('.tmp/swyll-family-2026-10-18/',root);
const save=(url,value)=>writeFile(url,JSON.stringify(value,null,2)+'\n');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const client=await createContentPublicationClient();
await mkdir(release,{recursive:true});

if(process.argv.includes('--upload-artwork')) {
  let previous={assets:[]};
  try {previous=JSON.parse(await readFile(new URL('avatar-publication.json',release),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const assets=[];
  for(const profile of SWYLL_FAMILY_PROFILES.filter(p=>p.avatarCharacter)) {
    const prefix=`AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/${profile.avatarCharacter}/`;
    const manifest=JSON.parse(await readFile(new URL(prefix+'avatar-manifest.json',root),'utf8'));
    assert(manifest.visualReview?.passed&&manifest.avatarCount===18,'Avatar-Sichtprüfung fehlt.');
    const jobs=manifest.sets.flatMap(set=>set.outputs.map(output=>({set,output})));
    for(let i=0;i<jobs.length;i+=6) {
      const batch=await Promise.all(jobs.slice(i,i+6).map(async({set,output})=>{
        const localFile=prefix+output.file,bytes=await readFile(new URL(localFile,root));
        assert.equal(digest(bytes),output.sha256,'Avatar nach der Prüfung verändert.');
        const assetId=`avatar-${profile.slug}-20261018-${set.setId}-${String(output.index).padStart(2,'0')}`;
        const old=previous.assets.find(a=>a.assetId===assetId);
        if(old)assert.equal(old.sha256,output.sha256,'Ein veröffentlichter Assetname darf nicht neu belegt werden.');
        const asset=await client.publishFamilyArtwork({familyId:profile.familyId,assetId,bytes,metadata:{character:profile.slug,setId:set.setId}});
        return {...asset,assetId,character:profile.slug,setId:set.setId,index:output.index,label:output.emotion,localFile};
      }));
      assets.push(...batch);
    }
    console.log(JSON.stringify({uploadedCharacter:profile.name,avatars:18}));
  }
  assert.equal(assets.length,54);
  await save(new URL('avatar-publication.json',release),{publishedAt:new Date().toISOString(),assets});
  console.log(JSON.stringify({artworkPublished:true,avatars:assets.length}));
}else {
  const records=await Promise.all(['haus-swyll','haus-draenmelyn'].map(async id=>{
    const response=await fetch('https://dieweltvonaleria.netlify.app/.netlify/functions/family-publisher?familyId='+id,{signal:AbortSignal.timeout(30000)});
    assert(response.ok,'Veröffentlichter Stammbaum fehlt.');
    const online=await response.json(),registered=getRegisteredFamily(id);
    return {...registered,family:resolveRegisteredFamilyUpgrade(registered.family,online.family)};
  }));
  const result=await client.request(':runQuery',{structuredQuery:{from:[{collectionId:'characters'}],select:{fields:['name','identity','genealogy.worldPersonId'].map(fieldPath=>({fieldPath}))}}});
  const names=new Set(SWYLL_FAMILY_PROFILES.map(p=>p.name));
  const worldIds=new Set(records.flatMap(record=>record.family.persons.filter(p=>SWYLL_FAMILY_PROFILES.some(profile=>profile.slug===p.id)).map(p=>p.worldPersonId)));
  const selected=result.filter(r=>r.document).map(r=>({id:r.document.name.split('/').at(-1),...decodeFirestoreFields(r.document.fields)})).filter(p=>names.has(p.name)||worldIds.has(p.id)||worldIds.has(p.identity?.worldPersonId)||worldIds.has(p.genealogy?.worldPersonId));
  const documents=await Promise.all(selected.map(p=>client.request('/characters/'+encodeURIComponent(p.id))));
  const existingCharacters=documents.map(raw=>({id:raw.name.split('/').at(-1),...decodeFirestoreFields(raw.fields)}));
  const configDocument=await client.request('/char_tabs/config'),config=decodeFirestoreFields(configDocument.fields);
  const {assets}=JSON.parse(await readFile(new URL('avatar-publication.json',release),'utf8'));
  assert.equal(assets.length,54);
  const avatarSets=Object.fromEntries(SWYLL_FAMILY_PROFILES.filter(p=>p.avatarCharacter).map(profile=>[profile.slug,['set-01','set-02'].map((setId,index)=>({
    id:'swyll-20261018-'+setId,name:index===0?'Gespräch & Gestik':'Gefühle & Reaktionen',
    emotes:assets.filter(a=>a.character===profile.slug&&a.setId===setId).sort((a,b)=>a.index-b.index).map(a=>({img:a.url,label:a.label.slice(0,20)}))
  }))]));
  const now=new Date().toISOString();
  const plan=planSwyllFamilyCharacters({records,existingCharacters,config,avatarSets,now});
  const changed=plan.entries.filter(e=>e.create||e.patch);
  const configPatch=Object.fromEntries(Object.entries(plan.config).filter(([key,value])=>!isDeepStrictEqual(config[key],value)));
  const summary={profiles:plan.entries.map(e=>({id:e.id,key:e.key,create:e.create,fields:Object.keys(e.patch||e.data||{})})),newAvatars:54,configChanged:Object.keys(configPatch).length>0,liveResourceWrites:0};
  await save(new URL('prepared-plan.json',staging),plan);
  console.log(JSON.stringify({dryRun:!process.argv.includes('--apply'),...summary},null,2));
  if(process.argv.includes('--apply')) {
    await backupContentPublication('swyll-family-2026-10-18',[...documents,configDocument],plan.entries.filter(e=>e.create).map(e=>'characters/'+e.id),now);
    const writes=changed.map(entry=>({update:{name:client.documentName('characters/'+entry.id),fields:encodeFirestoreFields(entry.create?entry.data:entry.patch)},
      ...(entry.create?{currentDocument:{exists:false}}:{updateMask:{fieldPaths:Object.keys(entry.patch)},currentDocument:{updateTime:documents.find(raw=>raw.name.endsWith('/'+entry.id)).updateTime}})}));
    if(Object.keys(configPatch).length)writes.push({update:{name:configDocument.name,fields:encodeFirestoreFields(configPatch)},updateMask:{fieldPaths:Object.keys(configPatch)},currentDocument:{updateTime:configDocument.updateTime}});
    const committed=writes.length?await client.request(':commit',{writes}):null;
    const after=await Promise.all(plan.entries.map(async entry=>{
      const document=await client.request('/characters/'+entry.id),data=decodeFirestoreFields(document.fields);
      if(entry.create)assert.deepEqual(data,entry.data);
      else {
        const prior=existingCharacters.find(p=>p.id===entry.id);
        for(const[key,value]of Object.entries(entry.patch||{}))assert.deepEqual(data[key],value,key);
        for(const[key,value]of Object.entries(prior))if(key!=='id'&&!(key in(entry.patch||{})))assert.deepEqual(data[key],value,'Unbeteiligtes Feld: '+key);
        for(const set of prior.imageSets||[])assert.deepEqual(data.imageSets.find(s=>s.id===set.id),set,'Vorhandenes Bildset verändert.');
      }
      return {id:entry.id,...data};
    }));
    const afterConfig=decodeFirestoreFields((await client.request('/char_tabs/config')).fields);
    assert.deepEqual(afterConfig,{...config,...configPatch},'Unbeteiligte Konfiguration verändert.');
    await save(new URL('characters-after.json',staging),after);
    const exportsDir=new URL('Charakter Archiv Exporte/Biographien/swyll-familie-2026-10-18/',root);
    await mkdir(exportsDir,{recursive:true});
    const exportedFields=['id','name','title','fraktion','bio','biography','role','portrait','identity','genealogy','taxonomyPath','createdAt','updatedAt','aliases','archived','imageSets','imageSetSchemaVersion','activeImageSetId','emotes','emotesOverride','imageSetsOverride'];
    for(const profile of SWYLL_FAMILY_PROFILES) {
      const entry=plan.entries.find(e=>e.key===profile.slug),character=after.find(p=>p.id===entry.id);
      const exported={type:'aleria-character',version:3,mergeStrategy:'replace-exported-fields',exportedAt:now,
        sourceNote:'Bestätigte Online-Übernahme: belegte Familiendaten und neue Avatarsets. Bestehende Online-IDs, Inventare und Kampfwerte erhalten.',
        character:Object.fromEntries(exportedFields.filter(k=>Object.hasOwn(character,k)).map(k=>[k,character[k]]))};
      await save(new URL(profile.slug+'-charakter.json',exportsDir),exported);
      await save(new URL('Charakter Archiv Exporte/'+profile.slug+'-familienabgleich-2026-10-18.json',root),exported);
    }
    await save(new URL('publication-verification.json',release),{publishedAt:committed?.commitTime||now,characters:after.map(p=>({id:p.id,name:p.name,portrait:p.portrait,biography:!!p.biography,newAvatarSets:p.imageSets?.filter(s=>s.id.startsWith('swyll-20261018-')).map(s=>({id:s.id,name:s.name,avatars:s.emotes.length}))||[]})),createdProfiles:plan.entries.filter(e=>e.create).length,newAvatars:54,existingImageSetsUnchanged:true,unrelatedProfileFieldsUnchanged:true,liveResourceWrites:0});
    console.log(JSON.stringify({applied:true,created:plan.entries.filter(e=>e.create).length,verifiedProfiles:after.length,newAvatars:54,unrelatedFieldsPreserved:true}));
  }
}
