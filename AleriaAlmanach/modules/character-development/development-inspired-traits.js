// General options inspired by public profiles; personal variants remain intact.
const advantage = (id,skillId) => [{id,phase:'pre-roll',recipient:'actor',sourceRelation:'self',
  activation:'passive',frequency:'always',condition:'always',actionKinds:['skill'],skillIds:[skillId],effects:{rollMode:'advantage'}}];
const skill = (name,bonus) => ({name,bonus});
export const INSPIRED_TRAIT_DEFINITIONS = [
 ['buehnensicher','Bühnensicher','Vorteil bei Auftreten-Proben. Mehrere Quellen von Vorteil geben keine zusätzlichen Würfel.',{},3,{triggerRules:advantage('buehnensicherheit','performance')}],
 ['arkan-geschult','Arkan geschult','Vorteil bei Proben auf Arkane Kunde. Gibt keinen zusätzlichen Zauberangriffs- oder Zauber-SG-Bonus.',{},3,{triggerRules:advantage('arkane-schulung','arcane-kunde')}],
 ['frohnatur','Frohnatur','Offenes, ansteckend fröhliches Auftreten: je +1 auf Überzeugen, Auftreten und Flirten.',{skillModifiers:[skill('Überzeugen',1),skill('Auftreten',1),skill('Flirten',1)]},2],
 ['buehnenmensch','Bühnenmensch','Auf der Bühne zuhause, in der Wildnis ungeübt: +1 auf Auftreten; −1 auf Überleben.',{skillModifiers:[skill('Auftreten',1),skill('Überleben',-1)]},0]
];
