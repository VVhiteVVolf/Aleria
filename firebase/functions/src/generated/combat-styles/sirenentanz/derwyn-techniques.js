import { createSirenentanzTechnique } from './sirenentanz-technique-factory.js?v=20260909-dragon-parent-v2';
import { DERWYN_FORM_IDS as F } from './sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { DRACHENTANZ_FORM_IDS as D } from '../drachentanz/drachentanz-ids.js?v=20260909-dragon-parent-v2';

const lesson = (slug, name, level, weapon, cost, description, effect, extra = {}) =>
  ({ slug, name, level, weapon, cost, description, effect, ...extra });

const foundation = [
  lesson('leiser-stab', 'Leiser Stab', 1, 'derwynStaff', 'light', 'Ein kurzer Schaftschlag prüft die Entfernung.', 'Ein schwacher physischer Bonusangriff mit 1W6; keine Magie.'),
  lesson('erste-spitze', 'Erste Spitze', 2, 'trident', 'strike', 'Der Dreizack folgt geradlinig dem ersten sicheren Schritt.', 'Ein regulärer Treffer mit Waffenwürfeln und begrenztem Technikbonus.'),
  lesson('erster-morgenstern', 'Erster Morgenstern', 3, 'morningstar', 'strike', 'Der kurze Hieb kehrt eng vor den eigenen Körper zurück.', 'Ein regulärer physischer Treffer; kein pauschales Umgehen von Rüstung.'),
  lesson('stab-der-schwelle', 'Stab der Schwelle', 4, 'derwynStaff', 'guard', 'Der Schaft schließt den Zugang vor dem Körper.', 'Kein Schaden; +1 RK bis zum Ende des nächsten eigenen Beitrags.', { noDamage: true, guard: 1 }),
  lesson('gebundene-spitze', 'Gebundene Spitze', 5, 'trident', 'pressure', 'Die Zinken lenken die gegnerische Waffenlinie zur Seite.', 'Technikschaden; nach misslungenem KRF-Rettungswurf −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
  lesson('erste-klingenwelle', 'Erste Klingenwelle', 6, 'sword', 'flowing', 'Die Klinge folgt einem weichen Schritt aus der gegnerischen Linie.', 'Ein Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 })
];

const cenyrFoundation = [
  lesson('jungdrache-erste-schuppe', 'Erste Schuppe', 1, 'sword', 'light', 'Der kurze Schwertschnitt prüft die Deckung.', 'Ein schwacher Bonusangriff mit 1W6.'),
  lesson('jungdrache-ruhige-klaue', 'Ruhige Klaue', 2, 'sword', 'strike', 'Ein gerader Lehrhieb verbindet sicheren Griff und Stand.', 'Ein regulärer Treffer mit Waffenwürfeln und begrenztem Technikbonus.'),
  lesson('jungdrache-geschlossene-hut', 'Geschlossene Hut', 3, 'sword', 'guard', 'Die Klinge bleibt schräg vor dem Körper.', 'Kein Schaden; +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }),
  lesson('jungdrache-kleine-wende', 'Kleine Wende', 4, 'sword', 'flowing', 'Ein kurzer Hieb endet in einer gedeckten Wendung.', 'Ein Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
  lesson('jungdrache-ruhiger-biss', 'Ruhiger Biss', 5, 'sword', 'pressure', 'Die Klinge sucht die fremde Waffenhaltung.', 'Technikschaden; nach misslungenem KRF-Rettungswurf −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
  lesson('jungdrache-gesammelter-atem', 'Gesammelter Atem', 6, 'sword', 'preparation', 'Der Derwyn ordnet Griff und Atem für den nächsten Schlag.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { noDamage: true, guard: 1, aim: true })
];

const creative = [
  lesson('kehrender-saphir', 'Kehrender Saphir', 7, 'derwynStaff', 'flowing', 'Ein selbst erarbeiteter Griffwechsel führt den Stab zurück in die Deckung.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
  lesson('kehrende-zinken', 'Kehrende Zinken', 7, 'trident', 'strike', 'Die Spitzen finden beim Zurücknehmen des Schafts eine neue Stoßlinie.', 'Ein regulärer Techniktreffer mit Aufbau-Technikbonus.'),
  lesson('freie-klingenlinie', 'Freie Klingenlinie', 8, 'sword', 'preparation', 'Der Schüler verbindet die eigene Hut mit einer beobachteten Öffnung.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { noDamage: true, guard: 1, aim: true }),
  lesson('freie-morgensternwende', 'Freie Morgensternwende', 8, 'morningstar', 'flowing', 'Der Hieb verbindet einen eigenen Standwechsel mit enger Rückführung.', 'Ein Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 })
];

// Every lesson resolves through the existing damage, cost, timed-condition and
// saving-throw contracts. Opening a path never creates an uncosted counterattack.
const paths = {
  [F.flowing]: [
    lesson('wartende-klinge', 'Wartende Klinge', 9, 'sword', 'guard', 'Der Derwyn wartet hinter einer ruhigen, geschlossenen Hut.', 'Kein Schaden; +1 RK für einen eigenen Beitrag. Kein automatischer Gegenangriff.', { noDamage: true, guard: 1 }),
    lesson('fliessende-antwort', 'Fließende Antwort', 10, 'sword', 'strike', 'Der Schwertstoß folgt erst, wenn die fremde Klinge die Linie freigibt.', 'Ein regulärer Techniktreffer; die eigene Aktion wird bezahlt.'),
    lesson('stille-schwertbindung', 'Stille Schwertbindung', 11, 'sword', 'pressure', 'Die Klinge nimmt die gegnerische Führung weich auf und lenkt sie fort.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    lesson('klingenrueckfluss', 'Klingenrückfluss', 12, 'sword', 'flowing', 'Der Hieb kehrt unmittelbar vor die eigene Flanke zurück.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('gespiegelte-linie', 'Gespiegelte Linie', 13, 'sword', 'specialGuard', 'Eine vorbereitete Umlenkung mündet in einen einzigen Schwerttreffer.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag. Kostet Reaktion und Besondere Aktion.', { penalty: 1 }),
    lesson('unbewegte-schwerthut', 'Unbewegte Schwerthut', 15, 'sword', 'preparation', 'Die Schwertspitze bleibt ruhig; der Derwyn verzichtet auf den Angriff.', 'Kein Schaden; +2 RK für einen eigenen Beitrag. Gleichartige Deckung wird nicht addiert.', { noDamage: true, guard: 2 }),
    lesson('antwort-des-wyrms', 'Antwort des Wyrms', 17, 'sword', 'finisher', 'Eine geduldige Vorbereitung endet in einer kraftvollen, gedeckten Antwort.', 'Ein starker Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('meister-des-rueckflusses', 'Meister des Rückflusses', 20, 'sword', 'master', 'Die ganze Folge aus Warten, Umlenken und Antwort endet in einem Hieb.', 'Ein Meistertreffer; auf Treffer +2 RK. KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { guard: 2, penalty: 1 })
  ],
  [F.breaking]: [
    lesson('drang-der-zinken', 'Drang der Zinken', 9, 'trident', 'pressure', 'Die drei Spitzen drängen gegen die fremde Waffenlinie.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    lesson('brandender-stich', 'Brandender Stich', 10, 'trident', 'strike', 'Ein gesetzter Stoß folgt dem Wechsel von Nähe und Abstand.', 'Ein regulärer Techniktreffer mit Dreizackwürfeln.'),
    lesson('ruhende-zinken', 'Ruhende Zinken', 11, 'trident', 'preparation', 'Die Spitzen stehen ruhig vor der nächsten Stoßlinie.', 'Kein Schaden; +1 RK und +1 Angriff für einen eigenen Beitrag.', { noDamage: true, guard: 1, aim: true }),
    lesson('umspuelende-spitze', 'Umspülende Spitze', 13, 'trident', 'flowing', 'Ein kurzer Stoß kehrt hinter die schützenden Zinken zurück.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('brandungskeil', 'Brandungskeil', 13, 'trident', 'specialStrike', 'Die mittlere Spitze sucht eine schmale Lücke in der Deckung.', 'Technikschaden gegen −1 Zielverteidigung nur für diesen Wurf.', { defenseModifier: -1 }),
    lesson('fesselnde-zinken', 'Fesselnde Zinken', 15, 'trident', 'pressure', 'Der feste Schaft bindet die gegnerische Führung ohne magische Fesseln.', 'Technikschaden; KRF-Rettungswurf oder −2 Angriff für einen eigenen Beitrag.', { penalty: 2 }),
    lesson('brandende-sperrlinie', 'Brandende Sperrlinie', 17, 'trident', 'finisher', 'Ein entschlossener Stoß schließt den Raum hinter den Zinken.', 'Ein starker Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('drei-stille-stroeme', 'Drei stille Ströme', 20, 'trident', 'master', 'Die drei Spitzen folgen einer gemeinsamen Meisterbewegung.', 'Ein Meistertreffer mit +1 Angriff; auf Treffer +2 RK für einen eigenen Beitrag. Genau ein Angriffswurf.', { attackBonus: 1, guard: 2 })
  ],
  [F.rising]: [
    lesson('saphirkreis', 'Saphirkreis', 9, 'derwynStaff', 'flowing', 'Der Stab beschreibt einen engen Kreis vor dem Körper.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('schwerer-saphir', 'Schwerer Saphir', 10, 'derwynStaff', 'strike', 'Der aufsteigende Schaftschlag nutzt beide Hände und festen Stand.', 'Ein regulärer physischer Techniktreffer.'),
    lesson('schwelle-des-hueters', 'Schwelle des Hüters', 11, 'derwynStaff', 'guard', 'Der lange Schaft versperrt den unmittelbaren Zugang.', 'Kein Schaden; +1 RK für einen eigenen Beitrag.', { noDamage: true, guard: 1 }),
    lesson('grundschlag-des-stabes', 'Grundschlag des Stabes', 12, 'derwynStaff', 'pressure', 'Der kurze Griffwechsel stört die gegnerische Waffenführung.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    lesson('brechender-schaft', 'Brechender Schaft', 13, 'derwynStaff', 'specialStrike', 'Der weite Griff trägt einen einzelnen, aufsteigenden Schlag.', 'Technikschaden gegen −1 Zielverteidigung nur für diesen Wurf.', { defenseModifier: -1 }),
    lesson('steigende-stabwacht', 'Steigende Stabwacht', 15, 'derwynStaff', 'preparation', 'Der Stab richtet sich auf und hält die bedrohte Linie geschlossen.', 'Kein Schaden; +2 RK für einen eigenen Beitrag.', { noDamage: true, guard: 2 }),
    lesson('saphirantwort', 'Saphirantwort', 17, 'derwynStaff', 'finisher', 'Der feste Stabstoß endet vor der offenen Flanke.', 'Ein starker physischer Techniktreffer; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('flut-des-schaftes', 'Flut des Schaftes', 20, 'derwynStaff', 'master', 'Die Meisterfolge bündelt Griffwechsel und aufsteigende Linie in einem Schlag.', 'Ein Meistertreffer mit +1 Angriff; auf Treffer +2 RK für einen eigenen Beitrag. Keine zusätzliche Zauberwirkung.', { attackBonus: 1, guard: 2 })
  ],
  [F.whipping]: [
    lesson('peitschender-auftakt', 'Peitschender Auftakt', 9, 'morningstar', 'pressure', 'Ein beschleunigter Hieb sucht die äußere Deckungskante.', 'Technikschaden; −1 eigener Angriff und −1 Zielverteidigung nur für diesen Wurf.', { attackBonus: -1, defenseModifier: -1 }),
    lesson('kurzer-sternhieb', 'Kurzer Sternhieb', 10, 'morningstar', 'strike', 'Der Waffenkopf folgt einer kurzen, kontrollierten Bahn.', 'Ein regulärer physischer Techniktreffer.'),
    lesson('stern-gegen-stahl', 'Stern gegen Stahl', 11, 'morningstar', 'pressure', 'Der Hieb bedrängt Griff und Haltung des Gegners.', 'Technikschaden; KRF-Rettungswurf oder −1 Angriff für einen eigenen Beitrag.', { penalty: 1 }),
    lesson('geschlossene-sternwende', 'Geschlossene Sternwende', 12, 'morningstar', 'flowing', 'Der Waffenkopf wird nach dem Treffer eng zurückgeführt.', 'Technikschaden; auf Treffer +1 RK für einen eigenen Beitrag.', { guard: 1 }),
    lesson('offener-sternbogen', 'Offener Sternbogen', 13, 'morningstar', 'specialStrike', 'Der volle Schwung öffnet für einen Augenblick auch die eigene Deckung.', 'Technikschaden gegen −1 Zielverteidigung; danach eigene RK −1 für einen Beitrag.', { defenseModifier: -1, exposed: true }),
    lesson('drang-des-morgensterns', 'Drang des Morgensterns', 15, 'morningstar', 'pressure', 'Ein harter, enger Hieb bringt die fremde Waffenführung aus dem Takt.', 'Technikschaden; KRF-Rettungswurf oder −2 Angriff für einen eigenen Beitrag.', { penalty: 2 }),
    lesson('peitschenruf', 'Peitschenruf', 17, 'morningstar', 'finisher', 'Ein sorgfältig vorbereiteter Schwung trifft die Deckungskante.', 'Ein starker Techniktreffer; −1 eigener Angriff und −1 Zielverteidigung nur für diesen Wurf.', { attackBonus: -1, defenseModifier: -1 }),
    lesson('meister-des-sternbogens', 'Meister des Sternbogens', 20, 'morningstar', 'master', 'Die volle Folge beschleunigt den Morgenstern in einen einzigen Abschluss.', 'Ein Meistertreffer; −1 eigener Angriff, −1 Zielverteidigung und danach eigene RK −1 für einen Beitrag.', { attackBonus: -1, defenseModifier: -1, exposed: true })
  ]
};

const create = (spec, formId) => createSirenentanzTechnique('derwyn', { ...spec, formId });
export function getDerwynBasicTechniques() {
  return [...foundation.map(spec => create(spec, F.foundation)), ...creative.map(spec => create(spec, F.creative))];
}
export function getDerwynCenyrFoundationTechniques() { return cenyrFoundation.map(spec => create(spec, D.jungdrache)); }
export function getDerwynExpertTechniques() {
  return Object.entries(paths).flatMap(([formId, specs]) => specs.map(spec => create(spec, formId)));
}
