import { traitSaveDisadvantage } from './development-trait-rules.js';
const skill=(name,bonus)=>({name,bonus});
const affinity=(damageType,response,magicScope='any')=>({damageType,response,magicScope});
export const EXTRA_TRAIT_DEFINITIONS = [
 ['frost-phobie','Frostphobie','Nachteil bei Rettungswürfen gegen kältebasierte Angriffe. Die Angst erhöht nicht den erlittenen Kälteschaden.',{},-2,{triggerRules:traitSaveDisadvantage('frostangst',{damageTypes:['kälte','kaelte','cold']})}],
 ['blitz-phobie','Blitzphobie','Nachteil bei Rettungswürfen gegen Blitzangriffe. Die Angst erhöht nicht den erlittenen Blitzschaden.',{},-2,{triggerRules:traitSaveDisadvantage('blitzangst',{damageTypes:['blitz','lightning']})}],
 ['gift-phobie','Giftphobie','Nachteil bei Rettungswürfen gegen giftbasierte Angriffe. Die Angst erhöht nicht den erlittenen Giftschaden.',{},-2,{triggerRules:traitSaveDisadvantage('giftangst',{damageTypes:['gift','poison']})}],
 ['magie-phobie','Magiephobie','Nachteil bei Rettungswürfen gegen Zauber, Gebete und magische Lieder. Gewöhnliche Waffenangriffe bleiben unberührt.',{},-3,{triggerRules:traitSaveDisadvantage('magieangst',{actionKinds:['spell','prayer','song']})}],
 ['heilerhaende','Heilerhände','Sicheres Gespür bei der Versorgung: +2 auf Heilkunde und +1 auf Naturkunde.',{skillModifiers:[skill('Heilkunde',2),skill('Naturkunde',1)]},2],
 ['spuernase','Spürnase','Ausgeprägte Beobachtungsgabe: +2 auf Nachforschungen und +1 auf Wahrnehmung.',{skillModifiers:[skill('Nachforschungen',2),skill('Wahrnehmung',1)]},2],
 ['buehnenbegabt','Bühnenbegabt','Gespür für Ausdruck und Bewegung: +2 auf Auftreten und +1 auf Akrobatik.',{skillModifiers:[skill('Auftreten',2),skill('Akrobatik',1)]},2],
 ['flinke-finger','Flinke Finger','Geschickte, ruhige Hände: +2 auf Fingerfertigkeit und +1 auf Heimlichkeit.',{skillModifiers:[skill('Fingerfertigkeit',2),skill('Heimlichkeit',1)]},2],
 ['faehrtenleser','Geborener Fährtenleser','Gespür für Spuren und Wildnis: +2 auf Überleben und +1 auf Naturkunde.',{skillModifiers:[skill('Überleben',2),skill('Naturkunde',1)]},2],
 ['luegenriecher','Lügenriecher','Aufmerksam für Widersprüche: +1 auf Motiv erkennen und WEI-Rettungswürfe.',{skillModifiers:[skill('Motiv erkennen',1)],saveAttributeModifiers:[{attributeKey:'wisdom',bonus:1}]},2],
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
