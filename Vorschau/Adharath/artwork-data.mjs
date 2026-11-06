export const REALM_ARTWORK = Object.freeze({
  id:'realm-duinreach',
  name:'Dúinreach · Volkswappen der Adharath',
  image:'assets/emblems/previews/realm-duinreach.webp',
  fullsize:'assets/emblems/production/realm-duinreach.png',
  description:'Das antike Zeichen des untergegangenen Fürstentums bleibt zugleich das Volkswappen der Adharath. Ein Riesenadler und ein kleinerer albischer Krieger stehen nebeneinander auf einem Berggipfel.',
  status:'Historisches Fürstentumswappen und heutiges Volkszeichen',
});

/** Public view models link only admitted artwork, never private generator originals. */
export function displayArtwork(item){
  const fullsize=item.fullsize||item.crest||item.image;
  return Object.freeze({...item,image:item.preview||item.image||item.crest,fullsize});
}
