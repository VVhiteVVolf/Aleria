import { createHuskarlTechnique } from './huskarl-technique-factory.js';
import { HUSKARL_FORM_IDS as F } from './huskarl-forms.js';

const levels = [9, 11, 13, 15, 17, 20];
const profiles = {
  skjoldr: {
    wall: [['Schildkante des Huskarls', 'shield'], ['Eiserne Hut', 'flexible'], ['Gekreuzte Wacht', 'paired'], ['Lange Bindung', 'longblade'], ['Tor aus Eisen', 'shield'], ['Ungebrochene Mitte', 'flexible']],
    advance: [['Hieb der Vorhut', 'flexible'], ['Schneidender Schritt', 'longblade'], ['Zwillingskeil', 'paired'], ['Kante des Durchbruchs', 'shield'], ['Eisenpforte', 'longblade'], ['Bannerstoß', 'flexible']]
  },
  skytte: {
    wall: [['Pfeil der Wacht', 'bow'], ['Hut des Waldläufers', 'spear'], ['Sax gegen den Ansturm', 'sidearm'], ['Speer der Grenze', 'spear'], ['Deckung der Lichtung', 'bow'], ['Pfeil der letzten Wacht', 'bow']],
    advance: [['Pfeil der Vorhut', 'bow'], ['Speer aus dem Unterholz', 'spear'], ['Hieb des Fährtenlesers', 'sidearm'], ['Grenzjägerschuss', 'bow'], ['Stoß des Wildpfads', 'spear'], ['Pfeil des offenen Weges', 'bow']]
  },
  thegnar: {
    wall: [['Lanze des Weges', 'lance', true], ['Abgesessene Wache', 'rider'], ['Hieb an der Flanke', 'rider', true], ['Hut des Hest-Reiters', 'rider'], ['Lanzenriegel', 'lance', true], ['Wacht des Thanen', 'rider']],
    advance: [['Anritt der Vorhut', 'lance', true], ['Wegbrecherhieb', 'rider'], ['Wende des Hest-Rosses', 'rider', true], ['Lanze des Patrouillenführers', 'lance', true], ['Abgesessener Durchbruch', 'rider'], ['Keil des Thanen', 'lance', true]]
  },
  skeidr: {
    wall: [['Relinghieb', 'deck'], ['Stand des Seefahrers', 'deck'], ['Wurf der Küstenwache', 'throwing'], ['Sax der Enterwacht', 'sidearm'], ['Hut am Mast', 'deck'], ['Letzte Reling', 'deck']],
    advance: [['Erster Enterhieb', 'deck'], ['Wurf zur Landung', 'throwing'], ['Sax im Gedränge', 'sidearm'], ['Hammer des Vorschiffs', 'deck'], ['Kielbrecherhieb', 'deck'], ['Banner auf fremdem Deck', 'deck']]
  },
  skjaldr: {
    wall: [['Axtbindung des Schildbeißers', 'twinAxes'], ['Gezügelte Hut', 'flexible'], ['Lange Gegenkante', 'greatAxe'], ['Schild und Zorn', 'shield'], ['Gekreuztes Bollwerk', 'twinAxes'], ['Wacht des gebändigten Feuers', 'greatAxe']],
    advance: [['Biss in die Linie', 'twinAxes'], ['Gerichteter Axtschritt', 'greatAxe'], ['Zwei Äxte, ein Ziel', 'twinAxes'], ['Hieb des eisernen Willens', 'flexible'], ['Spaltkeil', 'greatAxe'], ['Herr der Bresche', 'twinAxes']]
  }
};
const lessons = {
  wall: [
    { cost: 'bind', guard: 1, effect: 'Ein Treffer gewährt +1 RK für einen eigenen Beitrag; ersetzt schwächere Deckung.' },
    { cost: 'prepare', noDamage: true, guard: 2, effect: 'Schadenslose Abwehr: +2 RK für einen eigenen Beitrag. Keine automatische Gegenattacke.' },
    { cost: 'bind', penalty: true, effect: 'Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.' },
    { cost: 'committed', guard: 1, effect: 'Ein kräftiger Einzelangriff; bei Treffer +1 RK für einen eigenen Beitrag.' },
    { cost: 'prepare', noDamage: true, guard: 2, effect: 'Schadenslose Deckung: +2 RK für einen eigenen Beitrag. Mit Tragender Front darf stattdessen ein Verbündeter in 2 m geschützt werden.' },
    { cost: 'master', guard: 2, effect: 'Ein teurer Meisterangriff, bei Treffer +2 RK für einen eigenen Beitrag; keine Schadensimmunität.' }
  ],
  advance: [
    { cost: 'advance', effect: 'Ein Einzelangriff mit bis 1 m Eigenbewegung nach Treffer; innerhalb der vorhandenen Bewegung.' },
    { cost: 'bind', penalty: true, effect: 'Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.' },
    { cost: 'advance', effect: 'Ein wuchtiger Einzelangriff auf eine bewusst gewählte Öffnung. Keine Zusatzattacke.' },
    { cost: 'committed', effect: 'Ein kräftiger Angriff, danach bis 2 m Eigenbewegung innerhalb des Bewegungsbudgets.' },
    { cost: 'finisher', penalty: true, effect: 'Ein seltener Abschluss. Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.' },
    { cost: 'master', effect: 'Ein einzelner Meisterangriff mit vollem Kostenpaket. Schildbruch und Verdrängung bleiben gesonderte, situative Auswertung.' }
  ]
};

export function getHuskarlExpertTechniques(classId) {
  const profile = profiles[classId];
  if (!profile) return [];
  return Object.entries(profile).flatMap(([path, options]) => options.map(([name, weapon, mounted], index) =>
    createHuskarlTechnique(classId, F[path], { ...lessons[path][index], name, weapon, mounted,
      level: levels[index], slug: `${path}-${index + 1}` })));
}
