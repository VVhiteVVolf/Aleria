import {GWNIWR_COLLECTION,GWNIWR_GARMENTS} from './gwniwr-collection.mjs';
export const GWNIWR_ART='./assets/gwniwr';
const p=text=>`<p>${text}</p>`;
const price=copper=>copper<100?{priceMin:String(copper),currencyCode:'KT',currencyLabel:'Kupfertaler'}:{priceMin:(copper/100).toLocaleString('de-DE',{maximumFractionDigits:2}),currencyCode:'ST',currencyLabel:'Silbertaler'};
export function buildGwniwrCatalog(){
  const maximum=Math.max(...GWNIWR_GARMENTS.map(item=>item.copper));
  return {
    headerIcon:`${GWNIWR_ART}/schild.png`,title:'Nadel & Faden · Hausmodelle',subtitle:'Walisisch-gälische Kleidung · Schlichter Alltag, gutes Tuch und wenige Hochzeitsmodelle',
    categories:[{id:'damen',label:'Damen · Alltag & gute Kleidung'},{id:'herren',label:'Herren · Alltag & gute Kleidung'},{id:'damen-hochzeit',label:'Kleine Hochzeitsauswahl · Damen'},{id:'herren-hochzeit',label:'Kleine Hochzeitsauswahl · Herren'}],
    allLabel:'Das ganze Sortiment',filterLabel:'Kleidung nach Anlass',searchPlaceholder:'Farbe, Stoff, Schnitt oder Anlass suchen …',
    noteIcon:'✦',noteTitle:'Gute Kleidung ist kein Vorrecht des Adels.',noteText:'Die Garnituren enthalten die ausdrücklich genannten Teile und eine gewöhnliche Anpassung. Farben hängen vom vorhandenen Tuch ab. Die kleine Hochzeitsauswahl entsteht nach Auftrag; kostbare Einzelentwürfe und Arbeitgeber-Serien gehören zu anderen Schwerpunkten der Stadt.',
    items:Object.entries(GWNIWR_COLLECTION).flatMap(([category,items])=>items.map(item=>({
      id:item.id,category,title:item.name,subtitle:`${item.cut} · Walisisch-Gälisch`,status:'available',badge:category.endsWith('hochzeit')?'Hochzeitsmodell':item.copper<35?'Schlichte Kleidung':item.copper<80?'Guter Alltag':'Gute Kleidung',
      image:`${GWNIWR_ART}/kleidung/${item.id}.png`,imageFit:'contain',imagePosition:'center',imageFormat:'square',imageHeight:300,
      descriptionTitle:'Schnitt & Erscheinung',description:p(item.appearance)+p('Die Garnitur wird mit sauber gefassten Nähten und zugänglichen Nahtzugaben gearbeitet. Spätere Änderungen und Ausbesserungen werden nach Zustand und Aufwand vereinbart.'),
      featuresTitle:'Enthaltene Ausführung',features:item.features.map(text=>({icon:'✦',title:'',text})),
      originTitle:'Stoff & Handwerk',origin:`${item.materials} · Genäht und angepasst in der Familienwerkstatt Nadel & Faden in Gwynthor.`,
      usageTitle:'Gedacht für',usageTags:[item.occasion],tags:['Kleidung','Cenyrisch','Walisisch-Gälisch',category.startsWith('damen')?'Damen':'Herren',item.materials,item.occasion],
      ...price(item.copper),priceMax:'',currencyIcon:'◈',unit:'1 Garnitur',priceTitle:'Preis der beschriebenen Garnitur',priceFill:15+85*item.copper/maximum,priceOptions:[],
      priceNote:'Die ausdrücklich beschriebenen Kleidungsstücke und gewöhnliche Anpassung sind enthalten. Schuhe, Schmuck und zusätzliche Ersatzteile gehören nur bei ausdrücklicher Nennung zur Garnitur.',
      conditionsTitle:'Anprobe & Auftrag',conditions:category.endsWith('hochzeit')?'Fertigung nach Bestellung. Tuch, Farbe, notwendige Anproben und Fertigstellungstermin werden vor der Zusage festgehalten. Stoffvorrat und Werkstattzeit werden vorab bestätigt.':'Hausmodell nach vorhandenem Stoff- und Größenvorrat. Bei Nachfertigung werden Tuch, Sitz, Preis und Termin vor Beginn vereinbart.',attributes:[]
    }))),
    footerCards:[{icon:'◈',title:'Ein Preis für die erklärte Arbeit',text:'Vor dem Zuschnitt wird festgelegt, welche Teile, Borten und Änderungen dazugehören. Aufwendigere Wünsche erhalten ein eigenes Angebot.'},{icon:'✦',title:'Schlicht bis gut',text:'Leinen und Wolltuch tragen das Sortiment. Wenige schmale Seidenbesätze schmücken die guten Modelle; schwere Edelmetallarbeiten werden nicht angeboten.'},{icon:'☷',title:'Auch nach dem ersten Tragen',text:'Säume, Verschlüsse und schadhafte Stellen können begutachtet werden. Eine Reparatur wird nach ihrem tatsächlichen Umfang besprochen.'}]
  };
}
