import { techniqueCost, temporaryCondition, secondarySave, weaponDamageEffect } from '../../combat-styles/drachentanz/techniques/drachentanz-technique-factory.js';

const costs = (id, resources) => resources.map((resource,index) => techniqueCost(id,resource,index));
const bypass = { allowed:false, resourceId:'aura-focus', cost:1 };
const attack = (id,name,formula,resources,description,extra = {}) => ({
  id,name,minimumLevel:4,status:'confirmed',active:true,category:'technique',trainingForm:'Gramnir · Jagdausbildung',
  weaponTypes:['natural'],compatibleWeaponIds:['freki-biss'],damageFormula:formula,damageModel:{mode:'fixed',scalingSteps:[]},
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
  attack('freki-schnappen','Schneller Fang','1d4',['bonus-action'],
    'Ein kurzer Schnapper verursacht 1W4 + KRF Stichschaden. Ein einzelner Angriff ohne zusätzliche Wirkung.'),
  attack('freki-fesselbiss','Fesselbiss','1d6',['action','reaction'],
    '1W6 + KRF Stichschaden. Nach Treffer KRF-Rettungswurf gegen SG 12; bei Fehlschlag −2 m Bewegung für einen eigenen Beitrag. Keine vollständige Fesselung.',
    {secondarySave:secondarySave('freki-fesselbiss','Verbissener Schritt','−2 m Bewegung für einen eigenen Beitrag.',{movement:-2})}),
  attack('freki-jagdsprung','Wuchtiger Jagdsprung','2d6',['action','special-action'],
    'Ein kraftvoller Biss verursacht 2W6 + KRF Stichschaden. Kein automatisches Umwerfen, kein zweiter Angriff und keine zusätzliche Bewegung.')
];

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
];
