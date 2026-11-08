import {FAMILY_REGISTRY} from '../../../Stammbäume/assets/js/data/families.registry.js';
export const GWNIWR_SHOP_ROLES=Object.freeze([
  {key:'emyr',personId:'person-7b6c292b',role:'Gemeinsame Geschäftsführung · Tuch & Werkstatt',bio:'Emyr führt Nadel & Faden gemeinsam mit Gwenllian. Er hält die Verbindung zwischen Tuchauswahl, Werkstatt und den Zusagen des Familienbetriebs. Die alten Schnittmuster und der Ruf für haltbare Kleidung bedeuten ihm viel.'},
  {key:'gwenllian',personId:'person-f926e0da',role:'Gemeinsame Geschäftsführung · Beratung & Aufträge',bio:'Gwenllian führt den Familienbetrieb gemeinsam mit Emyr. Im Gespräch über Stoff, Sitz und Anlass werden aus ersten Wünschen klare Aufträge. Ihr Sohn Tudur bringt als Schneidermeister seine eigene Erfahrung in die Werkstatt ein.'},
  {key:'tudur',personId:'person-ece54bdb',role:'Schneidermeister · Schnitt & letzte Anprobe',bio:'Tudur arbeitet als Schneidermeister in der Schneiderei seiner Eltern. Er betreut Schnitt und Passform und prüft bei der letzten Anprobe, ob die vereinbarte Garnitur ihren Menschen gut kleidet. Schlichte Stoffe verdienen dabei dieselbe saubere Arbeit wie gutes Festtuch.'},
  {key:'eleri',personId:'person-cf831497',role:'Mithilfe der Familie · Empfang & Verkauf',bio:'Eleri ist die Tochter Emyrs und Gwenllians und die Schwester Tudurs. Sie ist mit Hywel Craigddu verheiratet und hilft mit ihren Kindern im Laden ihres Elternhauses. So bleibt sie dem Handwerk und den Menschen von Nadel & Faden verbunden.'}
]);
export const GWNIWR_STAFF_SOURCE=Object.freeze([
  {key:'meirion-wym',name:'Meirion Wym',age:62,role:'Schneiderei · Tuchprüfung & Ausbesserungen',bio:'Meirion arbeitet bei Nadel & Faden. In der Werkstatt widmet er sich dem Tuch, sauberen Nähten und der Frage, ob sich ein getragenes Kleidungsstück sinnvoll erhalten lässt.'},
  {key:'iwan-trevor',name:'Iwan Trevor',age:28,role:'Schneiderei · Herrengarnituren',bio:'Iwan arbeitet bei Nadel & Faden an den schlichten und guten Herrengarnituren. Schulterweite, Ärmel und die Belastungsnähte der Alltagskleidung verlangen dabei ebenso viel Aufmerksamkeit wie die äußere Linie.'},
  {key:'briallen-wym',name:'Briallen Wym',age:24,role:'Schneiderei · Damenkleidung & Änderungen',bio:'Briallen arbeitet im Familienbetrieb Nadel & Faden. Ihr Arbeitsplatz liegt bei Damenkleidern und Änderungen; sie hilft, den gewählten Hausmodellschnitt an den Menschen anzupassen.'},
  {key:'nesta-ferchwyn',name:'Nesta Ferchwyn',age:34,role:'Verkauf · Stoffwahl & Anproben',bio:'Nesta arbeitet im Laden Nadel & Faden. Sie begleitet die Auswahl der Tuche und hält bei einer Anprobe fest, welche Änderungen vor der Abholung noch nötig sind.'},
  {key:'osian',name:'Osian',age:16,role:'Schneiderlehrling · Heften & Säumen',bio:'Osian ist der sechzehnjährige Lehrling von Nadel & Faden. Er lernt an Heftnähten, Säumen und der sorgfältigen Vorbereitung des Werkzeugs; die endgültige Prüfung bleibt bei den erfahrenen Händen.'}
]);
export function gwniwrShopPeople(){
  const family=FAMILY_REGISTRY.find(record=>record.id==='gwniwr')?.family;
  if(!family)throw new Error('Gwniwr-Familie fehlt in der kanonischen Registry.');
  const relatives=GWNIWR_SHOP_ROLES.map(assignment=>{
    const person=family.persons.find(person=>person.id===assignment.personId);
    if(!person?.portrait||!person.worldPersonId)throw new Error(`Gwniwr-Shopidentität fehlt: ${assignment.key}`);
    return {...assignment,name:person.name,age:1740-Number(person.birth),worldPersonId:person.worldPersonId,portrait:person.portrait.startsWith('http')?person.portrait:`../Stammbäume/${person.portrait}`};
  });
  return [...relatives,...GWNIWR_STAFF_SOURCE.map(person=>({...person,worldPersonId:`person--gwniwr-staff--${person.key}`,portrait:`./assets/gwniwr/portraits/${person.key}.jpg`}))];
}
