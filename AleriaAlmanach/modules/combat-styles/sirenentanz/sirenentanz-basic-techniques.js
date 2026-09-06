import { createSirenentanzTechnique } from './sirenentanz-technique-factory.js';
import { SIRENENTANZ_FORM_IDS as F } from './sirenentanz-forms.js';

const entry = (slug, name, level, weapon, cost, description, effect, options = {}) => ({
  slug, name, level, weapon, cost, description, effect,
  formId: level <= 6 ? F.foundation : F.advanced, ...options
});
const specs = {
  morwyr: [
    entry('kurzer-wellenstoss', 'Kurzer Wellenstoß', 1, 'polearm', 'light', 'Die Partisane stößt aus ruhigem Stand nur eine Handbreit vor.', 'Schwacher Bonusangriff: 1W4 statt Waffenwürfeln; feste Boni einmal.'),
    entry('plankenspalter', 'Plankenspalter', 2, 'axe', 'strike', 'Ein kurzer Enteraxthieb nutzt die Lücke zwischen Tauwerk und Reling.', 'Ein regulärer Treffer mit Enteraxt und begrenztem Technikbonus.'),
    entry('leinenwurf', 'Leinenwurf', 3, 'harpoon', 'pressure', 'Der Speer wird geworfen, während die freie Leine kontrolliert ausläuft.', 'Technikschaden; nach Treffer KRF-Rettungswurf gegen 8 + KRF-Modifikator + Kompetenz. Bei Misserfolg bis 2 m heranziehen.', { requirement: 'Intakte, befestigte Leine und freier Zugweg.', manual: 'Leine, Rettungswurf und Zugweg prüfen; kein automatisches Überbordwerfen.' }),
    entry('relingwacht', 'Relingwacht', 4, 'polearm', 'guard', 'Schaft und Körper schließen die schmale Passage.', 'Kein Schaden; +1 RK bis zum Ende des nächsten eigenen Beitrags.', { noDamage: true, guard: 1 }),
    entry('haken-im-tau', 'Haken im Tau', 5, 'axe', 'pressure', 'Der Axtkopf zieht die gegnerische Waffenlinie kurz zur Seite.', 'Technikschaden; ein misslungener KRF-Rettungswurf gibt dem Ziel −1 Angriff bis zum Ende seines nächsten Beitrags.', { penalty: 1 }),
    entry('bugbrecher', 'Bugbrecher', 6, 'polearm', 'committed', 'Ein ganzer Körperschritt trägt die Partisane durch die Deckung.', 'Kräftiger Grundabschluss mit Technikschaden; kein weiterer Treffer.'),
    entry('kehrender-enterhieb', 'Kehrender Enterhieb', 7, 'axe', 'flowing', 'Die Axt folgt einer Drehung hinter die eigene Schulter.', 'Technikschaden; anschließend bis 2 m freie Eigenbewegung innerhalb der verfügbaren Bewegung.', { manual: 'Freien Bewegungsweg und verbleibende Bewegung prüfen.' }),
    entry('harpunenanker', 'Harpunenanker', 8, 'harpoon', 'preparation', 'Die Harpune wird an einer sicheren Stelle angesetzt und der Wurf vorbereitet.', 'Kein Schaden; +1 Angriff bis zum Ende des nächsten eigenen Beitrags. Kein sofortiger Harpunenwurf.', { noDamage: true, aim: true }),
    entry('kehrende-partisane', 'Kehrende Partisane', 7, 'polearm', 'strike', 'Der lange Schaft führt die Spitze ruhig in die neue Linie.', 'Ein regulärer Partisanentreffer mit Aufbau-Technikbonus.'),
    entry('flutwurf', 'Flutwurf', 8, 'harpoon', 'pressure', 'Der Wurf trifft aus tiefem Stand gegen die gegnerische Waffenlinie.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 })
  ],
  rhyfelwyr: [
    entry('kurzer-anschlag', 'Kurzer Anschlag', 1, 'heavyOrSword', 'light', 'Ein knapper Schlag mit verkürztem Griff prüft die Deckung.', 'Schwacher Bonusangriff: 1W4 statt Waffenwürfeln.'),
    entry('felsenschlag', 'Felsenschlag', 2, 'heavy', 'strike', 'Die Waffe trifft mit dem Gewicht des Körpers hinter dem Griff.', 'Ein Treffer mit Waffenwürfeln und begrenztem Technikbonus.'),
    entry('geschlossene-kante', 'Geschlossene Kante', 3, 'heavyOrSword', 'guard', 'Die Waffe bleibt quer vor der offenen Flanke.', 'Kein Schaden; +1 RK bis zum Ende des nächsten eigenen Beitrags.', { noDamage: true, guard: 1 }),
    entry('schildbrecheransatz', 'Schildbrecheransatz', 4, 'heavy', 'pressure', 'Der Schlag drückt gegen den Rand der gegnerischen Deckung.', 'Technikschaden; Zielverteidigung für diesen Angriff −1. Kein Schild wird zerstört.', { defenseModifier: -1 }),
    entry('gegen-den-rausch', 'Gegen den Rausch', 5, 'heavyOrSword', 'pressure', 'Der Rhyfelwyr schlägt in die Überdehnung eines ungestümen Gegners.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    entry('brechender-bug', 'Brechender Bug', 6, 'heavy', 'committed', 'Ein voller Schlag soll eine Stelle der Linie aufbrechen.', 'Kräftiger Grundabschluss; −1 Angriff auf diesen Wurf. Die eigene RK sinkt danach für einen Beitrag um 1.', { attackBonus: -1, exposed: true }),
    entry('umkehr-der-wucht', 'Umkehr der Wucht', 7, 'heavyOrSword', 'flowing', 'Ein auslaufender Schwung wird in eine zweite Richtung umgelenkt.', 'Ein Techniktreffer; keine zweite Attacke. Auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    entry('eisenatem', 'Eisenatem', 8, 'heavy', 'preparation', 'Der Kämpfer setzt den Stand neu und hält die schwere Waffe dicht.', 'Kein Schaden; +1 RK und +1 Angriff bis zum Ende des nächsten eigenen Beitrags.', { noDamage: true, guard: 1, aim: true })
  ],
  ceidwyn: [
    entry('gischtpfeil', 'Gischtpfeil', 1, 'shortbow', 'light', 'Ein kurzer Pfeilflug stört den ersten Schritt des Gegners.', 'Schwacher Bonusangriff mit 1W4; ein Pfeil wird benötigt.'),
    entry('relingbolzen', 'Relingbolzen', 2, 'crossbow', 'strike', 'Die Armbrust wird ruhig an der Deckung vorbeigeführt.', 'Regulärer Technikschuss; geladene Armbrust und ein Bolzen erforderlich.'),
    entry('saebel-der-gasse', 'Säbel der Gasse', 3, 'sabre', 'strike', 'Die Klinge zieht einen engen Bogen durch die Deckpassage.', 'Regulärer Nahkampftreffer mit Säbelwürfeln; kein Fernkampfbonus.'),
    entry('dreizackwacht', 'Dreizackwacht', 4, 'trident', 'pressure', 'Die drei Spitzen halten den Gegner aus der eigenen Linie.', 'Nahkampfschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    entry('windlesen', 'Windlesen', 5, 'shortbow', 'preparation', 'Der Schütze liest Segel, Sprühwasser und Wind vor dem nächsten Schuss.', 'Kein Schaden; +1 Angriff bis zum Ende des nächsten eigenen Beitrags.', { noDamage: true, aim: true }),
    entry('ankerbolzen', 'Ankerbolzen', 6, 'crossbow', 'committed', 'Ein sorgfältig gesetzter Bolzen sucht eine Lücke in der Deckung.', 'Kräftiger Grundschuss; Zielverteidigung für diesen Wurf −1. Kein zusätzlicher Bolzen.', { defenseModifier: -1 }),
    entry('saebelwende', 'Säbelwende', 7, 'sabre', 'flowing', 'Die Klinge deckt den Schritt zurück in eine freie Passage.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    entry('stille-spitzen', 'Stille Spitzen', 8, 'trident', 'preparation', 'Der Dreizack steht zwischen Angreifer und geschütztem Raum.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { noDamage: true, guard: 1, aim: true }),
    entry('kehrender-pfeil', 'Kehrender Pfeil', 7, 'shortbow', 'flowing', 'Der Schütze löst den Pfeil aus einem kleinen Standwechsel.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    entry('flutbolzen', 'Flutbolzen', 8, 'crossbow', 'pressure', 'Die Armbrust wird aus ruhigem Stand an die gegnerische Deckung geführt.', 'Technikschaden; −1 Zielverteidigung nur für diesen Schuss.', { defenseModifier: -1 })
  ],
  rhiddwyr: [
    entry('kurzer-weghieb', 'Kurzer Weghieb', 1, 'rider', 'light', 'Ein kurzer Schlag hält den Gegner vom Sattel oder Stand fern.', 'Schwacher Bonusangriff mit 1W4; auch zu Fuß möglich.'),
    entry('hueter-des-pfads', 'Hüter des Pfads', 2, 'rider', 'strike', 'Der Ritter setzt einen festen Schlag aus eigener Deckung.', 'Regulärer Nahkampftreffer; auch abgesessen nutzbar.'),
    entry('kuestenbolzen', 'Küstenbolzen', 3, 'crossbow', 'strike', 'Ein Bolzen hält einen Gegner auf Abstand, bevor der Nahkampf beginnt.', 'Regulärer Armbrustschuss; Nachladen und Munition bleiben erforderlich.'),
    entry('streifender-anritt', 'Streifender Anritt', 4, 'riderPolearm', 'flowing', 'Der Reiter führt die Spitze seitlich an der gegnerischen Linie vorbei.', 'Ein Techniktreffer aus dem Sattel. Anlauf mindestens 3 m; kein kostenloser Rossangriff.', { mounted: true }),
    entry('sattelwacht', 'Sattelwacht', 5, 'rider', 'guard', 'Die geführte Waffe schließt die offene Sattelseite.', 'Kein Schaden; beritten +1 RK für einen eigenen Beitrag.', { mounted: true, noDamage: true, guard: 1 }),
    entry('felsgratstoss', 'Felsgratstoß', 6, 'riderPolearm', 'committed', 'Der Reiter bündelt den Anlauf in einen einzigen geraden Stoß.', 'Kräftiger Grundabschluss aus dem Sattel; ein Ziel, ein Angriffswurf.', { mounted: true }),
    entry('kehrender-hufschlag', 'Kehrender Hufschlag', 7, 'rider', 'flowing', 'Der Reiter nimmt nach dem Hieb die geschlossene Wende.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag. Der Name gewährt keinen Hufangriff.', { mounted: true, guard: 1 }),
    entry('abgesessene-ruhe', 'Abgesessene Ruhe', 8, 'crossbow', 'preparation', 'Die Armbrust wird zu Fuß ruhig in Anschlag gebracht.', 'Kein Schaden; +1 Angriff für einen eigenen Beitrag; kein Sattel erforderlich.', { noDamage: true, aim: true }),
    entry('kehrender-reiterspiess', 'Kehrender Reiterspieß', 7, 'riderPolearm', 'flowing', 'Der Anritt endet mit dem Schaft vor der eigenen Sattelseite.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { mounted: true, guard: 1 }),
    entry('wanderers-antwort', 'Wanderers Antwort', 8, 'rider', 'strike', 'Ein fester Hieb hält die Linie auch ohne Pferd.', 'Regulärer Techniktreffer mit der Reiterwaffe; zu Fuß oder im Sattel.'),
    entry('bolzen-des-reisenden', 'Bolzen des Reisenden', 8, 'crossbow', 'pressure', 'Ein sorgfältiger Bolzen bedrängt den Gegner aus sicherem Stand.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 })
  ],
  derwyn: [
    entry('leiser-stab', 'Leiser Stab', 1, 'staff', 'light', 'Der Stab tippt mit kurzem Griff gegen die gegnerische Linie.', 'Schwacher physischer Bonusangriff mit 1W4; keine Magie.'),
    entry('erste-spitze', 'Erste Spitze', 2, 'trident', 'strike', 'Der Dreizack wird geradlinig und ohne übergroße Bewegung geführt.', 'Regulärer physischer Techniktreffer mit Dreizackwürfeln.'),
    entry('hueterhieb', 'Hüterhieb', 3, 'mace', 'strike', 'Der Kolben trifft aus einer eng gehaltenen Schutzstellung.', 'Regulärer physischer Techniktreffer mit Streitkolbenwürfeln.'),
    entry('stab-der-schwelle', 'Stab der Schwelle', 4, 'staff', 'guard', 'Der Schaft sperrt den unmittelbaren Zugang.', 'Kein Schaden; +1 RK für einen eigenen Beitrag durch Waffendeckung.', { noDamage: true, guard: 1 }),
    entry('gebundene-spitze', 'Gebundene Spitze', 5, 'trident', 'pressure', 'Die Zinken nehmen die fremde Waffenlinie auf und drücken sie weg.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    entry('last-des-hueters', 'Last des Hüters', 6, 'mace', 'committed', 'Ein fester Schritt trägt das Gewicht hinter den Streitkolben.', 'Kräftiger physischer Grundabschluss. Weder Heilung noch Wasserzusatzschaden.'),
    entry('kehrender-saphir', 'Kehrender Saphir', 7, 'staff', 'flowing', 'Der Stab beschreibt einen Kreis und kehrt vor den Körper zurück.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    entry('ruhende-zinken', 'Ruhende Zinken', 8, 'trident', 'preparation', 'Die Spitze bleibt ruhig, während der nächste Schritt vorbereitet wird.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { noDamage: true, guard: 1, aim: true }),
    entry('kehrender-kolben', 'Kehrender Kolben', 8, 'mace', 'flowing', 'Der Kolbenhieb folgt dem ruhigen Rückführen der Waffe.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    entry('kehrende-zinken', 'Kehrende Zinken', 7, 'trident', 'strike', 'Die Spitzen folgen dem Zurücknehmen des Schafts in eine neue Stoßlinie.', 'Ein regulärer physischer Techniktreffer mit Aufbau-Technikbonus.')
  ],
  milwr: [
    entry('kurzer-wachstoss', 'Kurzer Wachstoß', 1, 'militia', 'light', 'Ein kurzer Stoß hält den unmittelbaren Abstand.', 'Schwacher Bonusangriff mit 1W4.'),
    entry('plankenschritt', 'Plankenschritt', 2, 'militia', 'strike', 'Die Wache schlägt mit festem Schritt aus ihrer Linie.', 'Regulärer Techniktreffer mit der geführten Nahwaffe.'),
    entry('gedeckter-stand', 'Gedeckter Stand', 3, 'militia', 'guard', 'Der Milwr schließt die Lücke zwischen Waffe und Körper.', 'Kein Schaden; +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }),
    entry('schulterdruck', 'Schulterdruck', 4, 'militia', 'pressure', 'Waffe und Schulter drücken die gegnerische Linie fort.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    entry('wacher-griff', 'Wacher Griff', 5, 'militia', 'preparation', 'Der Griff wird verkürzt und das Ziel ruhig beobachtet.', 'Kein Schaden; +1 Angriff für einen eigenen Beitrag.', { noDamage: true, aim: true }),
    entry('letzter-grundhieb', 'Letzter Grundhieb', 6, 'militia', 'committed', 'Die Grundfolge endet in einem entschlossenen, einzelnen Hieb.', 'Kräftiger Grundabschluss ohne Zusatzattacke.'),
    entry('kuestenwall', 'Küstenwall', 6, 'militia', 'preparation', 'Die Wache macht sich schmal hinter ihrer Waffenlinie.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { formId: F.militia, noDamage: true, guard: 1, aim: true }),
    entry('enge-planke', 'Enge Planke', 8, 'militia', 'flowing', 'Der Hieb wird aus einem kleinen Seitenschritt geführt.', 'Technikschaden; danach bis 1 m freie Eigenbewegung.', { formId: F.militia, manual: 'Verfügbare Bewegung und freien Weg prüfen.' }),
    entry('rauer-hafen', 'Rauer Hafen', 10, 'militia', 'pressure', 'Eine schlichte Bindung erschwert dem Gegner seine Antwort.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { formId: F.militia, penalty: 1 }),
    entry('wachtwechsel', 'Wachtwechsel', 12, 'militia', 'preparation', 'Der Milwr übernimmt die Deckung neben einem Kameraden.', 'Kein Schaden; +2 RK für einen eigenen Beitrag. Kein kostenloser Waffenwechsel.', { formId: F.militia, noDamage: true, guard: 2 }),
    entry('stand-der-alten-wache', 'Stand der alten Wache', 15, 'militia', 'finisher', 'Die vollständige Erfahrung der Küstenwache trägt einen letzten festen Hieb.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag. Kostet zusätzlich eine Besondere Aktion.', { formId: F.militia, guard: 1 })
  ]
};

export function getSirenentanzBasicTechniques(classId) {
  return (specs[classId] || []).map(spec => createSirenentanzTechnique(classId, spec));
}
