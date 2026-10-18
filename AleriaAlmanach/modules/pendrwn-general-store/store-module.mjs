import { STORE_ART, PENDRWN_EMBLEM, DRAIG_EMBLEM, FORTUNA_EMBLEM, STORE_PEOPLE, storePerson } from './store-people.mjs';
import { STORE_ROOMS } from './store-rooms.mjs';
import { buildStoreHierarchy } from './store-hierarchy.mjs';
import { buildStoreStandardCatalog, buildStoreSpecialCatalog } from './store-catalog.mjs';
import { FORTUNA_SECTION } from '../markt-der-fortuna-gwynthor/fortuna-section.mjs';
export const STORE_ID = 'gwynthor-zum-vollen-korb';
export const STORE_SECTION = FORTUNA_SECTION;
const scene = id => ({ image: `${STORE_ART}/scenes/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const trait = (name, title, detail) => ({ title, icon: `../IconOrdner/Big Traits/Trait_${name}.png`, detail });

export function buildPendrwnStore() {
  const owner = storePerson('cadwgan');
  return { id: STORE_ID, title: 'Zum Vollen Korb', subtitle: 'Gemischtwaren für Haus und Weg · Haus Pendrwn',
    type: 'Gemischtwarenhandel', category: 'Gwynthor · Werkzeuge und Sonstiges', icon: '♧', symbol: PENDRWN_EMBLEM,
    image: `${STORE_ART}/scenes/aussenansicht.png`, previewImage: `${STORE_ART}/scenes/aussenansicht.png`, stamp: 'ZUM VOLLEN KORB · HAUS PENDRWN',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true,
    sessionCast: STORE_PEOPLE.map(p => p.worldPersonId), pages: [
      { schemaVersion: 1, commentThreadKey: 'voller-korb-haus', pageTitle: 'Zum Vollen Korb', ...scene('aussenansicht'),
        description: '<p>Zwischen den Wegen des Marktes und den Wohnstraßen Gwynthors hängt ein gefüllter Weidenkorb über einer schmalen Ladentür. Im <strong>Vollen Korb</strong> kauft man, was zu Hause fehlt oder auf dem Weg gebraucht wird: Leinen, Lampenöl, Nähzeug, Geschirr, eine neue Bettrolle. Der Raum ist klein, die Regale sind gut gefüllt und hinter dem Tresen wird erst gefragt, wofür ein Gegenstand taugen soll.</p>' +
          '<p><strong>Cadwgan Pendrwn und sein Vater Idwal</strong> führen den Handel gemeinsam. Der Markt der Fortuna liefert ihren regelmäßigen Nachschub. Cadwgan wählt zusätzlich einige nützliche Besonderheiten aus, die zwischen gewöhnlichen Grundwaren leicht übersehen würden. Größere Wünsche werden bestellt und mit der nächsten Fracht mitgebracht.</p>' +
          '<p>Die Pendrwn sind ein bürgerliches Dienerhaus des Hauses Draig. Ihr Geschäft lebt von verlässlichen Lieferungen, sorgfältigen Rechnungen und Kunden, die auch wegen einer einzigen Nadel wiederkommen.</p>',
        stats: [['Ort', 'Gwynthor · nahe den Marktwegen'], ['Inhaber', 'Cadwgan und Idwal Pendrwn'], ['Haus', 'Pendrwn · im Dienst des Hauses Draig'], ['Lieferant', 'Markt der Fortuna'], ['Grundsortiment', '47 Waren · Werkzeuge & Sonstiges'], ['Eigene Auswahl', 'Zehn zusätzliche Alltagswaren']] },
      { schemaVersion: 1, commentThreadKey: 'voller-korb-cadwgan', pageTitle: 'Cadwgan Pendrwn · Ein guter Vorrat',
        biographyPage: true, image: owner.portrait, imageWidth: 34, imageTall: true, imageFit: 'contain',
        stats: [['Geboren', '1684 · 56 Jahre'], ['Stellung', 'Ältester Sohn Idwals und Bronwens'], ['Gemahlin', 'Mabli · seit 1708'], ['Kinder', 'Rhun und Tesni'], ['Mitinhaber', 'Idwal Pendrwn · 79 Jahre']],
        biography: { crestImage: PENDRWN_EMBLEM, biographyTitle: 'Cadwgan Pendrwn',
          biographyText: '<p>Cadwgan hat die Geduld eines Mannes, der schon viele Menschen vor einem leeren Regal hat stehen sehen. Er hört zu, stellt eine genaue Rückfrage und holt meist etwas Schlichteres hervor, als der Kunde zuerst im Sinn hatte. Er verkauft gern, aber ungern zweimal denselben ungeeigneten Gegenstand. Mengen prüft er selbst; an eine Zusage erinnert er sich lange.</p>',
          historyTitle: 'Vater und ältester Sohn', historyText: '<p>Als ältester Bruder Meilyrs und Gweniths führt Cadwgan einen eigenen Zweig der Familie. Den Laden verantwortet er gemeinsam mit Idwal. Der Vater pflegt die gewachsenen Handelskontakte und prüft größere Rechnungen, der Sohn bestellt die Fracht und führt den Verkauf. Mabli, Rhun und Tesni haben ihre festen Aufgaben im Haus.</p>',
          abilitiesTitle: 'Seine Art', abilities: [trait('diligent', 'Gründlich', 'Prüft Mengen, Nähte und Verschlüsse, bevor eine Lieferung ins Regal gelangt.'),
            trait('patient', 'Geduldig', 'Hört auch kleinen Anliegen zu und erklärt Unterschiede ohne Eile.'),
            trait('honest', 'Geradeheraus', 'Sagt offen, wenn eine billige Ware für den gewünschten Zweck nicht genügt.')],
          worksTitle: 'Was ihn beschäftigt', works: ['Der tägliche Verkauf und die Auswahl zehn zusätzlicher, nützlicher Alltagswaren.', 'Bestellungen und regelmäßige Sammellieferungen unmittelbar über den Markt der Fortuna.'],
          triviaTitle: 'Daheim', trivia: ['Cadwgan und Mabli sind seit 1708 verheiratet. Rhun und Tesni sind unverheiratet und arbeiten im Laden.', 'Idwal bleibt Mitinhaber und Oberhaupt des Hauses; Bronwen gehört zur Familie, trägt aber keinen festen Dienstposten.'],
          quotesTitle: 'Über dem Bestellbuch', quotes: ['Für Haus und Weg.'], connectionsTitle: 'Haus und Handel', connections: [
            { name: 'Idwal Pendrwn', detail: 'Vater und Mitinhaber · Lieferanten und Rechnungsbücher', image: storePerson('idwal').portrait },
            { name: 'Markt der Fortuna', detail: 'Unmittelbarer Lieferpartner für die Grundwaren und Cadwgans zusätzliche Auswahl; Nachbestellungen reisen mit den regelmäßigen Sammelfrachten.', image: FORTUNA_EMBLEM },
            { name: 'Haus Draig', detail: 'Die Pendrwn stehen als bürgerliches Dienerhaus im Dienst des Grafenhauses. Cadwgans Zweig betreibt den Gemischtwarenhandel in Gwynthor.', image: DRAIG_EMBLEM }],
          documentsTitle: 'Die Pendrwn', documents: [{ title: 'Stammbaum des Hauses Pendrwn', icon: PENDRWN_EMBLEM,
            text: 'Unbekannte Gründer, Überlieferungssprung und Idwals Familie mit Cadwgans ältestem Zweig.', link: '../Stammbäume/Stammbaum.html?family=haus-pendrwn&mode=view' }] } },
      { schemaVersion: 1, commentThreadKey: 'voller-korb-haende', pageTitle: 'Verkauf, Logistik und Haus', hierarchyPage: true, hierarchy: buildStoreHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'voller-korb-standard', pageTitle: 'Werkzeuge & Sonstiges', tradeCatalogPage: true, tradeCatalog: buildStoreStandardCatalog() },
      { schemaVersion: 1, commentThreadKey: 'voller-korb-eigenes', pageTitle: 'Eigenes Sortiment', tradeCatalogPage: true, tradeCatalog: buildStoreSpecialCatalog() },
      ...STORE_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `voller-korb-${room.id}`, pageTitle: room.title,
        ...scene(room.id), sessionPage: true, sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Eine Begegnung im Vollen Korb.',
        sessionEmptyTitle: 'Die Ladenglocke schweigt noch', sessionEmptyText: 'Ein Einkauf, eine Lieferung oder ein Gespräch hinter dem Tresen kann hier beginnen.',
        sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
