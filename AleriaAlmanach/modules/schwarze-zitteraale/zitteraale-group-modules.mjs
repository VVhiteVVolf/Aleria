import { ZITTERAALE_GROUPS } from './zitteraale-people.mjs';
import { buildZitteraaleGroupHierarchy } from './zitteraale-group-hierarchy.mjs';
import { buildMedrawdBiography, MEDRAWD_ID } from './medrawd-angau.mjs';
import { SUMPFNATTERN_ID, CADWGAN_ID } from './sumpfnattern-people.mjs';
import { buildSumpfnatternPages } from './sumpfnattern-pages.mjs';

export const ZITTERAALE_SECTION_PATH = Object.freeze(['Schwarze Zitteraale']);
export const ZITTERAALE_GROUP_SECTION_PATH = Object.freeze([...ZITTERAALE_SECTION_PATH, 'Schwarze Zitteraale - Gruppen']);
const territory = 'Bronhir · Llysfaen · Craithglyn · Mwyncreig · Tŵr Rhewgorn · Gwynthors Bannkreis';
const groupImage = (group, image = group.banner) => ({ image, imageWidth: 36, imageTall: true, imageFit: 'contain', imagePosition: 'center' });

function groupOverview(group) {
  return {
    schemaVersion: 1, pageTitle: group.name, commentThreadKey: `${group.id}-uebersicht`, ...groupImage(group, group.overviewImage || group.banner),
    imageFit: group.overviewImage ? 'cover' : 'contain',
    description: group.detailed
      ? '<p><strong>Die Untoten Aale</strong> sind eine der ältesten Unterbanden der Schwarzen Zitteraale. Ihr Anführer ist <strong>Medrawd Angau</strong>, der Untote Aal. Sie setzen Bauernhöfe und Geschäfte unter Druck und lassen sich auf krumme Geschäfte mit Menschen ein, die ihre Dienste oder Verbindungen suchen.</p><p>Schutzgelderpressung, Raub, Überfälle, Terror und gezielte Anschläge bilden ihre Einnahmequellen. Ihr Wirkungsraum umfasst das Umland von <strong>Bronhir, Llysfaen, Craithglyn, Mwyncreig und Tŵr Rhewgorn</strong> sowie <strong>Gwynthors Bannkreis</strong>.</p><p>Die Gruppe war für den <strong>Angriff auf Llysfaen</strong> und den <strong>Überfall auf das Bradrhith-Gestüt</strong> verantwortlich. Sir Rhys Draig kam der Schar zuvor und fügte ihr schwere Verluste zu. Der damalige erste Leutnant fiel, während Medrawd selbst abwesend war. <strong>Rhodri</strong>, der zweite Leutnant, und die einfachen Mitglieder <strong>Brychan und Tegid</strong> gerieten in Gefangenschaft.</p><p>Die Unterbande blieb geschwächt, füllte ihre Reihen jedoch mit Rekruten und Mitgliedern aus dem Hauptquartier auf. Brychan und Tegid werden heute unter den Verstorbenen geführt, Rhodri als Ex-Mitglied. Wo Medrawd sein eigenes Hauptquartier unterhält, ist unklar. Ein Versteck in den Bergen von Tŵr Rhewgorn wird vermutet.</p><p>Ihr Banner zeigt einen untoten Aal, dessen verfallender Leib von Maden zerfressen wird. Es verbindet schwarzes Tuch mit gelben und silbernen Akzenten.</p>'
      : `<p><strong>${group.name}</strong> ist eine der acht Unterbanden der Schwarzen Zitteraale. Sie besitzt eine eigene Gruppenführung, zwei Leutnantstellen und ein vorbereitetes Aufgebot von sechzehn Räubern.</p><p>Gruppenname, Geschichte, Territorium und persönliche Besetzung sind noch offen. Das blanke schwarze Banner kennzeichnet die noch unbenannte Unterbande. Die Anführerbio und die Hauptquartiersszene sind für ihre spätere Ausarbeitung vorbereitet.</p>`,
    stats: [
      ['Zugehörigkeit', 'Die Schwarzen Zitteraale'], ['Gruppenkennung', `Gruppe ${group.numeral}.`],
      ['Anführer', group.detailed ? 'Medrawd Angau · Untoter Aal' : 'Noch unbenannt'],
      ['Führung', 'Ein Gruppenführer · zwei Leutnants'], ['Aufgebot', 'Sechzehn Räuberplätze'],
      ['Territorium', group.detailed ? territory : 'Noch unbestimmt'],
      ['Hauptquartier', group.detailed ? 'Unklar · Berge von Tŵr Rhewgorn vermutet' : 'Noch unbestimmt']
    ]
  };
}

function groupLeaderPage(group) {
  if (group.detailed) {
    const bio = buildMedrawdBiography();
    return {
      schemaVersion: 1, pageTitle: bio.pageTitle, commentThreadKey: `${group.id}-anfuehrer`, biographyPage: true,
      image: group.leaderPortrait, imageWidth: 38, imageTall: true,
      description: 'Untoter Aal · ehemaliger Kleriker und Schwurritter · Anführer der Untoten Aale',
      stats: bio.stats, biography: bio.biography
    };
  }
  return {
    schemaVersion: 1, pageTitle: 'Anführer · unbenannt', commentThreadKey: `${group.id}-anfuehrer`, biographyPage: true,
    image: group.leaderPortrait, imageWidth: 38, imageTall: true,
    stats: [['Name', 'Noch unbenannt'], ['Amt', 'Gruppenführer'], ['Unterbande', group.name], ['Herkunft', 'Noch offen'], ['Alter', 'Noch offen']],
    biography: {
      portrait: group.leaderPortrait, crestImage: group.banner,
      biographyTitle: `Die Führung von ${group.name}`, biographyText: '<p>Diese Führungsstelle besitzt noch keine namentliche Besetzung.</p>',
      historyTitle: 'Aufgabe innerhalb der Bande', historyText: '<p>Die Gruppenführung nimmt Aufträge der übergeordneten Führung entgegen, verteilt sie auf ihre beiden Leutnants und verantwortet das eigene Aufgebot. Sie stimmt Beuteanteile, Versorgung und Verstärkungen mit den Schwarzen Zitteraalen ab.</p>',
      worksTitle: 'Noch offene Angaben', works: ['Name und persönliches Porträt', 'Herkunft und Vorgeschichte', 'Wesen und persönliche Verbindungen'],
      documentsTitle: 'Bandenakten', documents: [{ title: 'Die Schwarzen Zitteraale', text: 'Bandenführung und Gruppenübersicht.', link: '/AleriaAlmanach/AleriaAlmanach.html?entry=schwarze-zitteraale' }]
    }
  };
}

function groupHeadquarters(group) {
  return {
    schemaVersion: 1, pageTitle: 'Hauptquartier · Ort unbekannt', commentThreadKey: `${group.id}-hauptquartier`, ...groupImage(group, group.headquartersImage || group.banner), sessionPage: true,
    imageFit: group.headquartersImage ? 'cover' : 'contain',
    sessionIntro: group.detailed
      ? '<p>Der Rückzugsort der Untoten Aale ist bislang unbekannt. Gerüchte weisen in die Berge von Tŵr Rhewgorn. Weder ein bestimmter Turm noch ein Zugang oder eine Raumfolge sind bestätigt.</p><p>Die Gruppe hat schwere Verluste erlitten und Verstärkung aus dem Hauptquartier der Schwarzen Zitteraale erhalten. Was Reisende über einen möglichen Unterschlupf erfahren, entscheidet sich auf ihren Wegen durch das Gebiet.</p>'
      : `<p>Der Hauptquartiersort von ${group.name} ist noch unbestimmt. Der Schauplatz, sein Zugang und seine Räume stehen für die spätere Ausarbeitung offen.</p>`,
    sessionLocation: '', sessionHint: group.detailed ? 'Lage unklar · Berge von Tŵr Rhewgorn vermutet' : 'Hauptquartiersort noch unbestimmt',
    sessionEmptyTitle: 'Die Szene ist offen', sessionEmptyText: 'Ein Schauplatz im Rückzugsraum dieser Unterbande.',
    sessionDateAleria: { year: null, month: null, day: null }
  };
}

export function buildZitteraaleGroupModules() {
  return ZITTERAALE_GROUPS.map(group => {
    const authored = group.id === SUMPFNATTERN_ID ? buildSumpfnatternPages(group) : {};
    return {
      id: group.id, title: group.name, subtitle: `Schwarze Zitteraale · Gruppe ${group.numeral}.`,
      type: 'Unterbande', category: 'Kriminalität · Schwarze Zitteraale', icon: '⚑',
      symbol: group.emblem || group.banner, image: group.banner, previewImage: group.emblem || group.banner, stamp: `SCHWARZE ZITTERAALE · GRUPPE ${group.numeral}.`,
      schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
      sessionCast: group.detailed ? [MEDRAWD_ID] : group.id === SUMPFNATTERN_ID ? [CADWGAN_ID] : [],
      pages: [
        authored.overview || groupOverview(group), authored.leader || groupLeaderPage(group),
        { schemaVersion: 1, pageTitle: 'Hierarchie', commentThreadKey: `${group.id}-hierarchie`, hierarchyPage: true, hierarchy: buildZitteraaleGroupHierarchy(group) },
        authored.headquarters || groupHeadquarters(group)
      ]
    };
  });
}
