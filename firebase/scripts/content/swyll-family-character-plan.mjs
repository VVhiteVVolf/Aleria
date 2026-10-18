import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {createFamilyCandidates, buildImportedCharacter} from '../../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import {findBestCharacterMatch} from '../../../AleriaAlmanach/modules/character-genealogy/person-identity.js';
import {planFamilyCharacterGroup} from '../../../AleriaAlmanach/modules/character-genealogy/character-group-import-plan.mjs';
import {sanitizeCharacterBiographyForFirestore, stampFreshRevisions} from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';
import '../../../AleriaAlmanach/modules/image-library/image-library-model.js';
import {SWYLL_FAMILY_PROFILES} from './swyll-family-biography-content.mjs';

export const SWYLL_PROFILE_FIELDS = Object.freeze(['identity','genealogy','bio','biography','role','portrait','imageSets','imageSetSchemaVersion','activeImageSetId','emotes','emotesOverride','imageSetsOverride','updatedAt']);
const library=globalThis.AleriaCharacterImageSets;
const mapRelationships=candidates=>Object.fromEntries(['parents','partners','children'].map(kind=>[kind,[...new Map(candidates.flatMap(c=>c.relationships[kind]).map(r=>[r.worldPersonId,r])).values()]]));

function buildBiography(profile,candidates,people,portraits) {
  const primary=candidates.find(c=>c.familyId===profile.familyId);
  const relationships=mapRelationships(candidates);
  const family=candidates.find(c=>c.familyId==='haus-swyll')||primary;
  const parentIds=relationships.parents.map(p=>p.worldPersonId);
  const siblings=parentIds.length?people.filter(p=>p.worldPersonId!==primary.worldPersonId&&parentIds.every(id=>p.relationships.parents.some(parent=>parent.worldPersonId===id))):[];
  const groups=[['Eltern',relationships.parents],['Ehepartner',relationships.partners],['Kinder',relationships.children],['Geschwister',siblings.map(p=>({name:p.displayName,worldPersonId:p.worldPersonId}))]];
  return {schema:'aleria.biography-module',schemaVersion:1,
    stats:Object.entries({'Vollständiger Name':profile.name,'Geboren / Alter':`${profile.birth} · ${1740-Number(profile.birth)} Jahre (1740)`,'Stand':'Bürgerlich','Herkunft':'Gwynthor · Llamreis Ankunft · Celtigerns Wacht · Cenyr','Haus':primary.houseName,'Rolle':profile.role,
      ...(relationships.partners.length?{'Ehepartner':relationships.partners.map(p=>p.name).join(', ')}:{}),
      ...(relationships.children.length?{'Kinder':relationships.children.map(p=>p.name).join(', ')}:{}),
      ...(profile.slug==='gareth-swyll'?{'Familienstand':'Unverheiratet · keine Verlobung'}:{})}).map(([label,value])=>({label,value})),
    quote:'',quoteBy:'',biography:{biographyTitle:profile.name,biographyText:profile.paragraphs.map(p=>`<p>${p}</p>`).join(''),
      portrait:portraits[profile.slug]||profile.portrait,portraitFit:'contain',portraitStages:['','','',''],sideWidth:100,connectionPortraitHeight:74,connectionTextOffset:0,
      abilitiesTitle:'Persönlichkeit',abilities:[],historyTitle:'Familie und Herkunft',historyText:'',worksTitle:'Belegte Tätigkeit',works:profile.slug==='rhiannon-draenmelyn'?['Bedienstete des Hauses Draig.']:profile.slug==='meredith-swyll'?['Persönliche Zofe von Prinzessin Rhiannon.']:[],
      extraSections:[{title:'Noch offene Angaben',position:'afterWorks',mode:'text',text:`<p>${profile.open}</p>`}],trivia:[],quotes:[],connectionsTitle:'Familie',
      connections:groups.flatMap(([title,relations])=>relations.length?[{type:'heading',title,detail:''},...relations.map(person=>({type:'connection',name:person.name,detail:title==='Kinder'?'Gemeinsames Kind von Iestyn Swyll und Rhiannon Draenmelyn.':title==='Geschwister'?'Geschwister mit denselben belegten Eltern.':title==='Ehepartner'?'Eheliche Verbindung zwischen den Häusern Swyll und Draenmelyn.':'Belegtes Elternteil.',image:portraits[person.worldPersonId]||people.find(p=>p.worldPersonId===person.worldPersonId)?.portrait||'',imageFormat:'portrait'}))]:[]),
      documentsTitle:'Stammbaum',documents:[{title:'Haus Swyll',link:family.url||`/Stammbäume/Stammbaum.html?family=haus-swyll&mode=view&person=${profile.slug}`,text:'Familienzweig um Iestyn, Rhiannon und ihre drei Kinder.',icon:'/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png'},
        ...(profile.slug==='rhiannon-draenmelyn'?[{title:'Haus Draenmelyn',link:'/Stammbäume/Stammbaum.html?family=haus-draenmelyn&mode=view&person=rhiannon-draenmelyn',text:'Rhiannons Herkunftsfamilie.',icon:'/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Draenmelyn.png'}]:[])],footer:'Personenakte · '+profile.name}};
}

function extendImageLibrary(prior,portrait,sets,now) {
  const imageSets=library.normalize({...prior,portrait});
  for(const set of sets) {
    assert.equal(set.emotes.length,9,'Jedes neue Sheet muss neun Avatare liefern.');
    const existing=imageSets.find(s=>s.id===set.id);
    if(existing) {
      assert.equal(existing.portrait,portrait,'Das neue Set wurde online anderweitig bearbeitet.');
      assert.deepEqual(existing.emotes,set.emotes,'Das neue Set wurde online anderweitig bearbeitet.');
      continue;
    }
    imageSets.push({...set,portrait,createdAt:now,updatedAt:now});
  }
  assert(imageSets.length<=library.limit,'Bildset-Grenze überschritten.');
  return library.prepareStorage({...prior,imageSets});
}

/** Five explicit identities, field-limited updates, no inventory/combat writes. */
export function planSwyllFamilyCharacters({records,existingCharacters,config,avatarSets={},now=new Date().toISOString()}) {
  const candidates=records.flatMap(createFamilyCandidates);
  const portraits=Object.fromEntries(SWYLL_FAMILY_PROFILES.flatMap(p=>[[p.slug,p.portrait],[candidates.find(c=>c.personId===p.slug).worldPersonId,p.portrait]]));
  const bindings=new Map();
  for(const profile of SWYLL_FAMILY_PROFILES) {
    const candidate=candidates.find(c=>c.familyId===profile.familyId&&c.personId===profile.slug);
    assert(candidate,profile.slug);
    const matches=existingCharacters.map(p=>findBestCharacterMatch(candidate,[p])).filter(Boolean);
    assert(!matches.some(m=>m.kind==='conflict'),`Identitätskonflikt: ${profile.name}`);
    assert(matches.length<=1,`Doppelte Online-Akte: ${profile.name}`);
    if(matches[0])bindings.set(profile.slug,matches[0].character);
  }
  const normalizedExisting=[...bindings].map(([slug,prior])=>({...prior,identity:{...prior.identity,worldPersonId:candidates.find(c=>c.personId===slug).worldPersonId}}));
  const members=SWYLL_FAMILY_PROFILES.map(profile=>({key:profile.slug,subgroup:'Gwynthor - Haus Swyll',primaryCandidate:candidates.find(c=>c.familyId===profile.familyId&&c.personId===profile.slug),candidates:candidates.filter(c=>c.personId===profile.slug),profile:{}}));
  const group=planFamilyCharacterGroup({members,existingCharacters:normalizedExisting,config,group:'Gwynthor',now});
  const owner=bindings.get('iestyn-swyll');
  for(const entry of group.entries) {
    const profile=SWYLL_FAMILY_PROFILES.find(p=>p.slug===entry.key),member=members.find(m=>m.key===entry.key);
    const prior=bindings.get(entry.key);
    const primary=buildImportedCharacter(member.primaryCandidate,prior||null,now);
    const sources=entry.create?entry.data.genealogy.sources:(entry.patch?.genealogy?.sources||prior.genealogy?.sources||[]);
    const genealogy={...primary.genealogy,sources,relationships:mapRelationships(member.candidates)};
    const desired={identity:primary.identity,genealogy,
      ...(!prior?.bio?.trim()?{bio:profile.summary}:{}),...(!prior?.role?.trim()?{role:profile.role}:{}),
      ...(!prior?.portrait?{portrait:profile.portrait}:{}),
      ...(!prior?.biography?stampFreshRevisions({biography:buildBiography(profile,member.candidates,candidates,portraits)},['biography'],Date.parse(now)):{}),
      ...(profile.avatarCharacter?extendImageLibrary(prior||{},prior?.portrait||profile.portrait,avatarSets[profile.slug]||[],now):{})};
    if(entry.create)entry.data=sanitizeCharacterBiographyForFirestore({...entry.data,...desired,
      ...(owner?.ownerUid?{ownerUid:owner.ownerUid}:{}),...(owner?.createdBy?{createdBy:owner.createdBy}:{}),updatedAt:now});
    else {
      const patch=Object.fromEntries(Object.entries(desired).filter(([key,value])=>!isDeepStrictEqual(prior[key],value)));
      assert(Object.keys(patch).every(key=>SWYLL_PROFILE_FIELDS.includes(key)));
      entry.patch=Object.keys(patch).length?sanitizeCharacterBiographyForFirestore({...patch,updatedAt:now}):null;
    }
  }
  return group;
}
