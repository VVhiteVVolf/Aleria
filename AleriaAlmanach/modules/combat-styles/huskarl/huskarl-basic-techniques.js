import { createHuskarlTechnique } from './huskarl-technique-factory.js';
import { HUSKARL_FORM_IDS as F } from './huskarl-forms.js';

// Each tuple is an authored option: level, name, weapon, cost, effect, metadata.
const lessons = {
  'hird-maid': [
    [1, 'Kurzer Hofhieb', 'militia', 'light', 'Ein schwacher, kurzer Hieb ohne zusätzliche Wirkung.'],
    [2, 'Schild an Schild', 'shield', 'guard', 'Schadenslose Deckung: +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }],
    [3, 'Stoß aus der Reihe', 'spear', 'strike', 'Ein gerader Speerstoß auf Waffenreichweite.'],
    [4, 'Waffe binden', 'militia', 'bind', 'Nach Treffer KRF-Rettungswurf: bei Fehlschlag −1 Angriff für einen eigenen Beitrag.', { penalty: true }],
    [5, 'Hieb des Aufgebots', 'militia', 'advance', 'Ein entschlossener Einzelhieb; kein kostenloser Folgeangriff.'],
    [6, 'Hofwacht', 'shield', 'prepare', 'Schadenslos +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1, formId: F.militia }],
    [8, 'Lücke schließen', 'militia', 'advance', 'Ein Hieb und danach bis 1 m Eigenbewegung innerhalb des Bewegungsbudgets.', { formId: F.militia }],
    [10, 'Speer des Aufgebots', 'spear', 'bind', 'Nach Treffer KRF-Rettungswurf: bei Fehlschlag −1 Angriff für einen eigenen Beitrag.', { penalty: true, formId: F.militia }],
    [12, 'Gemeinsame Deckung', 'shield', 'prepare', 'Schadenslos +2 RK für einen eigenen Beitrag; ersetzt schwächere Deckung.', { noDamage: true, guard: 2, formId: F.militia }],
    [14, 'Fester Gegenstoß', 'militia', 'committed', 'Ein kräftiger Einzelangriff aus sicherem Stand.', { formId: F.militia }],
    [15, 'Letztes Hoftor', 'shield', 'finisher', 'Ein abschließender Hieb, danach +1 RK für einen eigenen Beitrag.', { guard: 1, formId: F.militia }]
  ],
  skjoldr: [
    [1, 'Kurzer Kantenhieb', 'flexible', 'light', 'Kurzer Einzelhieb; kein zweiter Angriff aus der Nebenhand.'],
    [2, 'Hut des Schildträgers', 'shield', 'guard', 'Schadenslos +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }],
    [3, 'Langer Eisenhieb', 'longblade', 'strike', 'Ein sauber geführter Zweihandhieb.'],
    [4, 'Gekreuzte Eisen', 'paired', 'bind', 'Ein gemeinsam geführtes Manöver beider Waffen. Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.', { penalty: true }],
    [5, 'Schildkante öffnen', 'shield', 'advance', 'Ein Einhandhieb aus dem Schutz des Schildes.'],
    [6, 'Fester Linienhieb', 'flexible', 'committed', 'Ein kräftiger Schlag in die gegnerische Deckung; keine automatische Schildzerstörung.'],
    [7, 'Schritt hinter den Schild', 'shield', 'bind', 'Ein Hieb; bei Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }],
    [8, 'Lange Wende', 'longblade', 'advance', 'Ein langer Einzelhieb mit Richtungswechsel; keine Flächenattacke.']
  ],
  skytte: [
    [1, 'Erster Jagdpfeil', 'bow', 'light', 'Ein leichter Schuss auf ein einzelnes Ziel.'],
    [2, 'Ruhiger Atem', 'bow', 'prepare', 'Schadenslose Vorbereitung: +1 Angriff für einen eigenen Beitrag.', { noDamage: true, aim: true }],
    [3, 'Speer am Wildpfad', 'spear', 'strike', 'Ein sicherer Speerstoß im Nahkampf.'],
    [4, 'Sax im Unterholz', 'sidearm', 'bind', 'Nahkampftreffer mit Bindung: KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.', { penalty: true }],
    [5, 'Schuss durch die Lichtung', 'bow', 'advance', 'Ein sorgfältig angesetzter Schuss; keine automatische Deckungsaufhebung.'],
    [6, 'Grenzwächterschuss', 'bow', 'committed', 'Ein kräftiger, einzelner Bogenschuss.'],
    [7, 'Abstand mit dem Speer', 'spear', 'bind', 'Nahkampftreffer; danach +1 RK für einen eigenen Beitrag.', { guard: 1 }],
    [8, 'Pfeil der Fährte', 'bow', 'advance', 'Ein genauer Einzelpfeil auf ein sichtbares Ziel.']
  ],
  thegnar: [
    [1, 'Kurzer Sattelhieb', 'rider', 'light', 'Ein leichter Hieb vom Ross aus.', { mounted: true }],
    [2, 'Abgesessene Hut', 'rider', 'guard', 'Auch zu Fuß nutzbar: schadenslos +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }],
    [3, 'Erster Lanzenanritt', 'lance', 'strike', 'Ein Lanzenstoß nach freiem Anritt.', { mounted: true }],
    [4, 'Hieb des Wegwächters', 'rider', 'bind', 'Eigenständiger Nahkampfangriff, auch zu Fuß. KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.', { penalty: true }],
    [5, 'Wende am Zügel', 'rider', 'advance', 'Ein seitlicher Sattelhieb; Wendebewegung bleibt im Bewegungsbudget.', { mounted: true }],
    [6, 'Stoß des Hest-Reiters', 'lance', 'committed', 'Ein geführter Lanzenstoß ohne zusätzliche Rossattacke.', { mounted: true }],
    [7, 'Sattel und Boden', 'rider', 'bind', 'Ein einzelner Hieb, im Sattel oder abgesessen; bei Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }],
    [8, 'Lanze im Vorbeireiten', 'lance', 'advance', 'Ein Lanzenangriff nach Anritt, kein weiterer Hieb auf ein zweites Ziel.', { mounted: true }]
  ],
  skeidr: [
    [1, 'Kurzer Deckhieb', 'deck', 'light', 'Ein leichter Hieb auf engem Deck.'],
    [2, 'Hut an der Reling', 'deck', 'guard', 'Schadenslos +1 RK für einen eigenen Beitrag; auch an Land nutzbar.', { noDamage: true, guard: 1 }],
    [3, 'Wurf zum Auftakt', 'throwing', 'strike', 'Ein Wurf mit einsatzbereiter Waffe. Rückholen ist eine gesonderte Handlung.'],
    [4, 'Haken am Waffenarm', 'deck', 'bind', 'Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag. Kein automatisches Entwaffnen.', { penalty: true }],
    [5, 'Sax am Niedergang', 'sidearm', 'advance', 'Ein kurzer Einzelhieb in enger Distanz.'],
    [6, 'Schlag der Enterwache', 'deck', 'committed', 'Ein kräftiger Einzelhieb; Objektbeschädigung gesondert beurteilen.'],
    [7, 'Ruhiger Deckschritt', 'deck', 'bind', 'Ein Hieb und bei Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }],
    [8, 'Wurf über den Steg', 'throwing', 'advance', 'Ein gezielter Wurf; Hindernisse und Deckung bleiben wirksam.']
  ],
  skjaldr: [
    [1, 'Kurzer Axthieb', 'flexible', 'light', 'Ein leichter Einzelhieb, noch ohne Berserkergang.'],
    [2, 'Gebändigter Stand', 'flexible', 'guard', 'Schadenslose Deckung: +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }],
    [3, 'Langer Spalthieb', 'greatAxe', 'strike', 'Ein kontrollierter Hieb mit der langen Streitaxt.'],
    [4, 'Doppelter Axtgriff', 'twinAxes', 'bind', 'Zwei geführte Äxte, ein gemeinsamer Technikwurf. Nach Treffer KRF-Rettungswurf gegen −1 Angriff für einen eigenen Beitrag.', { penalty: true }],
    [5, 'Haken hinter den Schild', 'shield', 'advance', 'Ein Hieb aus der Schilddeckung; kein Berserkerbonus unter Stufe 6.'],
    [6, 'Hieb des Schildbeißers', 'greatAxe', 'committed', 'Ein kräftiger Einzelhieb. Der Berserkergang muss separat aktiviert werden.'],
    [7, 'Gekreuzte Axtwende', 'twinAxes', 'bind', 'Ein gemeinsamer Angriff; bei Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }],
    [8, 'Gerichteter Spaltstoß', 'greatAxe', 'advance', 'Ein schwerer, kontrollierter Einzelhieb; keine automatische Schildzerstörung.']
  ]
};

export function getHuskarlBasicTechniques(classId) {
  return (lessons[classId] || []).map(([level, name, weapon, cost, effect, extra = {}], index) => {
    const formId = extra.formId || (level <= 6 ? F.foundation : F.advanced);
    return createHuskarlTechnique(classId, formId, { level, name, weapon, cost, effect, ...extra, slug: `grund-${index + 1}` });
  });
}
