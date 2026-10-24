// Settlement centres read from the existing Reichskarte (1163 × 763).
// These are approximate reference points, never troop or exact battle positions.
export const WAR_MAP=Object.freeze({
  image:'../../../Kontinente/assets/images/aldrimar/reichskarte.png',width:1163,height:763,
  firstYear:1627,lastYear:1647,
  provenance:'Kontinente/docs/aldrimar/assets.json · reichskarte',
  sha256:'a275d58277b0efa3332c86bb8eecf64610bbc3c15b9057817c295085995a0d5a'
});

export const WAR_MAP_SITES=Object.freeze([
  {id:'heldenwacht',label:'Heldenwacht',x:981,y:184},
  {id:'ivarsfels',label:'Ivarsfels',x:393,y:148},
  {id:'rorikshall',label:'Rorikshall',x:402,y:445},
  {id:'trauerwald',label:'Trauerwald',x:833,y:182},
  {id:'wellenruh',label:'Bei Wellenruh',x:1006,y:309},
  {id:'flusswall',label:'Flusswall',x:630,y:228},
  {id:'schwertfall',label:'Bei Schwertfall / Yogrim',x:219,y:388},
  {id:'wolfswacht',label:'Wolfswacht',x:522,y:510},
  {id:'finstermoor',label:'Finstermoor',x:590,y:346},
  {id:'dunkelmoor',label:'Dunkelmoor',x:712,y:309}
].map(Object.freeze));

export const WAR_MAP_EVENT_PLACES=Object.freeze({
  'roger-astrid':'heldenwacht','uebernahme-heldenwacht':'heldenwacht',
  'aufruhr-ivarsfels':'ivarsfels','aufruhr-rorikshall':'rorikshall',
  'trauerwald':'trauerwald','erste-seeschlacht-wellenruh':'wellenruh',
  'flusswall':'flusswall','hurinn':null,'yogrim':'schwertfall',
  'belagerung-schwertfall':'schwertfall','wolfswacht':'wolfswacht',
  'zweite-seeschlacht-wellenruh':'wellenruh','belagerung-heldenwacht':'heldenwacht',
  'hinterhalt-rorikshall':'rorikshall','ermordung-bjoern':'finstermoor',
  'ceitheach-rorikshall':'rorikshall','dunkelmoor':'dunkelmoor'
});

// Spanning dates stay out of JavaScript Date parsing (Aleria has 13 months).
export const WAR_MAP_DATE_EXCEPTIONS=Object.freeze({
  'belagerung-heldenwacht':Object.freeze({firstYear:1631,lastYear:1637})
});
