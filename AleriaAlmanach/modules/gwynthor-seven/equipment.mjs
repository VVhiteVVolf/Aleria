// Editorial loadouts use ordinary weapon dice and carry no personal training.
import { GWYNTHOR_EQUIPMENT_ARTWORK } from './equipment-artwork.mjs';
const art = file => `/AleriaAlmanach/assets/gwynthor-seven/items/${file}.png`;
const oldArt = file => `/AleriaAlmanach/public/assets/character-equipment/${file}.png`;
const weapon = (type, profile, dice, damage, properties = '', range = 'Nahkampf') => ({
  kind:'weapon',weaponType:type,weaponProfileId:profile,training:'martial',damageFormula:dice,damageType:damage,
  attackAttribute:['bow','dagger'].includes(type)?'dexterity':'strength',proficient:true,attackBonus:0,damageBonus:0,range,properties,triggerRules:[],
  ammunition:type==='bow'?{required:true,amountPerUse:1,reloadAfter:0}:null
});
const definitions = [
 ['rhosyn-kleid','Rhosyns weinrotes Kleid','kleidung',art('rhosyn-kleid'),null,'Weinrotes Kleid mit langem Rock und dezentem goldenen Turmzeichen nach Rhosyns Porträt.'],
 ['saerwyn-kleid','Saerwyns pflaumenfarbenes Kleid','kleidung',art('saerwyn-kleid'),null,'Pflaumenfarbenes Kleid mit goldenen Borten, gerafften Ärmeln und breitem Taillengürtel nach Saerwyns Porträt.'],
 ['wyrm-ritterschwert','Wyrm Ritterschwert','waffen',art('wyrm-ritterschwert'),weapon('sword','sword','1d8','Hieb','Einhändig · Langschwert'),'Riannas gewöhnliches Langschwert. Der Hausname verleiht keinen magischen Bonus und ist kein Großschwertprofil.'],
 ['rianna-dolch','Dolch','waffen','/AleriaAlmanach/assets/gofrann-schmiede/items/stahldolch.png',weapon('dagger','dagger','1d4','Stich','Einhändig · Leicht · Finesse · Wurfwaffe','Nahkampf · Wurf 6/18 m'),'Schlichter Stahldolch für Rianna.'],
 ['draig-ritterschwert','Draig Ritterschwert','waffen','https://i.imgur.com/bthNwPb.png',{...weapon('sword','sword','1d8','Hieb','Einhändig · Vielseitig'),versatileDamageFormula:'1d10'},'Owetas gewöhnliches Draig-Ritterschwert. Vorhandene Hausbauform; keine persönlichen Angriffs-, Schadens- oder Ausbildungsboni.'],
 ['draig-dolch','Draig Dolch','waffen',oldArt('draig-dolch-v1'),weapon('dagger','dagger','1d4','Stich','Einhändig · Leicht · Finesse · Wurfwaffe','Nahkampf · Wurf 6/18 m'),'Owetas Draig-Dolch in der vorhandenen Hausbauform. Keine persönlichen Sonderboni.'],
 ['helwyr-langbogen','Helwyr Langbogen','waffen',oldArt('guinevere-langbogen-v4'),weapon('bow','longbow','1d8','Stich','Zweihändig · Munition','45/180 m'),'Vorhandene Helwyr-Bauform und vorhandenes Inventarbild übernommen.'],
 ['helwyr-kurzbogen','Helwyr Kurzbogen','waffen',oldArt('guinevere-kurzbogen-v3'),weapon('bow','shortbow','1d6','Stich','Zweihändig · Munition','24/96 m'),'Vorhandene Helwyr-Bauform und vorhandenes Inventarbild übernommen.'],
 ['gafyr-ritterschwert','Gafyr Ritterschwert','waffen',art('gafyr-ritterschwert'),weapon('sword','sword','1d8','Hieb','Einhändig · Langschwert'),'Lefrayes einhändiges Gafyr-Langschwert ohne persönliche Schadens- oder Ausbildungsboni.'],
 ['helwyr-kampfdolch','Helwyr Kampfdolch','waffen',art('helwyr-kampfdolch'),weapon('dagger','dagger','1d4','Stich','Einhändig · Leicht · Finesse · Für beidhändige Führung geeignet'),'Ein leichter Kampfdolch. Zwei getrennte Besitzstücke bilden Lefrayes Paar; die gemeinsame Zweiwaffenlogik bestimmt den Einsatz.'],
 ['signalpfeil','Signalpfeil','munition',oldArt('guinevere-signalpfeile-v1'),null,'Signalmunition. Signalwirkung situativ auswerten; kein automatischer Zusatzschaden.'],
 ['feuerpfeil','Feuerpfeil','munition',oldArt('guinevere-feuerpfeile-v1'),null,'Brandmunition. Anzünden und Feuerwirkung gesondert auswerten; keine kostenlose Zusatzattacke.'],
 ['standardpfeil','Standard Pfeil','munition',oldArt('guinevere-standardpfeile-v1'),null,'Gewöhnlicher Pfeil. Der Schaden stammt vom geführten Bogen.'],
 ['chwedonol-dreizack','Chwedonol Dreizack','waffen',art('chwedonol-dreizack'),{...weapon('spear','trident','1d8','Stich','Vielseitig'),versatileDamageFormula:'1d10'},'Dreizack in grünen und goldenen Hausfarben.'],
 ['chwedonol-enteraxt','Chwedonol Enteraxt','waffen',art('chwedonol-enteraxt'),weapon('axe','boarding-axe','1d6','Hieb','Einhändig · Enterhaken'),'Handliche Enteraxt für das Gedränge an Deck.'],
 ['chwedonol-harpune','Chwedonol Harpune','waffen',art('chwedonol-harpune'),weapon('spear','harpoon','1d6','Stich','Einhändig · Wurfwaffe · Leine gesondert befestigen','Nahkampf · Wurf 6/18 m'),'Eine Harpune. Ziehen erfordert eine intakte befestigte Leine und ein passendes Manöver mit Rettungswurf.'],
 ['netz','Netz','werkzeuge',art('netz'),null,'Ein Wurf- und Fangnetz. Kein automatischer Zustand ohne ausgearbeitete Aktion.'],
 ['seil','Seil','werkzeuge','/AleriaAlmanach/assets/pendrwn-general-store/goods/seil.png',null,'Hanfseil, 15 m. Die Verbindung mit Netz oder Harpune muss tatsächlich hergestellt werden.']
];
for (const [id,name,house] of [
 ['briallen-awenor','Briallens Awenor-Rüstung','haus-awenor'],['rianna-wyrm','Riannas Wyrm-Rüstung','haus-wyrm'],
 ['evie-rhyddid','Evies Rhyddid-Rüstung','haus-rhyddid'],['lefraye-gafyr','Lefrayes Gafyr-Rüstung','haus-gafyr'],
 ['caralyn-chwedlonol','Caralyns Chwedonol-Rüstung','haus-chwedlonol'],
 ['draig-jungritter','Draig - Jungritter Plattenrüstung','haus-draig']
]) definitions.push([`${id}-ruestung`,name,'ruestungen',id==='lefraye-gafyr'?art('lefraye-ruestung'):`/AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/${house}-harnisch-v1.png`,
 {kind:'armor',armorKind:'armor',armorCategory:'heavy',baseArmorClass:15,armorClassBonus:0,dexterityMode:'none',dexterityCap:0,
 damageProtection:{name:'Plattengrundschutz',amount:1,damageTypes:['hieb','stich','wucht'],excludedDamageTypes:[]},properties:'Schwere Startrüstung',triggerRules:[]},
 'Persönliche Startrüstung in den Porträt- und Hausfarben: Stufe 1, RK 15 ohne GES und −1 gegen Hieb/Stich/Wucht. Keine persönlichen Sonderboni.']);
export function buildGwynthorSevenItems({ publishedArtwork = true } = {}) {
 return definitions.map(([key,title,category,image,combatDefinition,description])=>({
  id:`gwynthor-seven:${key}`,canonicalKey:`gwynthor-seven:${key}`,title,category:category==='kleidung'?'sonstiges':category==='munition'?'werkzeuge':category,image:publishedArtwork ? GWYNTHOR_EQUIPMENT_ARTWORK[image]?.url || image : image,combatDefinition,description,
  type:category==='waffen'?'Waffe':category==='ruestungen'?'Rüstung':category==='kleidung'?'Kleidung':category==='munition'?'Munition':'Ausrüstung',
  section:'standard',categoryLabel:category,aliases:[],tags:['Gwynthor','Individuelle Ausrüstung'],priceRange:null,stock:null,
  attributes:[],infoRows:[],updatedAt:0,mechanicsStatus:combatDefinition?'defined':'narrative',inventoryUseMode:'use',
  sourceRefs:[{kind:'authored-equipment',sourceId:key,sourcePage:'AleriaAlmanach/modules/gwynthor-seven/README.md'}],hiddenMeta:{origin:'Gwynthor · Autorenauftrag 02.11.2026'}
 }));
}
export const GWYNTHOR_SEVEN_LOADOUTS = {
 'rhosyn-awenydd':[['rhosyn-kleid',1,true]],'saerwyn-gwyllach':[['saerwyn-kleid',1,true]],
 'briallen-awenor':[['briallen-awenor-ruestung',1,true]],'evie-rhyddid':[['evie-rhyddid-ruestung',1,true]],
 'rianna-wyrm':[['rianna-wyrm-ruestung',1,true],['wyrm-ritterschwert',1,true],['rianna-dolch',1,false]],
 'oweta-draig':[['draig-jungritter-ruestung',1,true],['draig-ritterschwert',1,true],['draig-dolch',1,false]],
 'lefraye-gafyr':[['lefraye-gafyr-ruestung',1,true],['helwyr-langbogen',1,true],['helwyr-kurzbogen',1,false],['gafyr-ritterschwert',1,false],['helwyr-kampfdolch',1,false],['helwyr-kampfdolch',1,false],['signalpfeil',3,false],['feuerpfeil',2,false],['standardpfeil',30,false]],
 'caralyn-chwedlonol':[['caralyn-chwedlonol-ruestung',1,true],['chwedonol-dreizack',1,true],['chwedonol-enteraxt',1,false],['chwedonol-harpune',3,false],['netz',1,false],['seil',1,false]]
};
