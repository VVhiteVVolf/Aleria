import { torSceneImage } from './tor-rooms.mjs';

const icons = './assets/krumme-kanne/services';
export const TOR_SERVICES = Object.freeze([
  { id: 'einzelkammer', title: 'Eine eigene Einzelkammer', icon: `${icons}/zimmer.png`, price: '2,5 Kupfertaler',
    scope: 'Eine Kammer · eine Person · eine Nacht', description: 'Ein schlichtes Bett mit sauberem Leinen und Wolldecke, Waschkrug, Handtuch und verschließbarer Tür. Das Haus besitzt zwei solcher Kammern.', terms: 'Frühstück und weitere Mahlzeiten werden nach der Hauskarte gesondert bestellt.' },
  { id: 'doppelkammer', title: 'Eine Doppelkammer für zwei', icon: `${icons}/zimmer.png`, price: '3,5 Kupfertaler',
    scope: 'Die ganze Kammer · bis zwei Personen · eine Nacht', description: 'Eine der vier Doppelkammern mit zwei eigenen Betten, Leinen, Wolldecken und gemeinsamem Waschzeug. Die Kammer wird an eine Reisegemeinschaft vergeben.', terms: 'Der Preis gilt für die ganze Kammer; kein zusätzlicher Bettpreis. Frühstück gesondert.' },
  { id: 'gastpferd', title: 'Ein Gastpferd im Stall', icon: torSceneImage('wagenhof-stall'), price: '1,5 Kupfertaler',
    scope: 'Ein Pferd · eine Nacht samt gewöhnlicher Versorgung', description: 'Ein trockener Platz mit Wasser, Heu, gewöhnlicher Haferportion und frischer Einstreu. Aled schaut nach dem Tier und übernimmt die übliche Stallpflege.', terms: 'Zehn Plätze insgesamt. Sonderfutter, tierheilkundliche Behandlung, Schmiedearbeit und aufwendige Pflege sind nicht enthalten.' },
  { id: 'wagenplatz', title: 'Ein Wagenplatz im Hof', icon: torSceneImage('wagenhof-stall'), price: '40 Pfennig',
    scope: 'Ein gewöhnlicher Wagen · eine Nacht', description: 'Einer von vier Plätzen im geschlossenen Wirtschaftshof. Ein Schuppendach bietet nach Verfügbarkeit einen trockeneren Standort; freie Plätze werden bei der Ankunft zugewiesen.', terms: 'Zugtiere werden gesondert eingestallt. Keine eigene Nachtwache und keine Versicherung der Ladung.' },
  { id: 'gepaeck', title: 'Gepäck unter Verschluss', icon: `${icons}/gepaeck.png`, price: '20 Pfennig',
    scope: 'Eine gewöhnliche Tasche oder kleine Truhe · ein Tag', description: 'Mared vermerkt ein Gepäckstück und lässt es im verschlossenen Hausvorrat verwahren, während der Gast nach Gwynthor geht.', terms: 'Nur nach Platz und Absprache. Keine gefährlichen Güter; besonders wertvolle Ladung nimmt das Haus nicht stillschweigend in Verwahrung.' },
  { id: 'waesche', title: 'Eine kleine Reisewäsche', icon: `${icons}/waesche.png`, price: '50 Pfennig',
    scope: 'Ein Bündel aus Hemd, Unterzeug und Strümpfen', description: 'Ffion nimmt gewöhnliche Leinenwäsche an und nennt bei der Abgabe den Abholtermin. Das Wetter entscheidet mit, wann die Sachen trocken sind.', terms: 'Gewöhnlich ein bis zwei Tage. Keine Eilzusage; besondere Stoffe und Ausbesserungen nach Aufwand.' }
]);

export function buildTorServices() {
  return { schemaVersion: 1, commentThreadKey: 'tor-dienste', pageTitle: 'Herberge, Stall und Reisehilfe', guildServicesPage: true,
    guildServices: { title: 'Für die Nacht und den nächsten Weg', subtitle: 'Mareds Zimmerbuch · Aleds Wagenhof',
      introduction: '<p>Wer vor dem Nordtor übernachtet, kann Kammer, Tier und Wagen getrennt anmelden. Mared kennt den freien Zimmerbestand, Aled die verfügbaren Stall- und Hofplätze. Frühstück und Wegzehrung kommen aus Olwens Hauskarte.</p>',
      services: TOR_SERVICES.map(service => ({ title: service.title, icon: service.icon, description: `<p>${service.description}</p>`, clients: '', scope: service.scope,
        terms: `${service.price} · ${service.terms}` })),
      process: '<p>Bei der Ankunft werden Gäste, Tiere, Wagen und gewünschte Dauer eingetragen. Der vereinbarte Preis gilt für die genannte Einheit; freie Stallplätze und Kammern werden nicht doppelt vergeben. Eine Verlängerung muss vor der nächsten belegten Nacht abgesprochen werden.</p>',
      conditions: '<p>Die Herberge ist täglich geöffnet. Bettzeug, gewöhnliches Waschwasser und Zimmerreinigung sind im Kammerpreis enthalten. Mahlzeiten werden getrennt bestellt; Stallfutter ist dagegen bereits Teil der gewöhnlichen Pferdeversorgung. Das Hoftor wird nachts geschlossen. Wertvolle Handelsladung gehört nach vorheriger Absprache in ein dafür eingerichtetes Lagerhaus.</p>',
      footer: 'Zum Roten Tor · Haus Penrudd · unmittelbar vor Gwynthors Nordtor'
    } };
}
