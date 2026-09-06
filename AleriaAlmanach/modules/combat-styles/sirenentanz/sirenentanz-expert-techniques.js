import { createSirenentanzTechnique } from './sirenentanz-technique-factory.js';
import { SIRENENTANZ_FORM_IDS as F } from './sirenentanz-forms.js';

// Shared lesson budgets keep the three paths comparable. Names, weapon routes
// and execution remain class-specific; a catalogue option is never a free hit.
const lessons = {
  breaker: [
    { level: 9, cost: 'pressure', attackBonus: -1, defenseModifier: -1, effect: 'Technikschaden; −1 eigener Angriff und −1 Zielverteidigung nur für diesen Wurf.' },
    { level: 10, cost: 'strike', effect: 'Ein kontrollierter Techniktreffer mit der angegebenen Waffe.' },
    { level: 11, cost: 'pressure', penalty: 1, effect: 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.' },
    { level: 12, cost: 'flowing', guard: 1, effect: 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.' },
    { level: 13, cost: 'committed', defenseModifier: -1, exposed: true, effect: 'Kräftiger Techniktreffer gegen −1 Zielverteidigung; anschließend eigene RK −1 für einen Beitrag.' },
    { level: 15, cost: 'pressure', penalty: 2, effect: 'Technikschaden; KRF-Rettungswurf oder −2 Angriff für einen eigenen Beitrag.' },
    { level: 17, cost: 'finisher', attackBonus: -1, defenseModifier: -1, effect: 'Starker Abschluss mit −1 Angriff gegen −1 Zielverteidigung. Zusätzlich eine Besondere Aktion.' },
    { level: 20, cost: 'master', attackBonus: -1, exposed: true, effect: 'Meisterabschluss mit begrenztem Technikschaden; −1 Angriff und danach eigene RK −1 für einen Beitrag. Alle aufgeführten Kosten oder alternativ 1 Aura-Fokuspunkt.' }
  ],
  current: [
    { level: 9, cost: 'flowing', guard: 1, effect: 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.' },
    { level: 10, cost: 'light', effect: 'Kurzer Bonusangriff mit 1W4. Kein vollständiger Waffenwürfel und kein zusätzlicher Wurf.' },
    { level: 11, cost: 'preparation', noDamage: true, aim: true, effect: 'Kein Schaden; +1 Angriff bis zum Ende des nächsten eigenen Beitrags.' },
    { level: 12, cost: 'flowing', effect: 'Technikschaden; anschließend bis 2 m Eigenbewegung innerhalb der verfügbaren Bewegung.', manual: 'Freien Weg und verbleibende Bewegung prüfen. Kein kostenloses Lösen aus Bindungen.' },
    { level: 13, cost: 'pressure', penalty: 1, effect: 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.' },
    { level: 15, cost: 'flowing', guard: 1, effect: 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.' },
    { level: 17, cost: 'committed', attackBonus: 1, effect: 'Gebündelter Techniktreffer mit +1 Angriff; kostet Aktion, Bonusaktion und Reaktion.' },
    { level: 20, cost: 'master', guard: 2, attackBonus: 1, effect: 'Ein Meistertreffer mit +1 Angriff; auf Treffer +2 RK für einen eigenen Beitrag. Keine Mehrfachattacke und keine kostenlose Waffe in der zweiten Hand.' }
  ],
  depths: [
    { level: 9, cost: 'guard', noDamage: true, guard: 1, effect: 'Kein Schaden; +1 RK bis zum Ende des nächsten eigenen Beitrags.' },
    { level: 10, cost: 'pressure', penalty: 1, effect: 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.' },
    { level: 11, cost: 'preparation', noDamage: true, guard: 1, aim: true, effect: 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.' },
    { level: 12, cost: 'strike', effect: 'Ein regulärer Techniktreffer aus ruhigem Stand; kein automatischer Gegenangriff.' },
    { level: 13, cost: 'pressure', penalty: 2, effect: 'Technikschaden; KRF-Rettungswurf oder −2 Angriff für einen eigenen Beitrag.' },
    { level: 15, cost: 'preparation', noDamage: true, guard: 2, effect: 'Kein Schaden; +2 RK bis zum Ende des nächsten eigenen Beitrags. Gleichartige Deckung wird ersetzt, nicht addiert.' },
    { level: 17, cost: 'finisher', guard: 2, effect: 'Starker Techniktreffer; auf Treffer +2 RK für einen eigenen Beitrag. Zusätzlich eine Besondere Aktion.' },
    { level: 20, cost: 'master', guard: 2, penalty: 1, effect: 'Ein Meistertreffer und auf Treffer +2 RK für einen Beitrag. Das Ziel erhält nach misslungenem KRF-Rettungswurf −1 Angriff für einen Beitrag.' }
  ]
};

// [stable slug, display name, weapon route, execution, optional requirements]
const routes = {
  morwyr: {
    breaker: [
      ['relingkeil', 'Keil der Reling', 'polearm', 'Die Partisane sucht den schmalen Winkel zwischen Schild und Planke.'],
      ['salzaxt', 'Salzaxt', 'axe', 'Ein fester Enteraxthieb bleibt eng am Körper.'],
      ['harpunendruck', 'Harpunendruck', 'harpoon', 'Der schwere Wurf zwingt den Gegner zu einer unsauberen Deckung.'],
      ['bordwandhieb', 'Bordwandhieb', 'axe', 'Der Axtkopf kehrt nach dem Treffer vor die eigene Flanke zurück.'],
      ['bugkeil', 'Bugkeil', 'polearm', 'Ein offener Vorstoß bündelt die ganze Kraft hinter der Spitze.'],
      ['leinenruck', 'Leinenruck', 'harpoon', 'Der Wurf stört die Haltung des Gegners; die Leine hält die Waffe erreichbar.'],
      ['mastbrecher', 'Mastbrecher', 'axe', 'Ein tiefer Griff trägt einen schweren Hieb; der Name zerstört keinen Mast automatisch.'],
      ['sturm-am-bug', 'Sturm am Bug', 'polearm', 'Die vollständige Brandungsfolge endet in einem einzigen schweren Stoß.']
    ],
    current: [
      ['gischtwende', 'Gischtwende', 'axe', 'Der Kämpfer dreht die enge Axtlinie mit dem Rollen des Decks.'],
      ['fliegende-leine', 'Fliegende Leine', 'harpoon', 'Ein kurzer Störwurf hält die gegnerische Aufmerksamkeit fern.'],
      ['plankenruhe', 'Plankenruhe', 'polearm', 'Die Waffenspitze ruht, während der Morwyr den nächsten Deckschritt abpasst.'],
      ['seitengang', 'Seitengang', 'axe', 'Hieb und Seitenschritt führen aus der engen Passage.'],
      ['drehender-schaft', 'Drehender Schaft', 'polearm', 'Der Schaft lenkt die fremde Waffenlinie aus dem eigenen Schritt.'],
      ['kehrender-wurf', 'Kehrender Wurf', 'harpoon', 'Der Morwyr setzt den Wurf aus einer bereits gedeckten Drehung.'],
      ['engpassbogen', 'Engpassbogen', 'axe', 'Mehrere vorbereitende Bewegungen eröffnen einen einzigen klaren Hieb.'],
      ['meister-der-planken', 'Meister der Planken', 'polearm', 'Der Körper folgt dem Deck, die Spitze folgt allein dem Gegner.']
    ],
    depths: [
      ['ankerstelle', 'Ankerstelle', 'polearm', 'Der Schaft sperrt die Linie vor dem Morwyr.'],
      ['eiserner-haken', 'Eiserner Haken', 'axe', 'Der Axtkopf nimmt die fremde Waffe kurz aus dem Rhythmus.'],
      ['leinenruhe', 'Leinenruhe', 'harpoon', 'Stand und Wurf werden vorbereitet, ohne bereits zu werfen.'],
      ['ruhiger-bug', 'Ruhiger Bug', 'polearm', 'Die Spitze verlässt den ruhigen Stand erst im letzten Augenblick.'],
      ['fest-im-tau', 'Fest im Tau', 'axe', 'Ein knapper Schlag bedrängt Griff und Haltung des Gegners.'],
      ['deckung-der-reling', 'Deckung der Reling', 'polearm', 'Die Deckung bleibt geschlossen; der Morwyr verzichtet auf einen Angriff.'],
      ['ankerhieb', 'Ankerhieb', 'axe', 'Ein schwerer Hieb kehrt in eine eng geschlossene Stellung zurück.'],
      ['bastion-des-decks', 'Bastion des Decks', 'polearm', 'Der Abschluss hält den Gegner auf Distanz und die eigene Linie geschlossen.']
    ]
  },
  rhyfelwyr: {
    breaker: [
      ['eisenkeil', 'Eisenkeil', 'heavy', 'Der Waffenkopf trifft die schmale Kante der Deckung.'],
      ['felsfaust', 'Felsfaust', 'heavyOrSword', 'Ein sauberer, fester Hieb nimmt nur die nötige Strecke.'],
      ['schwurbrechergriff', 'Schwurbrechergriff', 'heavy', 'Der Schlag drückt gegen Griff und Waffenhaltung.'],
      ['geschlossener-brecher', 'Geschlossener Brecher', 'heavyOrSword', 'Der Hieb endet mit der Waffe dicht vor dem Körper.'],
      ['offene-brandung', 'Offene Brandung', 'heavy', 'Die volle Wucht öffnet für einen Augenblick auch die eigene Deckung.'],
      ['gegen-den-schildwall', 'Gegen den Schildwall', 'heavy', 'Die schwere Waffe trifft die Haltung eines einzelnen Gegners, nicht eine ganze Formation.'],
      ['eisenflut', 'Eisenflut', 'heavy', 'Ein langer vorbereiteter Schwung wird im letzten Moment verkürzt.'],
      ['letzter-wellenbrecher', 'Letzter Wellenbrecher', 'heavy', 'Die Meisterfolge bündelt den Durchbruch in einen einzigen Angriff.']
    ],
    current: [
      ['schwerer-kreisel', 'Schwerer Kreisel', 'heavyOrSword', 'Der Kämpfer lässt die Waffe nahe am Körper kreisen.'],
      ['kurzer-nachhall', 'Kurzer Nachhall', 'heavy', 'Ein kurzer Griffstoß hält den Gegner aus dem Stand.'],
      ['gewicht-lesen', 'Gewicht lesen', 'heavyOrSword', 'Der Ritter beobachtet den fremden Schwerpunkt und sammelt den eigenen.'],
      ['felsumgang', 'Felsumgang', 'heavy', 'Ein knapper Hieb deckt den seitlichen Schritt um die Front.'],
      ['umgeleitete-last', 'Umgeleitete Last', 'heavy', 'Der Waffenkopf zwingt die gegnerische Klinge seitwärts.'],
      ['kehrende-schwere', 'Kehrende Schwere', 'heavyOrSword', 'Der auslaufende Hieb führt direkt in die geschlossene Deckung.'],
      ['engster-bogen', 'Engster Bogen', 'heavy', 'Kraft und kurzer Waffenweg treffen denselben Punkt.'],
      ['tanzender-fels', 'Tanzender Fels', 'heavyOrSword', 'Die volle Strömungsfolge hält selbst die schwere Waffe in kontrollierter Bewegung.']
    ],
    depths: [
      ['eiserner-grund', 'Eiserner Grund', 'heavyOrSword', 'Die Waffenlinie bleibt quer vor dem Körper geschlossen.'],
      ['gebremster-rausch', 'Gebremster Rausch', 'heavy', 'Ein knapper Gegenschlag stört die Angriffshaltung des Gegners.'],
      ['ruhe-vor-dem-horn', 'Ruhe vor dem Horn', 'heavyOrSword', 'Der Kämpfer spart den Schlag und setzt Griff und Atem neu.'],
      ['tiefer-anschlag', 'Tiefer Anschlag', 'heavy', 'Die Waffe steigt nur so weit, wie ein kontrollierter Treffer verlangt.'],
      ['halt-der-linie', 'Halt der Linie', 'heavy', 'Ein drängender Hieb nimmt dem Gegner Sicherheit in der eigenen Linie.'],
      ['unbewegter-wall', 'Unbewegter Wall', 'heavyOrSword', 'Der Ritter widmet den ganzen Augenblick der Deckung.'],
      ['felsantwort', 'Felsantwort', 'heavy', 'Ein schwerer Schlag wird vollständig in die Deckung zurückgenommen.'],
      ['grund-unter-dem-sturm', 'Grund unter dem Sturm', 'heavyOrSword', 'Der Abschluss verbindet einen festen Hieb mit ruhigem, geschlossenem Stand.']
    ]
  },
  ceidwyn: {
    breaker: [
      ['kantenbolzen', 'Kantenbolzen', 'crossbow', 'Der Bolzen sucht den Rand der gegnerischen Deckung.'],
      ['schwere-zinke', 'Schwere Zinke', 'trident', 'Die Spitzen werden mit kurzem, festem Griff geführt.'],
      ['unruhiger-pfeil', 'Unruhiger Pfeil', 'shortbow', 'Ein gezielter Treffer stört die Waffenhaltung.'],
      ['saebel-am-bug', 'Säbel am Bug', 'sabre', 'Der Säbel kehrt nach dem Hieb sofort vor den Körper zurück.'],
      ['bolzen-der-brandung', 'Bolzen der Brandung', 'crossbow', 'Der Schütze setzt den ganzen Stand hinter einen sorgfältigen Schuss.'],
      ['dreizackdruck', 'Dreizackdruck', 'trident', 'Die Zinken drängen die fremde Waffenlinie aus dem Takt.'],
      ['sturmsehne', 'Sturmsehne', 'shortbow', 'Der Bogen wird nur für einen einzigen vollkommen vorbereiteten Pfeil gespannt.'],
      ['brecherbolzen', 'Brecherbolzen', 'crossbow', 'Der Meisterschuss bündelt die gesamte Vorbereitung in einen Bolzen.']
    ],
    current: [
      ['relinglauf', 'Relinglauf', 'sabre', 'Der Säbel deckt den Wechsel zwischen zwei engen Passagen.'],
      ['gischtfunke', 'Gischtfunke', 'shortbow', 'Ein leichter Störschuss begleitet die eigene Bewegung.'],
      ['ruhender-abzug', 'Ruhender Abzug', 'crossbow', 'Die geladene Armbrust wartet auf die Bewegung des Gegners.'],
      ['zwischen-den-masten', 'Zwischen den Masten', 'sabre', 'Ein knapper Schnitt begleitet den Schritt in freien Raum.'],
      ['kreisende-zinken', 'Kreisende Zinken', 'trident', 'Der Dreizack schiebt die gegnerische Linie aus dem eigenen Weg.'],
      ['wellenpfeil', 'Wellenpfeil', 'shortbow', 'Der Schuss fällt aus einem bereits gedeckten Standwechsel.'],
      ['silberne-deckspur', 'Silberne Deckspur', 'sabre', 'Mehrere kleine Täuschungen bereiten einen einzigen Säbeltreffer vor.'],
      ['auge-der-stroemung', 'Auge der Strömung', 'crossbow', 'Der Schütze verbindet präzisen Schuss und sichere neue Stellung.']
    ],
    depths: [
      ['dreifache-schwelle', 'Dreifache Schwelle', 'trident', 'Die Spitzen stehen ruhig zwischen Kämpfer und Gegner.'],
      ['bindender-saebel', 'Bindender Säbel', 'sabre', 'Die Klinge drängt die fremde Waffe aus ihrem Rhythmus.'],
      ['ausguckruhe', 'Ausguckruhe', 'shortbow', 'Der Schütze verzichtet auf den Pfeil und bereitet die nächste sichere Linie vor.'],
      ['klarer-bolzen', 'Klarer Bolzen', 'crossbow', 'Ein ruhiger Schuss folgt aus festem Stand.'],
      ['zinken-der-wacht', 'Zinken der Wacht', 'trident', 'Ein kontrollierter Stoß nimmt dem Gegner Raum für seine Waffenführung.'],
      ['saebelwacht', 'Säbelwacht', 'sabre', 'Die Klinge bleibt ausschließlich in schützender Deckung.'],
      ['stiller-fernruf', 'Stiller Fernruf', 'shortbow', 'Ein schwer vorbereiteter Pfeil wird aus geschützter Stellung gelöst.'],
      ['hueter-der-reling', 'Hüter der Reling', 'trident', 'Der Meisterabschluss hält die drei Spitzen vor der eigenen Linie.']
    ]
  },
  rhiddwyr: {
    breaker: [
      ['reitkeil', 'Reitkeil', 'riderPolearm', 'Der Anritt sucht die schmale Seite der gegnerischen Deckung.', { mounted: true }],
      ['wanderhieb', 'Wanderhieb', 'rider', 'Ein fester Hieb funktioniert im Sattel ebenso wie zu Fuß.'],
      ['drangbolzen', 'Drangbolzen', 'crossbow', 'Ein ruhiger Bolzenwurf stört den gegnerischen Stand.'],
      ['schliessender-sattelhieb', 'Schließender Sattelhieb', 'rider', 'Die Reiterwaffe kehrt nach dem Hieb an die geschützte Sattelseite zurück.', { mounted: true }],
      ['felsgratkeil', 'Felsgratkeil', 'riderPolearm', 'Der volle Anritt wird auf einen einzelnen Gegner ausgerichtet.', { mounted: true }],
      ['wegedruck', 'Wegedruck', 'rider', 'Der Waffenhieb trifft gegen die gegnerische Waffenhaltung.'],
      ['kuestenlanze', 'Küstenlanze', 'riderPolearm', 'Ein vorbereiteter Reiterstoß nimmt den Gegner an der Deckungskante.', { mounted: true }],
      ['sturm-ueber-dem-grat', 'Sturm über dem Grat', 'rider', 'Ein einziger schwerer Reiterhieb schließt die Meisterfolge.', { mounted: true }]
    ],
    current: [
      ['sattelwende', 'Sattelwende', 'rider', 'Die Reiterwaffe folgt der geschlossenen Wende des Rosses.', { mounted: true }],
      ['wegfunke', 'Wegfunke', 'crossbow', 'Ein leichter Bolzen dient dem kurzen Störschuss.'],
      ['wanderers-ruhe', 'Wanderers Ruhe', 'rider', 'Der Ritter setzt den Griff neu; der Stand kann beritten oder zu Fuß sein.'],
      ['huegelbogen', 'Hügelbogen', 'riderPolearm', 'Die Spitze deckt die seitliche Bewegung nach dem Anritt.', { mounted: true }],
      ['kehrender-flegel', 'Kehrender Flegel', 'rider', 'Flegel, Hammer, Kolben oder Axt drücken die fremde Waffenlinie seitwärts.'],
      ['abgesessener-flankenschuss', 'Abgesessener Flankenschuss', 'crossbow', 'Der Ritter setzt den Bolzen aus einer gedeckten Stellung zu Fuß.'],
      ['enger-zuegel', 'Enger Zügel', 'rider', 'Zügelhand und Waffe bereiten einen einzigen klaren Sattelhieb vor.', { mounted: true }],
      ['sieben-kuestenwege', 'Sieben Küstenwege', 'riderPolearm', 'Viele vorbereitete Richtungen führen zu genau einem Meisterstoß.', { mounted: true }]
    ],
    depths: [
      ['wacht-am-weg', 'Wacht am Weg', 'rider', 'Der Ritter hält seine Waffenlinie geschlossen.'],
      ['riegel-des-reisenden', 'Riegel des Reisenden', 'rider', 'Ein kurzer Hieb stört die gegnerische Waffenführung.'],
      ['ruhige-sattelseite', 'Ruhige Sattelseite', 'rider', 'Der Ritter bereitet den nächsten Hieb hinter einer geschlossenen Deckung vor.', { mounted: true }],
      ['hueterbolzen', 'Hüterbolzen', 'crossbow', 'Ein einzelner Bolzen wird aus ruhiger Deckung gesetzt.'],
      ['halt-am-grat', 'Halt am Grat', 'riderPolearm', 'Der Schaft kontrolliert die gegnerische Waffenlinie auch zu Fuß.'],
      ['lagerwacht', 'Lagerwacht', 'rider', 'Der Kämpfer hält Deckung, ohne einen Angriff zu beginnen.'],
      ['fester-reitersitz', 'Fester Reitersitz', 'rider', 'Ein schwerer Hieb endet in festem Sitz und enger Deckung.', { mounted: true }],
      ['letzter-hueter-des-weges', 'Letzter Hüter des Weges', 'rider', 'Der Abschluss hält Gegner und eigene Flanke gleichermaßen unter Kontrolle.']
    ]
  },
  derwyn: {
    breaker: [
      ['kolbenkeil', 'Kolbenkeil', 'mace', 'Der Kolben sucht die schmale Kante der Deckung.'],
      ['schwerer-saphir', 'Schwerer Saphir', 'staff', 'Der Stab schlägt mit dem Gewicht hinter beiden Händen.'],
      ['drang-der-zinken', 'Drang der Zinken', 'trident', 'Die Zinken lenken die fremde Waffe aus ihrer Linie.'],
      ['bewahrender-hieb', 'Bewahrender Hieb', 'mace', 'Der Kolben kehrt nach dem Schlag vor den Körper zurück.'],
      ['brechender-schaft', 'Brechender Schaft', 'staff', 'Ein weiter Griff legt große Kraft hinter einen einzelnen Stabschlag.'],
      ['fesselnde-zinken', 'Fesselnde Zinken', 'trident', 'Der Dreizack drückt gegen die gegnerische Waffenhaltung, ohne magische Fesseln zu erzeugen.'],
      ['schwere-des-heiligtums', 'Schwere des Heiligtums', 'mace', 'Der feste Schritt trägt einen schweren physischen Kolbenhieb.'],
      ['flut-des-schaftes', 'Flut des Schaftes', 'staff', 'Die Meisterfolge endet in einem einzigen physischen Stabschlag; die Flut bleibt ein Bewegungsbild.']
    ],
    current: [
      ['saphirkreis', 'Saphirkreis', 'staff', 'Der Schaft beschreibt einen engen Kreis vor dem Körper.'],
      ['kleine-zinke', 'Kleine Zinke', 'trident', 'Ein kurzer Stich prüft die gegnerische Deckung.'],
      ['ruhe-der-hand', 'Ruhe der Hand', 'mace', 'Der Derwyn setzt den Griff neu und lässt den Schlag noch ruhen.'],
      ['ufergang', 'Ufergang', 'staff', 'Der Stabschlag deckt einen kleinen Schritt in freien Raum.'],
      ['umspuelende-spitze', 'Umspülende Spitze', 'trident', 'Die Zinken umgehen die fremde Klinge und stören ihren Stand.'],
      ['kehrender-hueter', 'Kehrender Hüter', 'mace', 'Der Kolben beschreibt eine kurze Bahn zurück in die Deckung.'],
      ['saphirlinie', 'Saphirlinie', 'staff', 'Schritte und kurze Drehungen öffnen eine einzige saubere Schlaglinie.'],
      ['drei-stille-stroeme', 'Drei stille Ströme', 'trident', 'Die drei Spitzen folgen einer gemeinsamen Meisterbewegung; sie sind keine drei Angriffe.']
    ],
    depths: [
      ['schwelle-des-hueters', 'Schwelle des Hüters', 'staff', 'Der Stab sperrt den unmittelbaren Zugang.'],
      ['gebundener-aufprall', 'Gebundener Aufprall', 'mace', 'Der kurze Kolbenhieb stört die gegnerische Waffenlinie.'],
      ['drei-ruhende-spitzen', 'Drei ruhende Spitzen', 'trident', 'Der Dreizack bleibt ruhig, während der eigene Stand neu gefasst wird.'],
      ['grundschlag-des-stabes', 'Grundschlag des Stabes', 'staff', 'Ein gerader Schlag löst sich aus ruhiger Haltung.'],
      ['versperrte-linie', 'Versperrte Linie', 'trident', 'Die Zinken nehmen dem Gegner Raum für seine Antwort.'],
      ['kolbenwacht', 'Kolbenwacht', 'mace', 'Der Derwyn widmet Griff und Körper allein der Deckung.'],
      ['saphirantwort', 'Saphirantwort', 'staff', 'Ein schwerer physischer Stabschlag endet vor der eigenen offenen Flanke.'],
      ['bewahrer-der-schwelle', 'Bewahrer der Schwelle', 'mace', 'Ein einzelner Meisterhieb und eine geschlossene Waffenstellung bewahren den Zugang.']
    ]
  }
};

export function getSirenentanzExpertTechniques(classId) {
  return Object.entries(routes[classId] || {}).flatMap(([path, entries]) => entries.map(([slug, name, weapon, description, options = {}], index) =>
    createSirenentanzTechnique(classId, { ...lessons[path][index], ...options, slug, name, weapon, description, formId: F[path] })
  ));
}
