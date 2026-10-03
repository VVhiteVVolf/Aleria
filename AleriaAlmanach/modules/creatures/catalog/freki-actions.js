import { techniqueCost, temporaryCondition, secondarySave, weaponDamageEffect } from '../../combat-styles/drachentanz/techniques/drachentanz-technique-factory.js';
import { createWeaponTechniqueDamageProfile } from '../../combat-styles/weapon-technique-budget.js';
import { reviseMartialPositionEntry } from '../../combat-styles/martial-position-effects.js';

const costs = (id, resources) => resources.map((resource,index) => techniqueCost(id,resource,index));
const bypass = { allowed:false, resourceId:'aura-focus', cost:1 };
const attack = (id,name,resources,description,extra = {}) => ({
  id,name,minimumLevel:4,status:'confirmed',active:true,category:'technique',trainingForm:'Gramnir · Jagdausbildung',
  weaponTypes:['natural'],compatibleWeaponIds:['freki-biss'],
  ...createWeaponTechniqueDamageProfile({minimumLevel:4},costs(id,resources)),
  damageType:'Stich',activationType:resources[0],costs:costs(id,resources),auraBypass:{...bypass},
  description,effect:description,range:'Nahkampf · 1,5 m',target:'Ein Gegner',maximumTargets:1,
  effects:[weaponDamageEffect(id)],...extra
});
const ability = (id,name,resources,description,effects) => ({
  id,name,active:true,combatUsable:true,delivery:'ability',resolutionType:'automatic',activationType:resources[0],
  costs:costs(id,resources),auraBypass:{...bypass},target:'Selbst',range:'Selbst',description,effects,
  duration:'Ein eigener Gesamtbeitrag; temporäre TP gemäß Kampfregeln',tags:'Gramnir · Jagdausbildung'
});

export const FREKI_TECHNIQUES = [
  attack('freki-schnappen','Schneller Fang',['bonus-action'],
    'Ein kurzer Schnapper: Bisswürfel, höchstens W4, plus halbe positive feste Schadensboni. Kein Ausbildungswürfel.'),
  attack('freki-fesselbiss','Fesselbiss',['action','reaction'],
    'Normaler Biss plus ein Biss-Zusatzwürfel (höchstens W6) und erreichter Ausbildungswürfel. Nach Treffer KRF-Rettungswurf gegen SG 12; bei Fehlschlag −2 m Bewegung für einen eigenen Beitrag. Keine vollständige Fesselung.',
    {secondarySave:secondarySave('freki-fesselbiss','Verbissener Schritt','−2 m Bewegung für einen eigenen Beitrag.',{movement:-2})}),
  attack('freki-jagdsprung','Wuchtiger Jagdsprung',['action','special-action'],
    'Ein kraftvoller Biss: normaler Biss plus ein weiterer Bisswürfel und erreichter Ausbildungswürfel. Kein automatisches Umwerfen, kein zweiter Angriff und keine zusätzliche Bewegung.')
].map(reviseMartialPositionEntry);

const techniquesById = new Map(FREKI_TECHNIQUES.map(technique => [technique.id, technique]));
export function reconcileFrekiTechniques(profile = {}) {
  if (!profile.techniques?.some(technique => techniquesById.has(technique.id))) return profile;
  return { ...profile, techniques: profile.techniques.map(technique => {
    const current = techniquesById.get(technique.id);
    return current ? { ...technique, damageFormula: '', damageModel: structuredClone(current.damageModel),
      description: current.description, effect: current.effect,
      ...(current.secondarySave ? { secondarySave: structuredClone(current.secondarySave) } : {}) } : technique;
  }) };
}

export const FREKI_ACTIVE_ABILITIES = [
  ability('freki-flankenlauf','Flankenlauf',['bonus-action','reaction'],
    '+3 m Bewegungsbudget für einen eigenen Beitrag. Keine freie Bewegung und kein automatisches Entkommen aus einer Bindung.',
    [temporaryCondition('freki-flankenlauf','Flankenlauf','+3 m Bewegung für einen eigenen Beitrag.',{movement:3},{target:'self',on:'always'})]),
  ability('freki-ducken','Geduckte Wacht',['reaction'],
    '+2 RK für einen eigenen Beitrag. Muss vor einem späteren Angriff eingesetzt werden; verändert keine bereits ausgewerteten Treffer.',
    [temporaryCondition('freki-ducken','Geduckte Wacht','+2 RK für einen eigenen Beitrag.',{armorClass:2},{target:'self',on:'always'})]),
  ability('freki-durchhalten','Zäher Nordwolf',['bonus-action','special-action'],
    'Freki erhält 1W6 + KON temporäre TP. Ein vorhandener höherer Vorrat bleibt bestehen; keine Heilung und kein Wiederbeleben.',
    [{id:'freki-durchhalten-tp',type:'temporary-hit-points',target:'self',on:'always',formula:'1d6',bonusAttribute:'constitution'}])
].map(reviseMartialPositionEntry);
