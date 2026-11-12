// Editorial projection of the commissioned guard profiles. Runtime writes are
// owned by firebase/scripts/content/draig-garde-publication.mjs.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { DRAIG_GARDE_PEOPLE } from '../../../Stammbäume/assets/js/data/draig-garde-people.js';
import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { buildSuppliedGuardAvatarPatch, SUPPLIED_GUARD_AVATAR_PEOPLE } from './supplied-avatar-plan.mjs';
import { getDraigGardeEntry } from './draig-leibgarde-entry.mjs';

export const DRAIG_GARDE_CHARACTER_FEATURE = 'draig-garde-20261112';
const TITLES = Object.freeze({ 'marared-curiad':'Sir', 'pellinard-brandyddyn':'Sir', 'ysabel-bronnor':'Lady',
  'eurgain-brandyddyn':'Lady', 'urien-caelrith':'Sir', 'mathon-curiad':'Sir' });
const PROTECTED_FIELDS = ['inventory','combatProfile','mechanics','playerOwner','ownerUid','createdBy'];
const shortLabels = ['Redend','Freundlich','Nachdenklich','Skeptisch','Überrascht','Genervt','Entschlossen','Konfrontativ','Unsicher'];

function media(mediaByKey,key) {
  const row=mediaByKey.get(key); assert(row && (row.verifiedURL || row.url),`Geprüftes Bild fehlt: ${key}`);
  return row.verifiedURL || row.url;
}

export function buildGuardAvatarSource(person,mediaByKey) {
  const numbers=person.numbers || [1];
  return { id:person.id, name:person.name, slug:person.slug,
    portrait:media(mediaByKey,`portrait:${person.slug}`),
    sets:numbers.map(number=>{
      const rows=[...mediaByKey.values()].filter(row=>row.characterId===person.slug && row.kind==='avatar' && row.catalogNumber===number)
        .sort((first,second)=>first.index-second.index);
      assert.equal(rows.length,9,`${person.name}: Set ${number} unvollständig.`);
      assert.deepEqual(rows.map(row=>row.index),[1,2,3,4,5,6,7,8,9]);
      return {id:number===1?'standard':`set-${String(number).padStart(2,'0')}`,workshopSetId:`set-${String(number).padStart(2,'0')}`,
        catalogNumber:number,name:rows[0].setName,
        outputs:rows.map(row=>({...row,url:media(mediaByKey,row.key)}))};
    }) };
}

function ownCandidate(person) {
  const record=FAMILY_REGISTRY.find(record=>record.id===person.familyId);assert(record,`Familie fehlt: ${person.familyId}`);
  const candidate=createFamilyCandidates(record).find(candidate=>candidate.personId===person.id);
  assert.equal(candidate?.worldPersonId,person.worldPersonId,`Weltidentität abweichend: ${person.id}`);
  return candidate;
}

export function buildMinimalGuardBiography(person,portrait) {
  const bio=`${person.name} dient in der Draig-Leibgarde (${person.role}). ${person.ageEstimate} nach äußerem Erscheinungsbild (unbestätigte Schätzung).`
    +(person.notes?` ${person.notes}`:'');
  const biography=sanitizeCharacterBiographyForFirestore({biography:{schema:'aleria.biography-module',schemaVersion:1,
    pageTitle:person.name,stats:[['Name',person.name],['Dienst',person.role],['Alter nach Aussehen',`${person.ageEstimate} · unbestätigte Schätzung`]],
    biography:{portrait,biographyTitle:'Grundbiografie',biographyText:`<p>${bio}</p>`}}}).biography;
  return {bio,biography};
}

function libraryForNewGuard(person,mediaByKey,now) {
  const source=buildGuardAvatarSource({id:person.worldPersonId,name:person.name,slug:person.id,numbers:[1]},mediaByKey);
  const emotes=source.sets[0].outputs.map((row,index)=>({img:row.url,label:shortLabels[index]}));
  return {portrait:source.portrait,emotes,emotesOverride:true,imageSetSchemaVersion:1,
    imageSets:[{id:'standard',name:'Standard',portrait:source.portrait,emotes,createdAt:now,updatedAt:now}],
    activeImageSetId:'standard',imageSetsOverride:true};
}

function onlineFamilyProjection(imported) {
  const result=structuredClone(imported);
  for(const field of PROTECTED_FIELDS)delete result[field];
  // Newly authored house pages remain local until a website release; identity
  // and relationship data remain useful without links to unpublished pages.
  result.genealogy.sources=result.genealogy.sources.map(source=>({...source,url:''}));
  return result;
}

const PUBLIC_ORIGIN='https://dieweltvonaleria.netlify.app';
function publicModuleAssets(value) {
  if(Array.isArray(value))return value.map(publicModuleAssets);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,publicModuleAssets(child)]));
  if(typeof value==='string'&&value.startsWith('./public/assets/'))return `${PUBLIC_ORIGIN}/AleriaAlmanach/${value.slice(2)}`;
  if(typeof value==='string'&&value.startsWith('../Stammbäume/assets/'))return `${PUBLIC_ORIGIN}/Stammbäume/${value.slice('../Stammbäume/'.length)}`;
  return value;
}

export async function buildTargets({existingById,mediaByKey,now}) {
  assert(existingById instanceof Map && mediaByKey instanceof Map && Number.isFinite(Date.parse(now)));
  const creates=[],patches=[];
  for(const person of DRAIG_GARDE_PEOPLE){
    const candidate=ownCandidate(person), portrait=media(mediaByKey,`portrait:${person.id}`);
    const minimal=buildMinimalGuardBiography(person,portrait);
    if(person.existingCharacterId){
      const existing=existingById.get(person.existingCharacterId);assert.equal(existing?.name,person.name);
      const fixed=SUPPLIED_GUARD_AVATAR_PEOPLE.find(row=>row.id===person.existingCharacterId);assert(fixed);
      const patch=buildSuppliedGuardAvatarPatch(existing,buildGuardAvatarSource(fixed,mediaByKey),now);
      const genealogy=onlineFamilyProjection(buildImportedCharacter(candidate,existing,now));
      patches.push({id:existing.id,patch:{...patch,...minimal,title:`${TITLES[person.id]} · ${person.role}`,role:person.role,
        identity:genealogy.identity,genealogy:genealogy.genealogy,updatedAt:now}});
    }else{
      const data={...onlineFamilyProjection(buildImportedCharacter(candidate,null,now)),...libraryForNewGuard(person,mediaByKey,now),
        ...minimal,title:TITLES[person.id]?`${TITLES[person.id]} · ${person.role}`:person.role,role:person.role,
        fraktion:'Draig Leibgarde',name:person.name,aliases:[...person.aliases]};
      assert(PROTECTED_FIELDS.every(field=>!Object.hasOwn(data,field)));
      creates.push({id:person.worldPersonId,data});
    }
  }
  for(const person of SUPPLIED_GUARD_AVATAR_PEOPLE.filter(person=>!DRAIG_GARDE_PEOPLE.some(row=>row.existingCharacterId===person.id))){
    const existing=existingById.get(person.id);assert.equal(existing?.name,person.name);
    patches.push({id:person.id,patch:buildSuppliedGuardAvatarPatch(existing,buildGuardAvatarSource(person,mediaByKey),now)});
  }
  const paths=['Stammbäume/assets/js/data/draig-garde-people.js','Stammbäume/assets/js/data/draig-garde-house-families.js',
    'AleriaAlmanach/modules/draig-leibgarde/draig-garde-characters.mjs','AleriaAlmanach/modules/draig-leibgarde/supplied-avatar-plan.mjs',
    'AleriaAlmanach/modules/draig-leibgarde/draig-leibgarde-entry.mjs','AleriaAlmanach/modules/draig-leibgarde/draig-garde-active-levels.mjs',
    'AleriaAlmanach/AvatarWerkstatt/Anleitungen/avatar-prompt-sets.json'];
  const sourceBindings=await Promise.all(paths.map(async path=>({path,sha256:createHash('sha256').update(await readFile(path)).digest('hex')})));
  assert.equal(creates.length,8);assert.equal(patches.length,3);
  return {creates,patches,sourceBindings,moduleEntry:publicModuleAssets(getDraigGardeEntry({mediaByKey}))};
}
