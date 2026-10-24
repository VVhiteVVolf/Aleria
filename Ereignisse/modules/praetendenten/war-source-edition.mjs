import edition from './war-source-edition.json' with {type:'json'};

export const WAR_EDITION=Object.freeze({
  version:edition.version,date:edition.date,policy:edition.policy,
  decisions:Object.freeze(edition.decisions.map(Object.freeze))
});
export const WAR_EDITION_CHANGES=Object.freeze(edition.changes.map(Object.freeze));

// Apply an auditable edition to copies. An upstream change must be reconciled
// explicitly: stale passages cannot silently receive an unrelated correction.
export function applyWarSourceEdition(originals,changes=WAR_EDITION_CHANGES){
  const sources=originals.map(source=>structuredClone(source));
  const byId=new Map(sources.map(source=>[source.id,source]));
  const decisionIds=new Set(WAR_EDITION.decisions.map(decision=>decision.id));
  const applied=new Map();
  for(const change of changes){
    const source=byId.get(change.source);
    if(!source||source.duplicateOf||!decisionIds.has(change.decision))throw new Error(`Invalid war edition decision: ${change.source}/${change.decision}`);
    if(change.path[0]!=='blocks'||change.path.some(key=>['__proto__','prototype','constructor'].includes(key)))throw new Error('Invalid war edition path');
    let target=source;
    for(const key of change.path.slice(0,-1))target=target?.[key];
    const key=change.path.at(-1);
    if(!target||JSON.stringify(target[key])!==JSON.stringify(change.before))throw new Error(`Stale war edition passage: ${change.source}/${change.path.join('/')}`);
    target[key]=structuredClone(change.after);
    if(!applied.has(source.id))applied.set(source.id,new Set());
    applied.get(source.id).add(change.decision);
  }
  for(const source of sources){
    const canonical=source.duplicateOf||source.id;
    if(source.duplicateOf)source.blocks=structuredClone(byId.get(canonical).blocks);
    source.edition=Object.freeze({version:WAR_EDITION.version,date:WAR_EDITION.date,decisions:Object.freeze([...(applied.get(canonical)||[])])});
  }
  return Object.freeze(sources);
}
