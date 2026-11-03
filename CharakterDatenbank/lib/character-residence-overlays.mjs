const MARKER='__aleriaConfirmedCharacterResidence';

export function markCharacterResidenceOverlay(character,placement,exportedAt){
  if(placement?.kind!=='place'||!/^[a-z0-9-]+$/.test(placement.id||'')||!placement.label
    ||placement.source!=='confirmed-residence'||!Number.isFinite(Date.parse(exportedAt)))throw Error('Ungültiger bestätigter Wohnortbeleg.');
  Object.defineProperty(character,MARKER,{value:{placement:structuredClone(placement),exportedAt},enumerable:false});
  return character;
}

// A reviewed residence is independent of birth-house affiliation. This data
// receipt never changes the family's own geographical registration.
export function confirmedCharacterResidence(sources,fallback){
  const reviewed=sources.filter(source=>source?.[MARKER]).map(source=>source[MARKER])
    .sort((a,b)=>Date.parse(a.exportedAt)-Date.parse(b.exportedAt));
  return reviewed.length?structuredClone(reviewed.at(-1).placement):fallback;
}
