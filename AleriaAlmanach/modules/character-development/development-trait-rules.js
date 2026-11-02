// Shared save-only filters prevent phobias from altering the attacker's roll.
const damageNames = {
  feuer:['feuer','fire'], 'kälte':['kälte','kaelte','cold'], blitz:['blitz','elektrisch','elektrizität','lightning'],
  gift:['gift','poison'], 'säure':['säure','saeure','acid'], donner:['donner','schall','thunder','sonic']
};
const expandedTypes = types => [...new Set(types.flatMap(type=>damageNames[String(type).toLowerCase()]||[String(type).toLowerCase()]))];
export function traitDamageAffinities(affinities) {
  return affinities.flatMap(affinity=>expandedTypes([affinity.damageType]).map(damageType=>({...affinity,damageType})));
}
export function traitSaveDisadvantage(id, filters = {}) {
  return ['pre-roll','pre-secondary-save'].map(phase=>({
    id:`${id}-${phase}`,name:id,phase,recipient:'target',sourceRelation:'self',activation:'passive',frequency:'always',condition:'always',
    saveAttributes:['strength','dexterity','constitution','intelligence','wisdom','charisma'],
    ...filters,...(filters.damageTypes?{damageTypes:expandedTypes(filters.damageTypes)}:{}),effects:{rollMode:'disadvantage'}
  }));
}
