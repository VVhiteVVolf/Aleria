import { GOFRANN_WEAPONS } from './gofrann-weapons.mjs';
import { GOFRANN_ARMORS } from './gofrann-armors.mjs';
import { GOFRANN_SHIELDS } from './gofrann-shields.mjs';
import { GOFRANN_SPECIAL_PRODUCTS } from './gofrann-special-products.mjs';
import { GOFRANN_ART } from './gofrann-people.mjs';

export const GOFRANN_OWN_CATEGORIES=Object.freeze([
  {id:'eigene-waffen',label:'Eigene Waffen'},{id:'eigene-ruestungen',label:'Eigene Rüstungen'},
  {id:'eigene-schilde',label:'Eigene Schilde'},{id:'besondere-waffen',label:'Besondere Waffen'},
  {id:'besondere-ruestungen',label:'Besondere Rüstungen'}
]);
export const GOFRANN_PRODUCTS=Object.freeze([...GOFRANN_WEAPONS,...GOFRANN_ARMORS,...GOFRANN_SHIELDS,...GOFRANN_SPECIAL_PRODUCTS]);
const index=new Map(GOFRANN_PRODUCTS.map(p=>[p.key,p]));
if(index.size!==GOFRANN_PRODUCTS.length) throw new Error('Doppelter Gofrann-Artikel.');
export function getGofrannProduct(key) {const product=index.get(key);if(!product)throw new Error(`Unbekanntes Gofrann-Stück: ${key}`);return product;}

export function buildGofrannOwnCatalogItems() {
  return GOFRANN_PRODUCTS.map(p=>({
    id:`gofrann:${p.key}`,title:p.title,subtitle:p.type,category:p.category,status:'available',
    badge:p.special?'Besondere Auftragsarbeit':'Gofrann · Hausarbeit',image:`${GOFRANN_ART}/items/${p.key}.png`,
    imageFit:'contain',imagePosition:'center',imageFormat:'square',imageHeight:350,
    descriptionTitle:p.special?'Werkstoff und Meisterarbeit':'Ausführung und Handwerk',description:p.description.map(t=>`<p>${t}</p>`).join(''),
    featuresTitle:'Zum Stück',features:p.features.map(text=>({icon:'✦',text})),tags:[p.type,p.special?'Meisterarbeit':'Hausarbeit'],
    originTitle:'Werkstatt und Werkstoff',origin:`${p.craft || 'Zum Dritten Funken · Gwynthor'}. ${p.material}.`,
    usageTitle:'Ausführung',usageTags:[p.type,...(p.length?[`Ca. ${p.length}`]:[])],
    priceMin:String(p.price),priceMax:'',currencyCode:'KT',currencyLabel:'Kupfertaler',currencyIcon:'◈',
    priceTitle:'Preis der beschriebenen Ausführung',unit:p.kind==='tabard'?'1 Wappenrock':p.kind==='armor'?'1 Torsoharnisch':p.kind==='shield'?'1 Schild':'1 Waffe',
    priceNote:p.kind==='tabard'?'Der Preis umfasst den Wappenrock ohne Rüstung.':p.kind==='armor'?'Der Preis gilt für den gezeigten Torsoharnisch mit den beschriebenen Teilen. Helm, Arm- und Beinschutz gehören nicht dazu.':'Der Preis umfasst das beschriebene Stück; zusätzliche Ausrüstung wird gesondert gewählt.',
    priceFill:p.special?85:55,priceOptions:[],attributes:[],conditionsTitle:'Bestellung und Übergabe',
    conditions:p.special?'Auftragsarbeit nach Materialverfügbarkeit. Die gezeigte Ausführung dient als Muster; Maße, Material, Preis und Termin werden vor Beginn verbindlich festgehalten.':'Nach vorhandenem Bestand oder Bestellung. Griff, Riemen oder Passform werden bei der Annahme besprochen; größere Änderungen erhalten ein eigenes Angebot.'
  }));
}
