/** Reviewed cartouches on both unchanged 4096×2349 map images. */
export const MAP_LABEL_REPLACEMENTS = Object.freeze([
  { settlementId:'alvanista', rect:[24.487305,5.87484,4.882813,1.95828] },
  { settlementId:'aspio', rect:[6.274414,20.476799,4.394531,3.27799] },
  { settlementId:'zaphias', rect:[53.125,44.997871,5.761719,3.235419] },
  { settlementId:'allantaic', rect:[3.857422,44.870158,5.102539,2.383993] },
].map(entry => Object.freeze({...entry,rect:Object.freeze(entry.rect)})));
