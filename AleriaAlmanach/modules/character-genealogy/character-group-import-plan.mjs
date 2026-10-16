import { buildImportedCharacter } from './genealogy-mapping.js';
export function retiredFamilySources(families,worldPersonId) {
  return families.flatMap(family=>(family.extensions?.registryTransferredPersons || [])
    .filter(person=>person.worldPersonId===worldPersonId)
    .map(person=>({familyId:family.document.id,personId:person.personId})));
}
function mergedSources(prior,candidates,now,retiredSources=[]) {
  let sources=(prior.genealogy?.sources || []).filter(source=>!retiredSources.some(retired=>
    retired.familyId===source.familyId && retired.personId===source.personId));
  for(const candidate of candidates) {
    const source=sources.find(s=>s.familyId===candidate.familyId && s.personId===candidate.personId);
    if(source?.fingerprint===candidate.fingerprint) continue;
    const updated=buildImportedCharacter(candidate,{...prior,genealogy:{...prior.genealogy,sources}},now)
      .genealogy.sources.find(item=>item.familyId===candidate.familyId && item.personId===candidate.personId);
    sources=source?sources.map(item=>item===source?{...item,...updated}:item):[...sources,updated];
  }
  return sources;
}

/** Pure publication plan. Existing profiles receive family sources only; their
 * portraits, prose, equipment and live data remain owned by the profile itself. */
export function planFamilyCharacterGroup({members,existingCharacters=[],config={},group,now=new Date().toISOString()}) {
  const entries=members.map(member=>{
    const candidate=member.primaryCandidate || member.candidates[0] || member.identityCandidate;
    if(!candidate?.worldPersonId || member.candidates.some(c=>c.worldPersonId!==candidate.worldPersonId)) throw new Error(`Mehrdeutige Identität: ${member.key}`);
    const matches=existingCharacters.filter(c=>c.id===candidate.worldPersonId || (c.identity?.worldPersonId || c.genealogy?.worldPersonId)===candidate.worldPersonId);
    if(matches.length>1) throw new Error(`Doppelte Online-Identität: ${member.key}`);
    const prior=matches[0],identity=prior?.identity?.worldPersonId || prior?.genealogy?.worldPersonId;
    if(identity && identity!==candidate.worldPersonId) throw new Error(`Widersprüchliche Online-Identität: ${member.key}`);
    const base={id:prior?.id || candidate.worldPersonId,key:member.key,group:member.subgroup};
    if(prior) {
      const sources=mergedSources(prior,member.candidates,now,member.retiredSources);
      return {...base,create:false,patch:JSON.stringify(sources)===JSON.stringify(prior.genealogy?.sources || [])?null:{genealogy:{sources},updatedAt:now}};
    }
    const data=buildImportedCharacter(candidate,null,now);
    data.genealogy.sources=[];
    data.genealogy.sources=mergedSources(data,member.candidates,now);
    Object.assign(data,member.profile);
    return {...base,create:true,data};
  });
  const add=(before,ids)=>[...new Set([...(before || []),...ids])];
  const tabs=add(config.tabs,[group]);
  const groups=[...new Set(entries.map(e=>e.group))];
  const subtabMap={...config.subtabMap,[group]:{...config.subtabMap?.[group]}};
  for(const label of groups) subtabMap[group][label]=add(subtabMap[group][label],entries.filter(e=>e.group===label).map(e=>e.id));
  return {entries,config:{tabs,map:{...config.map,[group]:add(config.map?.[group],entries.map(e=>e.id))},
    subtabs:{...config.subtabs,[group]:add(config.subtabs?.[group],groups)},subtabMap}};
}
