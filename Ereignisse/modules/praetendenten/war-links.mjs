// Dossier references share one path policy across the timeline and event reading pages.
export function warEventHref(event,depth=0){
  if(event.existingHref)return `${depth?'../../../../':'../../../'}${event.existingHref}`;
  return event.file?`${depth?'../':'./'}${event.file}`:null;
}
