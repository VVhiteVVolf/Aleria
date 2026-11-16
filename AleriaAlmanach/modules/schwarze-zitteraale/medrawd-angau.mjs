import { ZITTERAALE_EMBLEM, ZITTERAALE_GROUPS } from './zitteraale-people.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { UNTOTE_AELE_LIEUTENANTS } from './untote-aele-lieutenants.mjs';

const group = ZITTERAALE_GROUPS[0];
export const MEDRAWD_ID = group.leaderId;
export const MEDRAWD_PORTRAIT = group.leaderPortrait;
export const MEDRAWD_BIO = 'Medrawd Angau, der Untote Aal, führt die Unterbande Die Untoten Aale innerhalb der Schwarzen Zitteraale. Der frühere Gwynthorer Kleriker und Schwurritter gehörte zum engsten Dienstkreis des Patriarchen. Seine Beschäftigung mit Verstorbenen wurde zur krankhaften Obsession mit dem Untod. Nach dem Bruch mit der Kirche wandte sich der einst Kharon verpflichtete Schwurträger nekromantischen und infernalen Praktiken und schließlich Hela, der Schicksalsweberin, zu. Er ist etwa fünfzig Jahre alt und wirkt durch diese Praktiken wie ein Mann von vierunddreißig Jahren.';

export const MEDRAWD_HISTORY = Object.freeze([
  { title: 'Im Dienst des Patriarchen', text: '<p>Medrawd war Kleriker und Schwurritter in Gwynthor. Er diente unter dem Patriarchen und zählte zu dessen engsten Vertrauten. Seinen Treueeid hatte er Kharon geschworen. Hinter der Würde dieses Amtes entwickelte sich eine wachsende Faszination für den Zustand zwischen Tod und fortgesetztem Dasein.</p>' },
  { title: 'Die Beschäftigung mit den Toten', text: '<p>Zunächst meldete er sich freiwillig für die Pflege Verstorbener und für Leichenöffnungen. Was als besonderer Eifer erscheinen konnte, wurde zu einer immer krankhafteren Obsession. Als der Patriarch von seinen Neigungen erfuhr und ihn zur Rede stellte, eskalierte die Auseinandersetzung zum offenen Streit. Medrawd verließ die Kirche.</p>' },
  { title: 'Der gebrochene Schwur', text: '<p>In den folgenden Jahren radikalisierte er sich. Er vertiefte sich in nekromantische Praktiken, verfluchte Kharon und wurde zum eidbrüchigen Schwurträger des Gottes, dem er einst Treue geschworen hatte. Seine heutige Hingabe gilt der finsteren Schicksalsweberin Hela. Die Beschäftigung mit Magie und dem Infernalen hat ihn verjüngt beziehungsweise sein sichtbares Altern aufgehalten.</p>' },
  { title: 'Huw Saethwyr und das gescheiterte Attentat', text: '<p>Bei einem Versuch, den Patriarchen zu töten, kreuzte Medrawd die Klingen mit Huw Saethwyr. Huw schlug ihm eine Hand ab und glaubte, ihn getötet zu haben. Medrawds Schergen konnten den Schwerverletzten jedoch retten und mit ihm entkommen. Die verlorene Hand ließ er später durch eine mechanische silberne Hand mit einem gelben Edelstein auf dem Handrücken ersetzen.</p>' },
  { title: 'Der Untote Aal', text: '<p>Heute führt Medrawd Die Untoten Aale, eine der ältesten Unterbanden der Schwarzen Zitteraale. Sie erpresst Höfe und Geschäfte und übernimmt krumme Geschäfte für Menschen, die den Kontakt zu ihr suchen. Schutzgelder, Raub, Überfälle, Terror und gezielte Anschläge finanzieren die Gruppe. Ihr Wirkungsraum umfasst das Umland von Bronhir, Llysfaen, Craithglyn, Mwyncreig, Tŵr Rhewgorn und den Bannkreis von Gwynthor.</p>' },
  { title: 'Die Verluste gegen Sir Rhys Draig', text: '<p>Die Unterbande war für den Angriff auf Llysfaen und den Überfall auf das Bradrhith-Gestüt verantwortlich. Sir Rhys Draig kam ihr zuvor, tötete den damaligen ersten Leutnant und fügte der Schar schwere Verluste zu. Medrawd war bei diesem Gefecht abwesend. Rhodri, der damalige zweite Leutnant, sowie Brychan und Tegid, zwei einfache Mitglieder, wurden festgenommen.</p><p>Brychan und Tegid werden heute unter den Verstorbenen geführt, Rhodri unter den Ex-Mitgliedern. Die geschwächte Gruppe konnte ihre Reihen durch Rekruten und Mitglieder aus dem Hauptquartier der Schwarzen Zitteraale auffüllen. Die heutigen Leutnants sind ein grober ehemaliger Ritter und eine Zauberwirkerin. Ihre Namen sind noch offen.</p>' },
  { title: 'Ein unbestimmter Rückzugsort', text: '<p>Wo die Unterbande ihr Hauptquartier unterhält, ist unklar. Ein Versteck in den Bergen von Tŵr Rhewgorn wird vermutet. Der ruinierte Bergturm auf Medrawds Porträt bildet eine stimmige Kulisse, belegt aber keinen bestimmten Standort.</p>' }
]);

export function buildMedrawdBiography() {
  return {
    schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: 'Medrawd Angau · Untoter Aal',
    stats: [
      ['Name', 'Medrawd Angau'], ['Beiname', 'Untoter Aal'], ['Tatsächliches Alter', 'Etwa 50 Jahre'],
      ['Erscheinung', 'Etwa 34 Jahre'], ['Früherer Stand', 'Kleriker und Schwurritter in Gwynthor'],
      ['Früherer Eid', 'Kharon · gebrochen'], ['Heutiger Dienst', 'Hela · Schicksalsweberin'],
      ['Bande', 'Die Untoten Aale · Gruppe I.'], ['Farben', 'Gelb · Schwarz · Silber']
    ],
    biography: {
      portrait: MEDRAWD_PORTRAIT, crestImage: group.banner,
      biographyTitle: 'Der eidbrüchige Schwurträger', biographyText: `<p>${MEDRAWD_BIO}</p>`,
      abilitiesTitle: 'Wesen und Praktiken', abilities: [
        { title: 'Unheimliche Obsession', icon: '/IconOrdner/Traits%20Icon/Zealous.png', detail: 'Seine Beschäftigung mit dem Untod hat den früheren Dienst an den Verstorbenen vollständig vereinnahmt.' },
        { title: 'Arroganz', icon: '/IconOrdner/Traits%20Icon/Proud.png', detail: 'Begegnet dem Rittertum mit Verachtung und trägt seinen Anspruch mit kalter Selbstgewissheit.' },
        { title: 'Nekromantie und infernale Praktiken', icon: '/IconOrdner/Traits%20Icon/Scholar.png', detail: 'Vertiefte sich nach seinem Kirchenaustritt in verbotene Praktiken, die sein sichtbares Altern aufgehalten haben.' }
      ],
      historyTitle: 'Das gezeichnete Gesicht',
      historyText: '<p>Das einst rote Haar ist silbrig, dünn und glatt und fällt ihm bis zur Brust. Auf der verbrannten rechten Gesichtshälfte ist der Haarwuchs an der Schläfe lückenhaft und das Ohr teilweise zerstört und vernarbt. Das dort erblindete Auge wurde durch einen schwarz leuchtenden Edelstein ersetzt. Schwarze Adern ziehen sich über diese Seite bis zum Nacken. Sein gesundes Auge ist hellblau, seine Haut blass. Die einst attraktiven Gesichtszüge wirken hart, ernst und unheimlich hochmütig.</p>',
      worksTitle: 'Harnisch, Hand und Schwert', works: [
        'Schwarze Plattenrüstung mit gelben und silbernen Akzenten.',
        'Auf dem Harnisch ein toter schwarzer Wyvern, der von Maden zerfressen wird.',
        'Mechanische silberne Ersatzhand mit gelbem Edelstein im Handrücken. Mit ihr wirkt er Magie.',
        'Ein imposantes, verziertes und verzaubertes Schwert in der anderen Hand.'
      ],
      extraSections: MEDRAWD_HISTORY.map(section => ({ ...section, position: 'afterWorks', mode: 'text' })),
      connectionsTitle: 'Gefolgschaft und Feindschaften', connections: [
        ...UNTOTE_AELE_LIEUTENANTS.map(person => ({ name: person.title, image: person.portrait, imageFormat: 'portrait', detail: person.appearance })),
        { name: group.name, image: group.banner, imageFormat: 'portrait', detail: 'Anführer der ersten Unterbande der Schwarzen Zitteraale.' },
        { name: 'Die Schwarzen Zitteraale', image: ZITTERAALE_EMBLEM, detail: 'Übergeordnete Bande. Aus ihrem Hauptquartier erhielt seine geschwächte Gruppe Verstärkung.' },
        { name: 'Huw Saethwyr', image: '/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-saethwyr.png', detail: 'Vereitelte den Mordversuch am Patriarchen und schlug Medrawd eine Hand ab.' },
        { name: 'Sir Rhys Draig', image: '/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png', detail: 'Tötete Medrawds ersten Leutnant und brachte den zweiten Leutnant mit zwei einfachen Mitgliedern in Gefangenschaft.' }
      ],
      documentsTitle: 'Bandenakten', documents: [
        { title: group.name, text: 'Gruppenbio, Anführerbio, Hierarchie und Hauptquartiersszene.', link: `/AleriaAlmanach/AleriaAlmanach.html?entry=${group.id}` },
        { title: 'Die Schwarzen Zitteraale', text: 'Führung und acht Unterbanden.', link: '/AleriaAlmanach/AleriaAlmanach.html?entry=schwarze-zitteraale' }
      ], footer: 'Medrawd Angau · Untoter Aal · Celtigerns Wacht'
    }
  };
}

export function buildMedrawdCharacterExport() {
  const biography = sanitizeCharacterBiographyForFirestore({ biography: buildMedrawdBiography() }).biography;
  return {
    type: 'aleria-character', version: 1, exportedAt: '2026-11-16T18:00:00Z', assignedTab: 'Schwarze Zitteraale',
    character: {
      id: MEDRAWD_ID, name: 'Medrawd Angau', aliases: ['Untoter Aal'], age: 50, ageNote: 'Etwa 50 Jahre, sichtbares Alter etwa 34',
      gender: 'male', race: 'Mensch', title: 'Untoter Aal · eidbrüchiger Schwurträger',
      role: 'Anführer der Untoten Aale', fraktion: 'Schwarze Zitteraale', portrait: MEDRAWD_PORTRAIT,
      bio: `${MEDRAWD_BIO}\n\n${MEDRAWD_HISTORY.map(section => `${section.title}\n${section.text.replace(/<[^>]*>/g, '')}`).join('\n\n')}`,
      biography, archived: false
    }
  };
}
