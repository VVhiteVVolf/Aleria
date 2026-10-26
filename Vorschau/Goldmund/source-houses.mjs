import {albicClans} from './albic-clans.mjs?v=20261026-8';

const delivered = [
 ['broeck','Broeck'],['goldveld','Goldveld'],['lanette','Lanette'],
 ['roden','Roden'],['roosenvelt','Roosenvelt']
];

const newHouses = [
 {id:'aurelshain',name:'Arenberg',theme:'Aurelianerpferde · Pferdezucht',description:'Ein goldenes Aurelianerpferd als stolzes Hauptmotiv. Vorschlag für ein Haus mit besonderer Verbindung zur Pferdezucht.'},
 {id:'gueldenfels',name:'Velten',theme:'Gold · Beständigkeit',description:'Ein goldener Steinbock. Ein kraftvolles, hochadeliges Motiv für Gold, Besitz und unerschütterlichen Anspruch.'},
 {id:'falkengold',name:'Severin',theme:'Stolz · Höfische Würde',description:'Ein gekrönter schwarzer Falke mit rotem Edelstein auf Elfenbein, gefasst in Silber. Das Motiv verbindet adeligen Stolz mit der feierlichen Pracht Goldmunds.'},
 {id:'rebenkron',name:'Belcourt',theme:'Wein · Edle Güter',description:'Ein silberner Kelch mit grünem Weinlaub und purpurnen Trauben, gefasst in Bronze. Ein Entwurf für Wohlstand durch erlesenen Wein und höfische Gastlichkeit.'},
 {id:'seidenwarth',name:'Lanvier',theme:'Kostbare Stoffe · Extravaganz',description:'Ein saphir- und petrolblauer Pfau auf hellem Elfenbein, gefasst in Silber. Ein Vorschlag für ein Haus, dessen Bildsprache an Seide, kostbare Stoffe und höfischen Luxus anknüpft.'},
 {id:'greifenau',name:'Marholt',theme:'Pompöses Rittertum · Turnierkultur',description:'Ein schwarzer Greif mit silberner Turnierlanze auf warmem Ocker, gefasst in Bronze. Stolze Wehrhaftigkeit und repräsentatives Rittertum als heraldischer Schwerpunkt.'},
 {id:'eitelborn',name:'Belmont',theme:'Höfische Eitelkeit · Eleganz',description:'Ein eitler schwarzer Pudel mit silbernen Schurpompons und Perlenhalsband auf hellem Altrosa, gefasst in Silber. Ein selbstbewusster, verspielter Entwurf für höfische Eleganz.'},
 {id:'herzau',name:'Arden',theme:'Aurelianerpferde · Verbundenheit',description:'Zwei goldene Aurelianerpferde wenden sich zärtlich einander zu, ihre Nasen berühren sich und ihre Halslinien formen ein Herz. Dunkles Weinrot und ein Silberrahmen fassen das Motiv.'},
 {id:'silberhorst',name:'Berden',theme:'Bussard · Stolze Wachsamkeit',description:'Ein silberner Bussard mit goldenen Flügelspitzen auf Nachtblau, gefasst in Bronze. Ein stolzes heraldisches Tier mit einem fein abgestimmten Wechsel aus Silber und Gold.'},
 {id:'samtborn',name:'Sorel',theme:'Edle Katze · Höfische Anmut',description:'Eine weiße heraldische Edelkatze mit silbernem Saphirhalsband auf dunklem Grün, gefasst in Bronze. Ein Entwurf mit ruhiger Anmut und kostbaren Akzenten.'},
 {id:'weisshorn',name:'Wolter',theme:'Weißer Stier · Würde und Kraft',description:'Ein weißer heraldischer Stier auf dunklem Purpur, gefasst in einem schwarzsilbernen Rahmen. Klare Kraft und adelige Würde als Hauptmotiv.'}
];

export const sourceHouses = Object.freeze([
 ...delivered.map(([id,name])=>Object.freeze({id,name,crest:`crests/${id}.webp`,original:`assets/originals/houses/${id}.png`,fullsize:['goldveld','roden','lanette'].includes(id)?`assets/production/${id}.png`:`assets/originals/houses/${id}.png`,rank:id==='goldveld'?'prince':id==='roden'?'knight-prince':'open',sourceSeat:['goldveld','roden'].includes(id)?'thronholt':null,source:'Geliefertes Haus',revised:['goldveld','roden','lanette'].includes(id),description:id==='goldveld'?'Die Fürstenfamilie in Thronholt. Der neue Entwurf verwendet einen goldenen Löwen und einen goldenen Rahmen.':id==='roden'?'Die Ritterfürstenfamilie in Thronholt. Der neue Entwurf zeigt eine Prunkkutsche, gezogen von goldenen Aurelianerpferden.':id==='lanette'?'Der neue Entwurf zeigt einen golden gerüsteten Reiter mit vorgehaltener Lanze.':'Geliefertes Hauswappen. Sitz und weitere Rolle sind in dieser Vorbereitung noch offen.'})),
 ...newHouses.map(house=>Object.freeze({...house,crest:`crests/${house.id}.webp`,original:null,sourceOriginal:null,fullsize:`assets/production/${house.id}.png`,rank:'open',sourceSeat:null,source:'Neuer Hausvorschlag',proposed:true,isNew:true})),
 ...albicClans
]);
