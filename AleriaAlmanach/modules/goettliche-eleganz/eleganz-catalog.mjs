import { ELEGANZ_COLLECTION } from './eleganz-collection.mjs';
import { ELEGANZ_ART } from './eleganz-family-people.mjs';
const paragraph = text => `<p>${text}</p>`;
function price(copper) {
  const unit = copper >= 1000 ? {code:'GT',label:'Goldtaler',factor:1000} : copper >= 100 ? {code:'ST',label:'Silbertaler',factor:100} : {code:'KT',label:'Kupfertaler',factor:1};
  return {priceMin:(copper/unit.factor).toLocaleString('de-DE',{maximumFractionDigits:2}),priceMax:'',currencyCode:unit.code,currencyLabel:unit.label,currencyIcon:'◈'};
}
export function buildEleganzCatalog() {
  return {headerIcon:`${ELEGANZ_ART}/schild.png`,title:'Güterregister',subtitle:'Argentisch-Cenyrische Kleidung · Göttliche Eleganz',
    categories:[{id:'damen',label:'Damenkleidung'},{id:'herren',label:'Herrenkleidung'}],allLabel:'Die ganze Kollektion',filterLabel:'Garnituren des Hauses',searchPlaceholder:'Schnitt, Stoff oder Anlass suchen …',
    noteIcon:'✦',noteTitle:'Guter Stoff. Der richtige Schnitt.',noteText:'Vom guten Alltagsgewand bis zum seltenen Einzelentwurf verbindet das Haus argentische Mode mit cenyrischem Handwerk. Die Hausmodelle werden anprobiert und angepasst; die besonderen Garnituren entstehen nach Maß.',
    items:Object.entries(ELEGANZ_COLLECTION).flatMap(([category,items])=>items.map((item,index)=>({
      id:item.id,category,title:item.name,subtitle:`${item.cut} · Argentisch-Cenyrisch`,status:'available',badge:index<2?'Guter Alltag':index>7?'Einzelanfertigung':'Hauskollektion',
      image:'',imageFit:'contain',imagePosition:'center',imageFormat:'portrait',imageHeight:360,
      descriptionTitle:'Schnitt & Erscheinung',description:paragraph(item.description)+paragraph(item.details),
      featuresTitle:'Zur Garnitur',features:item.features.map(text=>({icon:'✦',title:'',text})),
      originTitle:'Stoff & Herkunft',origin:`${item.materials} · Hauswerkstätten in Gwynthor; Importstoffe über die Veltrane-Route.`,
      usageTitle:'Passender Anlass',usageTags:[item.occasion],tags:['Kleidung','Argentisch-Cenyrisch',category==='damen'?'Damen':'Herren',item.materials],
      ...price(item.copper),unit:'1 Garnitur',priceTitle:'Preis der beschriebenen Garnitur',priceFill:15+index*9,priceOptions:[],
      priceNote:'Die genannten Teile, Besätze und die übliche Anpassung gehören zum Preis. Schuhe und nicht genannter Schmuck werden gesondert bestellt.',
      conditionsTitle:'Anprobe & Fertigung',conditions:index<5?'Nach Stoff- und Größenvorrat; einfache Anpassungen nach Absprache.':'Fertigung nach Bestellung. Stoff, Anproben und Fertigstellung werden vor Auftragserteilung vereinbart.',attributes:[]
    }))),
    footerCards:[{icon:'✦',title:'Eine Anprobe lohnt sich',text:'Maelwen führt den Auftragskalender; besondere Entwürfe und letzte Anproben übernimmt Eleonora selbst.'},
      {icon:'◈',title:'Handwerk ohne fremde Zwischenhändler',text:'Die Veltrane liefern die südlichen Stoffe, Gwynthors Werkstätten die feinen Beschläge. So bleibt mehr Sorgfalt für Schnitt und Ausführung.'},
      {icon:'☷',title:'Gwynthor · Innenstadt',text:'Verkauf, Beratung und Anprobe im Laden; zugeschnitten und genäht wird auch in den eigenen Werkstätten der Stadt.'}]
  };
}
