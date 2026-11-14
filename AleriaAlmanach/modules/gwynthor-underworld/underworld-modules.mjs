import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { RAT_PEOPLE, RAT_OWNER, RAT_SIGN, UNDERWORLD_ART } from './underworld-people.mjs';
import { BATH_ROOMS, RATWAY_ROOMS } from './underworld-rooms.mjs';
import { buildRatHierarchy } from './rat-hierarchy.mjs';
import { buildRatServicesPage } from './rat-services.mjs';
export const RAT_BATHHOUSE_ID = 'gwynthor-zuberhaus-reine-ratte';
export const RATWAY_ID = 'gwynthor-rattenweg';
export const UNDERWORLD_PATH = Object.freeze([...GWYNTHOR_CITY_PATH,'Gwynthor-Unterwelt']);
const image = id => ({ image:`${UNDERWORLD_ART}/scenes/${id}-v${id === 'schlickmarkt' ? 2 : 1}.png`,imageWidth:36,imageTall:true,imageFit:'cover',imagePosition:'center' });
function scenePage(room,prefix,location) {
  return { schemaVersion:1,pageTitle:room.title,commentThreadKey:`${prefix}-${room.id}`,sessionPage:true,...image(room.id),
    sessionIntro:`<p>${room.intro}</p>`,sessionLocation:`${location} · ${room.title}`,
    sessionHint:prefix === 'rattenweg' ? 'Nur wer die privat vereinbarte Chiffre kennt, erhält Zugang. Ihr Wortlaut bleibt geheim.' : 'Ein Landgang, eine leise Absprache oder ein kurzer Besuch am warmen Wasser.',
    sessionEmptyTitle:room.title,sessionEmptyText:'Hier beginnt die nächste Begegnung.',sessionDateAleria:{year:null,month:null,day:null} };
}
function bathhouseBiography() {
  return { schemaVersion:1,pageTitle:'Hausbio · Wasser für den Landgang',commentThreadKey:'reine-ratte-hausbio',biographyPage:true,...image('waschsalon'),
    biography:{biographyTitle:'Ein Zuberhaus, wie der Hafen es braucht',
      biographyText:'<p>Zwischen Lagerwänden und nassem Tauwerk steht die <strong>Reine Ratte</strong>: ein niedriger Holzbau, dessen Läden fast immer offen stehen. Das Wasser wird in Eimern getragen, auf einem offenen Kessel erwärmt und von Hand in einfache Daubenzuber verteilt. Wenn es zieht, zieht es eben. Wer vom Schiff kommt, soll mit wenigen Münzen Salz und Schweiß loswerden.</p><p>Der Waschsalon ist halb zum Hof geöffnet; niedrige Bretterwände und Leinen schützen wenigstens vor den neugierigsten Blicken. Drei private Stuben tragen die Namen Treibholz, Seifenschaum und Letzter Tropfen. Hier gibt es eine Bettstatt, eigenes Badewasser und auf persönliche Absprache Gesellschaft. Die Stammkundschaft besteht vor allem aus Matrosen, Seeleuten und Hafenarbeitern.</p>',
      historyTitle:'Der Mann unter dem Schild',historyText:`<p>${RAT_OWNER.bio}</p><p>Cadwren macht aus dem schlechten Ruf seines Hauses kein Geheimnis. Er kennt die Zeiten des Landgangs, die Launen trunkener Gäste und den Wert einer nicht weitergetragenen Bemerkung. Der Ursprung seiner Brandnarben bleibt offen; aus den Geschichten am Zuber wird keine festgeschriebene Vergangenheit.</p>`,
      worksTitle:'Was man im Haus bekommt',works:['Günstige Waschplätze und einfache warme Zuber','Drei private Stuben mit Badewasser und Leinen','Persönlich vereinbarte Begleitung','Hausdienst, Botengänge und drei grobe Aufpasser'],
      connectionsTitle:'Der Gastgeber',connections:[{name:RAT_OWNER.name,detail:`${RAT_OWNER.age} Jahre · Cenyri · Inhaber und Kassenführer`,image:RAT_OWNER.portrait,imageFormat:'portrait'}],
      triviaTitle:'Was man sich am Hafen erzählt',trivia:['Das Schild hängt nur noch an einem Scharnier; Cadwren nennt das bewegliche Werbung.','Im Keller sind mehr Schritte zu hören, als ein paar Holzscheite erklären würden.','Nach fremden Wegen fragt man nicht laut am Waschplatz. Eine private Chiffre entscheidet, ob eine solche Frage überhaupt beantwortet wird.'],
      quotesTitle:'Cadwren am Eingang',quotes:['„Salz runter. Laune rauf. Bezahlt wird vorher.“'],crestImage:RAT_SIGN,
      footer:'Offiziell ein schlichtes Hafenbad · hinter der bewachten Kellertür bleiben Absprachen privat' } };
}
export function buildRatBathhouse() {
  return {id:RAT_BATHHOUSE_ID,title:'Die Reine Ratte',subtitle:'Billiges Zuberhaus am Hafen · Salz runter. Laune rauf.',type:'Zuberhaus',category:'Gwynthor-Unterwelt',
    schemaVersion:1,multipage:true,appendCommentsPage:false,enablePageComments:true,icon:'♨',symbol:RAT_SIGN,stamp:'DIE REINE RATTE · HAFENBAD',
    image:image('aussenansicht').image,previewImage:image('aussenansicht').image,sessionCast:RAT_PEOPLE.map(person=>person.worldPersonId),
    pages:[{schemaVersion:1,pageTitle:'Die Reine Ratte',commentThreadKey:'reine-ratte-einleitung',...image('aussenansicht'),
      stats:[['Ort','Hafen · Gwynthor-Stadt'],['Inhaber',RAT_OWNER.name],['Hausdienst','13 Erwachsene'],['Waschen','Ab 0,5 Kupfertalern'],['Räume','Offener Waschsalon · drei private Stuben · Vorratskeller']],
      description:'<p>Eine grinsende Ratte fläzt sich auf dem schiefen Holzschild in ihrem Zuber. Darunter verspricht ein halb offener Verschlag warmes Wasser für wenig Geld. <strong>Die Reine Ratte</strong> ist der Ort für Matrosen, die zwischen Anlegen und Ablegen schnell den Hafen von der Haut bekommen wollen.</p><p>Cadwren Brithog steht meist mit verschränkten Armen im Eingang. Sechs Zuberdirnen, zwei Mägde, ein Laufbursche und drei Aufpasser halten sein schlichtes Haus am Laufen. Hinter drei Türen lässt sich die Stunde etwas ungestörter verbringen. Der Keller ist dagegen kein Gästebereich.</p>'},
      bathhouseBiography(),{schemaVersion:1,pageTitle:'Hierarchie · Leute der Reinen Ratte',commentThreadKey:'reine-ratte-hierarchie',hierarchyPage:true,hierarchy:buildRatHierarchy()},
      buildRatServicesPage(),...BATH_ROOMS.map(room=>scenePage(room,'reine-ratte','Die Reine Ratte'))]};
}
export function buildRatway() {
  return {id:RATWAY_ID,title:'Rattenweg',subtitle:'Abgeschottete Kanalgewölbe unter Gwynthor',type:'Unterwelt',category:'Gwynthor-Unterwelt',
    schemaVersion:1,multipage:true,appendCommentsPage:false,enablePageComments:true,icon:'⌁',symbol:image('kanaleingang').image,
    stamp:'RATTENWEG · UNTER GWYNTHOR',image:image('schlickmarkt').image,previewImage:image('schlickmarkt').image,
    sessionCast:[RAT_PEOPLE[12].worldPersonId],pages:RATWAY_ROOMS.map(room=>scenePage(room,'rattenweg','Rattenweg'))};
}
export function buildUnderworldRegistrations() {
  return [buildRatBathhouse(),buildRatway()].map(entry=>({tab:'Völker & Kulturen',path:[...UNDERWORLD_PATH],description:'Hinter den Türen des Hafens und unter den Straßen Gwynthors.',icon:RAT_SIGN,entry}));
}
