import { RAST_ART } from './rast-people.mjs';
import { RAST_DISHES } from './rast-menu.mjs';
import { fixedTradePrice, convertStandardGoods } from '../trade-catalog/standard-goods-conversion.mjs';

const paragraphs = (...texts) => texts.map(text=>`<p>${text}</p>`).join('');
const defaults = { status:'available',imageFit:'contain',imagePosition:'center',imageHeight:320,imageFormat:'square',
  descriptionTitle:'Zubereitung & Geschmack',featuresTitle:'Auf dem Teller',features:[],originTitle:'Herkunft',usageTitle:'Am Tisch',
  priceTitle:'Preis & Portion',priceFill:35,priceOptions:[],conditionsTitle:'Verfügbarkeit',attributes:[] };
const wineSources = [
  {id:'weinlaub-1734',name:'Weinlaub · Jahrgang 1734',kind:'Weisenfluher Rotwein',glass:10,bottle:50,unit:'0,15 l',detail:'Trockener Rotwein mit reifer roter Frucht, zurückhaltendem Holz und weichen Gerbstoffen. Der Jahrgang 1734 begleitet Pasteten, Lamm und gereiften Käse.'},
  {id:'weinlaub-1728',name:'Weinlaub · Jahrgang 1728',kind:'Gereifter Weisenfluher Rotwein',glass:18,bottle:90,unit:'0,15 l',detail:'Ein gereifter Jahrgang mit dunkler Frucht, feiner erdiger Würze und ruhigem Gerbstoff. Owain führt die älteren Flaschen einzeln im Kellerbuch und empfiehlt sie zu Hirsch und Wildpastete.'},
  {id:'weissmann-weisswein',name:'Weissmann · Weißwein',kind:'Weisenfluher Weißwein',glass:8,bottle:40,unit:'0,15 l',detail:'Heller trockener Weißwein mit frischer Säure, gelber Frucht und zurückhaltender Kräuternote. Kühl serviert zu Fisch, Ziegenkäse und Lauchbrühe.'},
  {id:'weissmann-champagnia',name:'Weissmann · Champagnia',kind:'Weisenfluher Schaumwein',glass:24,bottle:120,unit:'0,10 l',detail:'Feine Perlen, helle Frucht und ein sanfter Gebäckduft eröffnen einen besonderen Abend. Die Flasche wird erst zum vereinbarten Empfang geöffnet; glasweiser Ausschank nach geöffneter Flasche.'}
];
const guildSelections = [
  ['teyrngarch-brauerzunft','bier-hellwacht','Krug'],['teyrngarch-brauerzunft','bier-hopfgold','Krug'],
  ['teyrngarch-brauerzunft','bier-sonnenglanz','Krug'],['penderyn-brauer-destillierzunft','bier-goldschuppen','Krug'],
  ['penderyn-brauer-destillierzunft','whisky-rhagorol','Glas'],['penderyn-brauer-destillierzunft','whisky-penderyn','Glas']
];
function guildImports(catalogs) {
  return guildSelections.map(([moduleId,itemId,serving])=>{
    const source=catalogs.find(c=>c.id===moduleId);
    const item=source?.pages.flatMap(p=>p.tradeCatalog?.items||[]).find(i=>i.id===itemId);
    const option=item?.priceOptions?.find(o=>o.label===serving);
    if(!item?.image||!option?.price) throw new Error(`Import fehlt: ${moduleId}/${itemId}/${serving}`);
    return {...structuredClone(item),id:`import-${moduleId}-${itemId}`,category:'importe',priceMin:'',priceMax:'',priceOptions:[structuredClone(option)],
      subtitle:'Cenyrischer Zunftimport',priceTitle:'Ausschank in der Letzten Rast',priceNote:`Ausschankgröße und Preis aus ${source.title}.`,
      conditions:'Nach Fass- und Flaschenvorrat; die geöffnete Abfüllung wird beim Bestellen genannt.'};
  });
}
export function buildRastCatalog(sourcePage,catalogs) {
  const standard=convertStandardGoods(sourcePage,{defaults,origin:'Celtigerns Letzte Rast · einfache Hausversorgung',
    foodBadge:'Hausversorgung auf Wunsch',drinkBadge:'Einfacher Ausschank',
    descriptionForRow:row=>paragraphs(row.details||row.values.description,
      row.category==='speisen'?'Diese einfache Portion gehört zur Versorgung der Herberge. Die gehobene Hauskarte wird gesondert frisch zubereitet.':'Dieser einfache Trunk ergänzt die namentlich geführte Wein- und Importkarte.'),
    conditionsForRow:()=> 'Nach Tagesvorrat.'});
  const dishes=RAST_DISHES.map(d=>({...defaults,...fixedTradePrice(`${d.copper} Kupfertaler`),id:`haus-${d.id}`,title:d.name,
    category:d.course==='Vorspeisen'?'vorspeisen':d.course==='Nachspeisen'?'nachspeisen':d.course==='Tafeln & Vorbestellung'?'tafeln':'hauptgerichte',
    subtitle:d.course,unit:d.unit,image:`${RAST_ART}/food/${d.id}.png`,badge:'Hausküche · Letzte Rast',
    description:paragraphs(d.description),features:[d.unit,'Frisch in der Hausküche zubereitet'],
    origin:'Cenyrische Hausküche · ausgewählte Weine, Honig und Trockenfrüchte aus Weisenfluh',usageTags:[d.course],
    priceNote:'Der angegebene Preis umfasst die beschriebenen Beilagen. Getränke werden einzeln bestellt.',
    conditions:d.course==='Tafeln & Vorbestellung'?'Bitte vorbestellen; genaue Servierzeit mit Angharad abstimmen.':'Frisch nach Bestellung, nach Saison und Tageslieferung.'}));
  const wines=wineSources.map(w=>({...defaults,...fixedTradePrice(`${w.glass} Kupfertaler`),id:w.id,category:'weine',title:w.name,subtitle:w.kind,
    unit:`Glas · ${w.unit}`,image:`./assets/lachende-nixe/drinks/${w.id}.png`,badge:'Weisenfluh',descriptionTitle:'Im Glas',
    description:paragraphs(w.detail),featuresTitle:'Ausschank',features:[w.kind,`Glas ${w.unit} · Flasche 0,75 l`],origin:'Weisenfluh · Weinlaub beziehungsweise Weissmann',
    usageTags:['Weinkarte'],priceOptions:[{label:'Glas',unit:w.unit,price:String(w.glass)},{label:'Flasche',unit:'0,75 l',price:String(w.bottle)}],
    priceNote:'Preis im Haus einschließlich Einschenken und passendem Glas.',conditions:'Nach Flaschenvorrat; gereifte Jahrgänge und Champagnia auf Anfrage.'}));
  return {headerIcon:`${RAST_ART}/references/schild.png`,title:'Güterregister',subtitle:'Feine Tafel · Hauskarte, Weinkeller und Importe',
    categories:[{id:'vorspeisen',label:'Vorspeisen'},{id:'hauptgerichte',label:'Hauptgerichte'},{id:'tafeln',label:'Tafeln & Vorbestellung'},
      {id:'nachspeisen',label:'Nachspeisen'},{id:'weine',label:'Weisenfluher Weine'},{id:'importe',label:'Cenyrische Importe'},
      {id:'speisen',label:'Einfache Hausversorgung'},{id:'getranke',label:'Einfacher Ausschank'}],
    allLabel:'Alle Angebote',searchPlaceholder:'Gericht, Wein oder Zunft suchen …',filterLabel:'Die Karte des Hauses',
    noteIcon:'♧',noteTitle:'Die gute Tafel der Vanns',noteText:'Sorgfältige Zubereitung, gute Lieferungen und aufmerksamer Tischdienst bestimmen die Hauskarte. Frischer Fisch, Fleisch und Gemüse kommen aus Cenyr. Weine, Honig und ausgewählte Trockenfrüchte erreichen den Keller aus Weisenfluh.',
    items:[...dishes,...wines,...guildImports(catalogs),...standard],
    footerCards:[{icon:'◈',title:'Der besondere Abend',text:'Die Tafel des Hauses wird als dreigängiges Menü gereicht. Gemeinsame Platten und ganzer Lachs benötigen Vorbestellung.'},
      {icon:'♧',title:'Die guten Lieferungen',text:'Cenyrischer Frischbezug trifft auf haltbare Spezialitäten aus Weisenfluh. Herkunft und Jahrgang nennt Owain beim Bestellen.'},
      {icon:'☷',title:'Ruhig genießen',text:'Angharad und ihr Tischdienst stimmen die Gänge mit der Küche ab. Zimmer, Salons und weitere Dienste stehen auf der eigenen Dienstleistungsseite.'}]};
}
