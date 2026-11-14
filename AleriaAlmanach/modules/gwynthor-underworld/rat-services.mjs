import { UNDERWORLD_ART } from './underworld-people.mjs';
export const RAT_SERVICES = Object.freeze([
  { id:'hafenwaesche', title:'Schnelle Hafenwäsche', description:'Eine Schüssel frisches Wasser, ein Stück einfache Seife und ein gemeinsam benutzter Waschplatz. Zum Abwaschen von Salz, Schweiß und Hafendreck.', scope:'Eine Person · ein Waschgang', terms:'0,5 Kupfertaler' },
  { id:'zuberbad', title:'Ein Platz im Zuber', description:'Ein einfaches warmes Bad in einem der offenen Zuber. Wasser und Seife gehören dazu; neue Gäste erhalten frisch bereitetes Badewasser.', scope:'Eine Person · bis zu einer halben Stunde', terms:'1,5 Kupfertaler' },
  { id:'buerste-seife', title:'Rücken schrubben', description:'Eine kräftige kurze Abreibung mit Bürste und einfacher Seife durch eine der Badedienerinnen. Zum Waschgang oder Zuberbad hinzubuchbar.', scope:'Eine Person · kurze Abreibung', terms:'0,5 Kupfertaler zusätzlich' },
  { id:'leinentuch', title:'Ein frisches Leinentuch', description:'Ein gewaschenes, gelegentlich geflicktes Leinentuch für den laufenden Besuch. Das Tuch bleibt Eigentum des Hauses.', scope:'Ein Tuch · leihweise', terms:'0,5 Kupfertaler' },
  { id:'privatstube', title:'Eine Stube für sich', description:'Treibholz, Seifenschaum oder Letzter Tropfen: eine einfache geschlossene Stube mit Bettstatt, eigenem Zuber oder Sitzbottich und frischem Leinen. Das Badewasser ist enthalten.', scope:'Eine Person · eine Stunde · nach Verfügbarkeit', terms:'3 Kupfertaler insgesamt' },
  { id:'gesellschaft', title:'Gesellschaft hinter dem Vorhang', description:'Wer nach dem Bad noch nicht allein sein möchte, fragt leise nach einer längeren Begleitung. Näheres wird persönlich mit der betreffenden Dame vereinbart.', scope:'Nach persönlicher Vereinbarung · Stube gesondert', terms:'Ab 4 Kupfertalern' }
]);
export function buildRatServicesPage() {
  return { schemaVersion:1, pageTitle:'Dienstleistungen und Preise', commentThreadKey:'reine-ratte-dienste', guildServicesPage:true,
    image:`${UNDERWORLD_ART}/scenes/waschsalon-v1.png`, imageWidth:30, imageTall:true,
    guildServices:{ title:'Wenig Münzen, warmes Wasser',
      introduction:'<p>Die Reine Ratte ist für einen kurzen Landgang gedacht: kein Marmor, kein Duftölregal und kein feierliches Badezeremoniell. Cadwren kassiert vorn, die Frauen teilen Waschplätze und Stuben ein. Alle Preise gelten in Kupfertalern.</p>',
      services:RAT_SERVICES.map(service => ({ title:service.title, icon:`${UNDERWORLD_ART}/services/${service.id}-v1.png`, description:`<p>${service.description}</p>`, clients:'', scope:service.scope, terms:service.terms })),
      process:'<p>Waschgang oder Stube vorn bezahlen, einen freien Platz zuweisen lassen und die Kleider an den Haken hängen. Frischwasser wird vom Hausdienst herangetragen; zusätzliches Leinen und Abreibungen bestellt man vor Ort. Stubenstunden werden unter den sechs Frauen abgestimmt.</p>',
      conditions:'<p>Geöffnet vom frühen Hafendienst bis spät am Abend, solange Feuer und Personal bereitstehen. Sechs Frauen teilen sich die drei Stuben; eine Belegung ist keine Zusage für eine bestimmte Begleitung. Wannen werden zwischen Gästen geleert und ausgescheuert. Wer Streit sucht oder Hände nicht bei sich behalten kann, lernt die Aufpasser kennen.</p>',
      footer:'Die Reine Ratte · Salz runter. Laune rauf.' } };
}
