import { HOUSE_RAVES_FAMILY } from '../../../Stammbäume/assets/js/data/eleganz-family-records.js';

/** Project a recorded married-in household member into the shop's staff view. */
export function addRavesHouseholdStaff(trees) {
  const person=HOUSE_RAVES_FAMILY.persons.find(p=>p.id==='eirlys-vann');
  if(!person) return trees;
  const sales=trees.find(t=>t.id==='verkauf');
  const level=sales?.levels.find(l=>l.label==='Beratung im Verkaufsraum');
  if(!level) throw new Error('Raves-Verkaufsbereich fehlt.');
  const slot=level.nodes.findIndex(n=>n.id==='eleganz-post-verkauf-fest');
  if(slot<0) throw new Error('Vorgesehener freier Verkaufsposten fehlt.');
  level.nodes[slot]={id:'eleganz-person-eirlys-vann',title:person.name,subtitle:'Beratung · Festkleidung · 30 Jahre',
    portrait:person.portrait.replace('../AleriaAlmanach/','./'),text:'<p>Eirlys lebt seit ihrer Heirat mit Orestian im Haus Raves und berät die Kundschaft bei Festkleidung. Sie versieht keinen Dienst mehr in der Letzten Rast.</p>'};
  return trees;
}
