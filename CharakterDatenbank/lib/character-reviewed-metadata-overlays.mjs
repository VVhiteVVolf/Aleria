const MARKER='__aleriaReviewedCharacterMetadata';

export function markReviewedCharacterMetadata(character,exportedAt){
  if(!character?.id||!Number.isFinite(Date.parse(exportedAt))||Object.hasOwn(character,'inventory')||Object.hasOwn(character,'combatProfile'))throw Error('Ein geprüfter Metadatenbeleg darf keine Inventar- oder Kampfmomentaufnahme enthalten.');
  Object.defineProperty(character,MARKER,{value:{exportedAt},enumerable:false});
  return character;
}

// A later full archive is authoritative, including explicit deletions or a new
// name. Discard the stale receipt before grouping; it must not recreate the old
// name as a second record or fill a deliberately cleared biography.
export function currentReviewedMetadataSources(sources){
  const newest=new Map();
  for(const source of sources)if(!source?.[MARKER]&&source?.id&&!isCharacterTraitOverlay(source)&&!isCharacterTechniqueOverlay(source)
    &&Object.hasOwn(source,'inventory')&&(Object.hasOwn(source,'biography')||Object.hasOwn(source,'genealogy'))){
    const timestamp=Date.parse(source.updatedAt||'')||0;
    newest.set(source.id,Math.max(newest.get(source.id)||0,timestamp));
  }
  return sources.filter(source=>!source?.[MARKER]
    ||Date.parse(source[MARKER].exportedAt)>=(newest.get(source.id)||0));
}
import { isCharacterTraitOverlay } from './character-trait-overlays.mjs';
import { isCharacterTechniqueOverlay } from './character-technique-overlays.mjs';
