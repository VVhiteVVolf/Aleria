const text=value=>String(value||'').trim().slice(0,100);
export function getCharacterClassIds(profile={}) {
  const selection=profile.templateSelections||profile;
  return [...new Set([selection.classId,...(Array.isArray(selection.classIds)?selection.classIds:[])].map(text).filter(Boolean))].slice(0,20);
}
export function normalizeAdditionalClassSelections(selection={}) {
  selection=selection&&typeof selection==='object'?selection:{};
  const classIds=getCharacterClassIds(selection);
  const name=text(selection.customClass?.name);
  return {...(classIds.length>1?{classIds}:{}),...(name&&classIds.includes('custom')?{customClass:{name,description:String(selection.customClass.description||'').trim().slice(0,1200)}}:{})};
}
