import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { GOFRANN_ART } from './gofrann-people.mjs';
import { GOFRANN_OWN_CATEGORIES, buildGofrannOwnCatalogItems } from './gofrann-products.mjs';
export const GOFRANN_STANDARD_ITEMS = Object.freeze(STANDARD_ITEMS.filter(item => item.id.startsWith('standard:waffen-rustungen:')));
const paragraphs = text => String(text || '').split(/\n\s*\n/).filter(Boolean).map(text => `<p>${text}</p>`).join('');
export function buildGofrannCatalog() {
  return { headerIcon:`${GOFRANN_ART}/schild.png`,title:'Güterregister',subtitle:'Waffen und Rüstungen · Zum Dritten Funken',
    categories:[{id:'waffen',label:'Standard Waffen'},{id:'ruestungen',label:'Standard Rüstungen'},...GOFRANN_OWN_CATEGORIES],
    allLabel:'Alle Stücke',filterLabel:'Das Sortiment',searchPlaceholder:'Waffe, Rüstung oder Werkstoff suchen …',
    noteIcon:'✦',noteTitle:'Ein gutes Stück beginnt mit der richtigen Wahl',
    noteText:'Größe, Ausführung und Vorrat werden vor der Bestellung geklärt. Für eine besondere Klinge oder einen maßgefertigten Harnisch nehmen sich die Meister persönlich Zeit.',
    items: [...GOFRANN_STANDARD_ITEMS.map(item => ({
      id:item.id,category:item.category,title:item.title,subtitle:item.type,status:'available',badge:'Standardsortiment',
      image:item.image,imageFit:'contain',imagePosition:'center',imageFormat:'square',imageHeight:320,
      descriptionTitle:'Ausführung und Gebrauch',description:paragraphs(item.details || item.description),
      featuresTitle:'Zum Stück',features:[],originTitle:'Werkstatt und Bezug',
      origin:/bogen|armbrust|fell|stoff|leder|gambeson/i.test(item.title)
        ? 'Aus dem gewöhnlichen Handwerkssortiment und von zugekauften Partnerarbeiten; Gofrann prüft die Ware und übernimmt passende Metallarbeiten.'
        : 'Zum Dritten Funken · Gwynthor. Gewöhnliche Waffen und Metallrüstungen aus der Werkstatt oder geprüftem Bestand.',
      usageTitle:'Einordnung',usageTags:[item.category === 'waffen' ? 'Waffe' : 'Rüstung und Schutz',...(item.tags || [])],tags:[item.type,item.hiddenMeta?.material].filter(Boolean),
      priceMin:String(item.priceRange.minCopper),priceMax:item.priceRange.maxCopper !== item.priceRange.minCopper ? String(item.priceRange.maxCopper) : '',
      currencyCode:'KT',currencyLabel:'Kupfertaler',currencyIcon:'◈',unit:item.hiddenMeta?.unit || '1 Stück',priceTitle:'Preis nach Handelsregister',
      priceFill:40,priceOptions:[],priceNote:'Die Preisspanne berücksichtigt die im Handelsregister geführten Ausführungen. Besondere Anpassungen und Sonderarbeiten werden vor Beginn gesondert vereinbart.',
      conditionsTitle:'Vorrat und Fertigung',conditions:'Nach vorhandenem Bestand oder Bestellung. Maß, Material, vereinbarter Preis und Abholtermin werden bei Auftragserteilung festgehalten.',
      attributes:structuredClone(item.attributes || [])
    })),...buildGofrannOwnCatalogItems()],
    footerCards:[{icon:'✦',title:'Hausarbeiten',text:'Besondere Klingen und Harnische entstehen nach persönlicher Absprache mit den Meistern.'},
      {icon:'◈',title:'Anprobe gehört zum Handwerk',text:'Renfri vergibt Maßtermine. Gethin prüft den Sitz eines Harnischs, Bleddyn die Führung und Ausführung besonderer Waffen.'},
      {icon:'☷',title:'Material aus verlässlicher Hand',text:'Die Tlawd liefern den größten Teil des Erzes und sind bedeutende Teilhaber der Gofrann-Schmiede.'}]
  };
}
