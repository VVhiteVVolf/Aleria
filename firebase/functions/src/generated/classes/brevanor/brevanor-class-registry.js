const entries=[
 ['kerant','Kerant','Einfache Miliz',true],
 ['breval','Breval','Ritter mit vielseitiger Bewaffnung',false],
 ['hastrel','Hastrel','Ritter mit Stangenwaffe',false],
 ['cantrel','Cantrel','Kampfbarde',false],
 ['havren','Havren','Ritter zur See',false],
 ['silvain','Silvain','Fernkämpfender Ritter',false],
 ['cabrant','Cabrant','Berittener Ritter',false]
];
const definitions=entries.map(([classId,name,role,militia])=>Object.freeze({schemaVersion:1,id:`brevanor-${classId}`,classId,name,role,militia,cultureId:'brevanor',culture:'Brevanor',cultures:Object.freeze(['Brevanor']),pagePath:`Klassenordner/Brevanor/${classId}/index.html`,status:'draft',progressionStatus:'not-authored',combatStyleGrants:Object.freeze([])}));
export const BREVANOR_CLASS_IDS=Object.freeze(definitions.map(d=>d.classId));
export const getBrevanorClassDefinitions=()=>structuredClone(definitions);
export function getBrevanorClassDefinition(id){
 const key=String(id??'').toLocaleLowerCase('de').replace(/^brevanor-/,'');
 const definition=definitions.find(d=>d.classId===key);
 return definition?structuredClone(definition):null;
}
