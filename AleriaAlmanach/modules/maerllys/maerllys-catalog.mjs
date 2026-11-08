import { MAERLLYS_GARMENTS, MAERLLYS_CATEGORY_LABELS } from './maerllys-collection.mjs';

export const MAERLLYS_ART = './assets/maerllys';
const paragraph = text => `<p>${text}</p>`;
const money = copper => {
  const [currencyCode,currencyLabel,factor] = copper>=1000 ? ['GT','Goldtaler',1000] : copper>=100 ? ['ST','Silbertaler',100] : ['KT','Kupfertaler',1];
  return {priceMin:(copper/factor).toLocaleString('de-DE',{maximumFractionDigits:2}),priceMax:'',currencyCode,currencyLabel,currencyIcon:'◈'};
};
export function buildMaerllysCatalog() {
  const max = Math.max(...MAERLLYS_GARMENTS.map(item=>item.copper));
  return {headerIcon:`${MAERLLYS_ART}/schild.png`,title:'Güterregister',subtitle:'Naht & Siegel · Dienstkleidung aus dem Haus Maerllys',
    categories:Object.entries(MAERLLYS_CATEGORY_LABELS).map(([id,label])=>({id,label})),
    allLabel:'Alle Dienstgarnituren',filterLabel:'Aufgaben im Haushalt',searchPlaceholder:'Dienst, Schnitt oder Stoff suchen …',
    noteIcon:'✦',noteTitle:'Ein Hausbild. Für viele verschiedene Menschen.',noteText:'Die Preise gelten je beschriebener Garnitur in der gezeigten Ausführung. Für einen ganzen Haushalt werden Aufgaben, Maße, Stoffe, Mengen und Termin gemeinsam besprochen. Persönliche Hausfarben, Wappen und zusätzliche Ersatzteile werden vor einem Sonderauftrag gesondert vereinbart.',
    items:MAERLLYS_GARMENTS.map(item=>({id:item.id,category:item.category,title:item.name,subtitle:`${item.cut} · Cenyrische Dienstkleidung`,status:'available',badge:item.copper<=60?'Täglicher Dienst':item.copper>=500?'Förmlicher Hausdienst':'Hauslivree',
      image:`${MAERLLYS_ART}/kleidung/${item.id}.png`,imageFit:'contain',imagePosition:'center',imageFormat:'square',imageHeight:300,
      descriptionTitle:'Schnitt & Erscheinung',description:paragraph(item.appearance)+paragraph(item.purpose),
      featuresTitle:'Zur Garnitur',features:item.features.map(text=>({icon:'✦',title:'',text})),originTitle:'Stoff & Fertigung',origin:`${item.materials} · Zuschnitt und Fertigung in der Maerllys-Werkstatt in Gwynthor.`,
      usageTitle:'Einsatz im Haushalt',usageTags:[MAERLLYS_CATEGORY_LABELS[item.category]],tags:['Kleidung','Cenyrisch','Dienstkleidung',MAERLLYS_CATEGORY_LABELS[item.category],item.materials],
      ...money(item.copper),unit:'1 Garnitur',priceTitle:'Preis je beschriebener Garnitur',priceFill:15+85*item.copper/max,priceOptions:[],
      priceNote:'Enthalten sind die genannten Kleidungsteile und die übliche Anpassung. Schuhe, Schmuck, Abzeichen und nicht genannte Ausrüstung gehören nicht dazu. Ein Serienauftrag wird als eigener Gesamtauftrag vereinbart.',
      conditionsTitle:'Anprobe & Fertigung',conditions:'Fertigung nach Bestellung und Stoffvorrat. Maße, Ausführung und Fertigstellung werden vor Beginn bestätigt. Die letzte Anprobe erfolgt je Träger; Stückzahlen erzeugen keinen automatischen Rabatt.',attributes:[]
    })),
    footerCards:[
      {icon:'✂',title:'Aufgaben vor Farben',text:'Ärmel, Taschen, Futter und wechselbare Teile richten sich zuerst nach dem tatsächlichen Dienst.'},
      {icon:'☷',title:'Serie mit Einzelanprobe',text:'Das Hausbild bleibt zusammengehörig; jede Person bekommt passende Proportionen und Bewegungsraum.'},
      {icon:'◈',title:'Ersatz bleibt planbar',text:'Vereinbarte Stoffmuster und Schnittunterlagen können als Grundlage späterer Nachbestellungen dienen. Verfügbarkeit und neuer Preis werden vorher bestätigt.'}
    ]
  };
}
