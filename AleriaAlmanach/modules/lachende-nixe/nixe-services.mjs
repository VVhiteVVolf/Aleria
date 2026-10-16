import { NIXE_ART } from './nixe-family-people.mjs';

const service = (id, title, icon, copper, unit, description, scope) => ({ id, title, icon, copper, unit, description, scope });
export const NIXE_SERVICES = [
  service('salongesellschaft', 'Gesellschaft im Salon', 'gesellschaft', 20, 'je Stunde · eine Dame',
    'Eine Dame des Hauses widmet dem Gast ihre Zeit am Tisch: Gespräch, gemeinsames Spiel und aufmerksame Begleitung durch den Abend. Eirona, Rhosiel, Lliwen oder Severina können beim Empfang angefragt werden.', 'Eine vereinbarte Stunde im öffentlichen Salon'),
  service('private-gesellschaft', 'Eine Stunde zu zweit', 'privat', 60, 'je Stunde · eine Dame',
    'Ungestörte, intime Gesellschaft mit der gewünschten Dame. Johanna stimmt den Termin ab; die persönlichen Wünsche werden mit der Dame selbst besprochen. Ein vorhandenes Gästezimmer kann genutzt oder ein Raum gesondert gebucht werden.', 'Eine vereinbarte Stunde in privatem Rahmen'),
  service('abendgesellschaft', 'Ein Abend in besonderer Gesellschaft', 'privat', 190, 'bis vier Stunden · eine Dame',
    'Die gewählte Dame hält sich den vereinbarten Abend für ihren Gast frei. Ob er im Salon beginnt oder sich früh ins Private zurückzieht, wird beim Empfang abgestimmt. Der Abendtarif umfasst ihre Zeit, Getränke und Zimmer kommen auf die eigene Rechnung.', 'Zusammenhängender Abend · bis vier Stunden'),
  service('einzeltanz', 'Ein privater Tanz', 'tanz', 15, 'eine Tänzerin · etwa eine Viertelstunde',
    'Eine Tänzerin tritt für den eigenen Tisch oder eine kleine geschlossene Runde auf. Sie stimmt ihre Darbietung auf den Anlass und die Stimmung im Raum ab.', 'Eine kurze Darbietung nach Termin'),
  service('tanzfolge', 'Kleine Tanzfolge', 'tanz', 40, 'zwei Tänzerinnen · etwa eine halbe Stunde',
    'Zwei Tänzerinnen gestalten eine abgestimmte Folge für eine geschlossene Gesellschaft. Der Empfang reserviert die freie Fläche und legt den Beginn mit den Darstellerinnen fest.', 'Zwei Tänzerinnen · Musikbegleitung gesondert'),
  service('wunschlied', 'Eine persönliche Weise', 'musik', 5, 'je Lied oder Instrumentalstück',
    'Adeltrud oder Thjodhild widmet ein bekanntes Stück einem Gast oder seiner Runde. Wer einen besonderen Wunsch hat, nennt ihn vorab; die Musikerin sagt, welche Fassung sie beherrscht.', 'Ein vereinbartes Stück im Salon'),
  service('privatmusik', 'Musik im Hinterzimmer', 'musik', 30, 'eine Musikerin · je Stunde',
    'Eine Musikerin begleitet eine kleine Runde mit Liedern und ruhigen Instrumentalweisen. Die Stücke lassen dem Gespräch Platz; lebhaftere Folgen können vor Beginn abgesprochen werden.', 'Eine Musikerin · eine volle Stunde'),
  service('musikabend', 'Ein musikalischer Abend', 'musik', 150, 'zwei Musikerinnen · bis drei Stunden',
    'Adeltrud und Thjodhild wechseln Weisen, Gesang und kleine gemeinsame Stücke für eine geschlossene Abendgesellschaft ab. Kurze Pausen gehören zum vereinbarten Ablauf.', 'Drei Stunden mit beiden Musikerinnen · nach gemeinsamer Verfügbarkeit'),
  service('einzelzimmer', 'Eine ruhige Kammer', 'zimmer', 12, 'je Zimmer und Nacht · eine Person',
    'Eine gepflegte Einzelkammer mit frischem Bettzeug, Waschkrug, Handtuch und verschließbarer Tür. Der Empfang nimmt die Ankunft auf und hält den Schlüssel bereit.', 'Eine Nacht · Ankunft und Abreise nach Hausabsprache'),
  service('perlenstube', 'Die Perlenstube', 'zimmer', 25, 'je Zimmer und Nacht · bis zwei Personen',
    'Das breite Bett unter perlfarbenen Vorhängen, feines Leinen und ein eigener Waschplatz machen die Perlenstube zur besonders angenehmen Übernachtung. Der Preis gilt für das Zimmer mit bis zu zwei Gästen.', 'Eine Nacht · bis zwei Personen'),
  service('dauerzimmer', 'Ein festes Zimmer im Haus', 'dauer', 360, '36 Nächte · eine Person',
    'Eine gewöhnliche Einzelkammer bleibt für einen ganzen Hausmonat reserviert. Tägliches einfaches Frühstück, frisches Waschwasser, Reinigung und regelmäßiger Wäschewechsel gehören dazu. Wer länger in Gwynthor bleibt, hat hier seinen festen Schlüssel.', 'Ein Aleria-Monat mit 36 Nächten · monatlich im Voraus'),
  service('dauer-perlenstube', 'Die Perlenstube auf Dauer', 'dauer', 720, '36 Nächte · bis zwei Personen',
    'Die Perlenstube wird für einen ganzen Hausmonat fest gehalten. Einfaches Frühstück für beide Gäste, täglicher Zimmerdienst und frisches Leinen sind eingeschlossen. Der Aufenthalt wird im Hausbuch vermerkt und kann nach Verfügbarkeit verlängert werden.', 'Ein Aleria-Monat mit 36 Nächten · bis zwei Personen'),
  service('bad', 'Ein warmer Zuber', 'bad', 4, 'je Bad · eine Person',
    'Warmes Wasser, ein sauberes Leinentuch und eine kleine Portion milder Seife stehen zum vereinbarten Zeitpunkt bereit. Das Zubermädchen richtet den Platz her und erneuert anschließend das Wasser.', 'Ein vorbereiteter Zuber · nach Termin'),
  service('privatsalon', 'Ein Salon für die eigene Runde', 'salon', 10, 'je Stunde · ein Hinterzimmer',
    'Ein abgeschirmtes Hinterzimmer mit vorbereiteten Sitzplätzen, Kerzenlicht und Bedienung für bestellte Getränke. Es bietet einer kleinen Runde einen eigenen Ort für Gespräche, Musik oder Gesellschaft.', 'Bis sechs Gäste · Speisen, Getränke und Künstler gesondert')
];

export const NIXE_SERVICE_ICONS = [
  ['gesellschaft', 'ONE elegant folded ivory and burgundy hand fan with a tiny gold pearl clasp. Closed simple decorative fan, no person.'],
  ['privat', 'ONE pair of gently parted wine-red velvet curtains tied with two small gold cords, a small ivory pearl pendant hanging centrally. Compact emblem-like object, no room, person, body or bed.'],
  ['tanz', 'ONE pair of burgundy medieval soft dancing slippers with graceful golden ribbon ties curling gently around them. No feet, legs or person.'],
  ['musik', 'ONE small finely made medieval lute with warm honey-colored wood, burgundy strap and a simple gold rosette. Whole instrument, no hands or person.'],
  ['zimmer', 'ONE ornate but readable medieval brass room key with a small ivory bed-shaped key tag. Single compact connected key-and-tag object, no lettering.'],
  ['dauer', 'ONE small closed burgundy leather travel chest with brass corners and a single brass key resting across the lid. Compact readable whole object, no lettering.'],
  ['bad', 'ONE small copper wash basin containing clear water with one neatly folded ivory linen towel draped over its rim. No person, hands or scenery.'],
  ['salon', 'ONE burgundy upholstered medieval armchair with carved dark oak arms and restrained gold edging. Whole single chair, no room, person or floor.']
].map(([id, visual]) => ({ id, visual }));

export function buildNixeServicesPage() {
  return { schemaVersion: 1, commentThreadKey: 'nixe-services-20261016', pageTitle: '✦ — Services — ✦', guildServicesPage: true,
    guildServices: { title: 'Services',
      introduction: '<p>Ein stilles Zimmer, ein Lied für die eigene Runde oder ein Abend mit einer Dame des Hauses: Johanna und der Empfang nehmen Wünsche entgegen und vereinbaren Zeit, Räume und Preis. Die folgenden Tarife gelten für die jeweils beschriebene Leistung.</p>',
      services: NIXE_SERVICES.map(item => ({ title: item.title, icon: `${NIXE_ART}/services/${item.icon}.png`,
        description: `<p>${item.description}</p>`, clients: '', scope: item.scope,
        terms: `${item.copper.toLocaleString('de-DE')} Kupfertaler · ${item.unit}` })),
      process: '<p>Der Empfang prüft freie Zimmer und Termine und bestätigt die gewünschte Dauer. Für private Gesellschaft wird die gewünschte Dame persönlich angefragt; Tanz und Musik werden mit den Künstlerinnen abgestimmt. Zusätzliche Stunden werden vor einer Verlängerung vereinbart.</p>',
      conditions: '<p>Speisen und Getränke werden nach der Hauskarte berechnet. Bei Gesellschaft, Tanz und Musik ist ein privater Raum nur dann eingeschlossen, wenn er ausdrücklich vereinbart wurde. Langzeitgäste zahlen ihren Hausmonat im Voraus; Gesellschaft und Abendessen werden gesondert bestellt.</p>',
      footer: 'Die Lachende Nixe · südliches Hafenviertel, Gwynthor · Ein Hausmonat umfasst 36 Nächte.' } };
}
