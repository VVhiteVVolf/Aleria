import {regions} from './regions.mjs';
import {clans,settlements} from './clans.mjs';

const rulers={laimhe:'laga',sruthan:'gealan',gcoillte:'conchobhair',taoide:'roich',dtorc:'midgna',conaire:'mata',cloiche:'luga'};
const baseRegions=regions.map(region=>({...region,rulerId:rulers[region.id],seat:region.id==='dtorc'?'Rinnmara':region.seat}));
const baseline={id:'original',number:1,title:'Sieben eigenständige Gebiete',short:'Ursprüngliche Gliederung',
 map:'assets/karte.webp',file:'Uathneach Städte Namen.png',
 summary:'Die ursprüngliche Karte mit deiner vollständigen Lehensgliederung. Alle sechs Mor-Tiarna-Clans behalten ihre eigenen Oberherrschaften.',
 strength:'Sechs eigenständige Gegenüber zum Fürsten; die Mac Midgna besitzen eine durchgehende südwestliche Küstenherrschaft.',
 tradeoff:'Ua Muirin dienen unmittelbar den Lága. Ihr Broch liegt auf dieser Karte westlich der Fürstendomäne und wird deshalb als fürstliches Sonderlehen geführt.',
 regions:structuredClone(baseRegions),clans:structuredClone(clans),settlements:structuredClone(settlements),changes:[]};
baseline.regions.find(r=>r.id==='taoide').note='Broch an Reithe liegt in der westlichen Kartenfläche, ist aber als Sonderlehen der Ua Muirin unmittelbar den Mac Ard’Lága unterstellt.';
baseline.regions.find(r=>r.id==='dtorc').note='Der Sitz wird nach der neueren Vorgabe und der Kartenbeschriftung als Rinnmara geführt.';
baseline.regions.find(r=>r.id==='dtorc').geography=baseline.regions.find(r=>r.id==='dtorc').geography.replaceAll('Rinmara','Rinnmara');

const second=structuredClone(baseline);
Object.assign(second,{id:'alternative-1',number:2,title:'Sieben neu zugeschnittene Gebiete',short:'Alternative Verteilung',map:'assets/karte-alternative-1.webp',file:'Uathneach Alternativ Verteilung.png',
 summary:'Sieben Gebiete bleiben bestehen. Bronnan wechselt in das zentrale Bergland; Broch an Reithe liegt jetzt in der nördlichen Fürstendomäne.',
 strength:'Die direkte Bindung der Ua Muirin an die Lága passt nun zur Fläche. Die Mac Midgna bleiben ein eigenständiger Mor-Tiarna-Clan.',
 tradeoff:'Dál Fastaigh würden ihr direktes Lehensverhältnis zum Fürsten verlieren und den An Gealân dienen. Der Rang als Dún Tiarna bleibt bestehen.',
 changes:[{clan:'fastaigh',title:'Bronnan → An Gealân',text:'Dál Fastaigh: direkt unter Mac Ard’Lága → unter An Gealân. Die Burg liegt auf dieser Karte im zentralen Gebiet. Rang unverändert.'},
 {clan:'muirin',title:'Sonderlehen wird Teil der Fürstendomäne',text:'Ua Muirin bleiben direkt unter den Lága. Nur der Grenzverlauf ändert sich; Broch an Reithe liegt nun innerhalb der nördlichen Fläche.'}]});
second.clans.find(c=>c.id==='fastaigh').liege='gealan';
const secondPlaces={bronnan:'sruthan',reithe:'laimhe'};
for(const place of second.settlements)place.region=secondPlaces[place.id]??place.region;
const secondRegions={
 laimhe:{colour:'#bd654e',point:[41,22],geography:'Die nördliche Fürstendomäne umfasst Dunnean, Féthlinn und den Küstenbroch an Reithe. Bronnan gehört jenseits der neuen Grenze zum zentralen Bergland.',note:'Ua Muirin bleiben unmittelbare Lairds der Lága; Dál Fastaigh werden in dieser Alternative den An Gealân unterstellt.'},
 sruthan:{colour:'#8c5b95',point:[49,40],geography:'Das zentrale Gebiet vereint Moineal und Treabhair mit Bronnan westlich des Gebirgszuges. Wasserläufe und Pässe verbinden den größeren Bergbezirk.',note:'Bronnan und seine Dún Tiarna Dál Fastaigh kommen hinzu.'},
 gcoillte:{colour:'#90a638',point:[71,38]},taoide:{colour:'#5e9c8b',point:[24,48],note:'Broch an Reithe liegt nun außerhalb der Roich-Fläche. Die Orglen-Lairds und Ua Cairge bleiben unverändert.'},
 dtorc:{colour:'#636f69',point:[40,66],geography:'Rinnmara und Broch an Cuan bilden weiterhin eine zusammenhängende westliche Küstenherrschaft. Die Ostgrenze läuft zwischen ihnen und den Orten um Rioghain und Kharanor.',note:'Mac Midgna bleiben Mor Tiarna. Ua Cuilen und An Cadhla dienen ihnen unverändert.'},
 conaire:{colour:'#4d9690',point:[79,20]},cloiche:{colour:'#6d993b',point:[54,82]}
};
for(const region of second.regions)Object.assign(region,secondRegions[region.id]);

const third=structuredClone(second);
Object.assign(third,{id:'alternative-2',number:3,title:'Sechs größere Gebiete',short:'Alternative Verteilung 2',map:'assets/karte-alternative-2.webp',file:'Uathneach Alternativ Verteilung2.png',
 summary:'Orglen und Rinnmara bilden ein gemeinsames Westgebiet. Broch an Cuan geht an das Südgebiet um Kharanor; Mhorcha an die östliche Oberherrschaft um Cathair.',
 strength:'Weniger Oberherrschaften und ein zusammenhängender Westküstenraum. Rinnmara bleibt als nachgeordneter Sitz der Mac Midgna erhalten.',
 tradeoff:'Die Mac Midgna würden zu Dún Tiarna unter den Mac Roich. Ua’Luga verlieren Ua Lasgair in Mhorcha und erhalten dafür An Cadhla am südlichen Broch.',
 changes:[...structuredClone(second.changes),
 {clan:'midgna',title:'Mac Midgna: Mor Tiarna → Dún Tiarna',text:'Rinnmara wird ein baronisches Lehen innerhalb der Roich-Oberherrschaft. Die Mac Midgna dienen künftig Mac Roich; Ua Cuilen bleiben ihre Lairds.'},
 {clan:'cadhla',title:'Broch an Cuan → Ua’Luga',text:'An Cadhla wechseln mit ihrem Broch von Mac Midgna zu Ua’Luga. Ihr Laird-Rang bleibt erhalten.'},
 {clan:'lasgair',title:'Mhorcha → Ard Conchobhair',text:'Ua Lasgair wechseln mit Mhorcha aus der südlichen in die östliche Oberherrschaft. Sie bleiben Dún Tiarna.'}]});
Object.assign(third.clans.find(c=>c.id==='midgna'),{rank:'Dún Tiarna',liege:'roich'});
third.clans.find(c=>c.id==='cadhla').liege='luga';
third.clans.find(c=>c.id==='lasgair').liege='conchobhair';
const thirdPlaces={rinnmara:'taoide',cuan:'cloiche',mhorcha:'gcoillte'};
for(const place of third.settlements)place.region=thirdPlaces[place.id]??place.region;
third.regions=third.regions.filter(r=>r.id!=='dtorc');
const thirdRegions={
 laimhe:{colour:'#b9a064'},sruthan:{colour:'#529a4a',geography:'Moineal, Treabhair und Bronnan bilden die zentrale Oberherrschaft. Ihr bewaldetes Hinterland reicht weiter nach Süden bis oberhalb von Rioghain.'},
 taoide:{colour:'#a3a747',point:[26,53],geography:'Das Westgebiet umfasst Orglen, Broch an Mhor und Rinnmara. Die Küstenwege verbinden die beiden Stadtsitze. Broch an Cuan liegt dagegen im südlichen Gebiet der Ua’Luga.',note:'Mac Roich führen die Oberherrschaft. Mac Midgna werden mit Rinnmara und ihren Lairds Ua Cuilen als Dún Tiarna untergeordnet.'},
 gcoillte:{colour:'#4d9995',point:[68,43],geography:'Die östliche Oberherrschaft verbindet Cathair und Dathuil mit Mhorcha an der südlichen Küste. Ua Lasgair werden mit diesem Ort den Ard Conchobhair unterstellt.',note:'Ua Lasgair behalten ihren Rang; die Grenze und der Lehnsherr wechseln.'},
 conaire:{colour:'#a2ac40'},cloiche:{colour:'#b66d55',point:[53,84],geography:'Kharanor, Rioghain und Broch an Cuan bilden das Südgebiet. Mhorcha liegt nun jenseits der Nordgrenze in der Oberherrschaft der Ard Conchobhair.',note:'Die Ua’Luga erhalten An Cadhla in Broch an Cuan und geben Ua Lasgair in Mhorcha ab.'}
};
for(const region of third.regions)Object.assign(region,thirdRegions[region.id]);

export const variants=[baseline,second,third];
// Ortslisten immer aus der jeweiligen Fläche ableiten, nie aus einer anderen Variante übernehmen.
for(const variant of variants)for(const region of variant.regions){
 region.places=variant.settlements.filter(p=>p.region===region.id).map(p=>p.name);
 region.seat=variant.settlements.find(p=>p.id===variant.clans.find(c=>c.id===region.rulerId).seat).name;
}
