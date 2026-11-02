import { traitSaveDisadvantage } from './development-trait-rules.js';
const training=(name)=>({name,proficiency:'expertise'});
const skill=(name,bonus)=>({name,bonus});
const affinity=(damageType,response,magicScope='any')=>({damageType,response,magicScope});
export const EXTRA_TRAIT_DEFINITIONS = [
 ['frost-phobie','Frostphobie','Doppelter Kälteschaden und Nachteil bei Rettungswürfen gegen kältebasierte Angriffe.',{},-3,{damageAffinities:[affinity('kälte','vulnerable')],triggerRules:traitSaveDisadvantage('frostangst',{damageTypes:['kälte','kaelte','cold']})}],
 ['blitz-phobie','Blitzphobie','Doppelter Blitzschaden und Nachteil bei Rettungswürfen gegen Blitzangriffe.',{},-3,{damageAffinities:[affinity('blitz','vulnerable')],triggerRules:traitSaveDisadvantage('blitzangst',{damageTypes:['blitz','lightning']})}],
 ['gift-phobie','Giftphobie','Doppelter Giftschaden und Nachteil bei Rettungswürfen gegen giftbasierte Angriffe.',{},-3,{damageAffinities:[affinity('gift','vulnerable')],triggerRules:traitSaveDisadvantage('giftangst',{damageTypes:['gift','poison']})}],
 ['magie-phobie','Magiephobie','Nachteil bei Rettungswürfen gegen Zauber, Gebete und magische Lieder. Gewöhnliche Waffenangriffe bleiben unberührt.',{},-3,{triggerRules:traitSaveDisadvantage('magieangst',{actionKinds:['spell','prayer','song']})}],
 ['heilerhaende','Heilerhände','Expertise in Heilkunde und +1 auf Naturkunde.',{skillProficiencies:[training('Heilkunde')],skillModifiers:[skill('Naturkunde',1)]},4],
 ['spuernase','Spürnase','Expertise in Nachforschungen und +1 auf Wahrnehmung.',{skillProficiencies:[training('Nachforschungen')],skillModifiers:[skill('Wahrnehmung',1)]},4],
 ['buehnenbegabt','Bühnenbegabt','Expertise in Auftreten und +1 auf Akrobatik.',{skillProficiencies:[training('Auftreten')],skillModifiers:[skill('Akrobatik',1)]},4],
 ['flinke-finger','Flinke Finger','Expertise in Fingerfertigkeit und +1 auf Heimlichkeit.',{skillProficiencies:[training('Fingerfertigkeit')],skillModifiers:[skill('Heimlichkeit',1)]},4],
 ['faehrtenleser','Geborener Fährtenleser','Expertise in Überleben und +1 auf Naturkunde.',{skillProficiencies:[training('Überleben')],skillModifiers:[skill('Naturkunde',1)]},4],
 ['luegenriecher','Lügenriecher','Expertise in Motiv erkennen und +1 auf WEI-Rettungswürfe.',{skillProficiencies:[training('Motiv erkennen')],saveAttributeModifiers:[{attributeKey:'wisdom',bonus:1}]},4],
 ['feueraffinitaet','Feueraffinität','Resistenz gegen Feuerschaden.',{},3,{damageAffinities:[affinity('feuer','resistant')]}],
 ['eisaffinitaet','Eisaffinität','Resistenz gegen Kälteschaden.',{},3,{damageAffinities:[affinity('kälte','resistant')]}],
 ['blitzaffinitaet','Blitzaffinität','Resistenz gegen Blitzschaden.',{},3,{damageAffinities:[affinity('blitz','resistant')]}],
 ['saeureaffinitaet','Säureaffinität','Resistenz gegen Säureschaden.',{},3,{damageAffinities:[affinity('säure','resistant')]}],
 ['schallaffinitaet','Schallaffinität','Resistenz gegen Donnerschaden.',{},3,{damageAffinities:[affinity('donner','resistant')]}],
 ['giftanfaellig','Giftanfällig','Doppelter Giftschaden und −1 auf Rettungswürfe gegen Gift.',{saveModifiers:[{kind:'poison',bonus:-1}]},-3,{damageAffinities:[affinity('gift','vulnerable')]}],
 ['saeureempfindlich','Säureempfindlich','Doppelter Säureschaden.',{},-2,{damageAffinities:[affinity('säure','vulnerable')]}],
 ['blitzempfindlich','Blitzempfindlich','Doppelter Blitzschaden.',{},-2,{damageAffinities:[affinity('blitz','vulnerable')]}],
 ['schallempfindlich','Schallempfindlich','Doppelter Donnerschaden.',{},-2,{damageAffinities:[affinity('donner','vulnerable')]}],
 ['magische-resonanz','Magische Resonanz','Doppelter magischer Schaden aller Schadensarten. Nichtmagischer Schaden bleibt normal.',{},-4,{damageAffinities:[affinity('all','vulnerable','magical')]}]
];
