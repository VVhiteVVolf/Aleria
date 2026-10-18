import { HARBOR_ART, GWREGYSDU_EMBLEM, GWREGYSDU_MOTTO, HARBOR_SYMBOLS, harborPerson } from './harbor-people.mjs';

export const GWREGYSDU_HISTORY = Object.freeze({
  origin: 'Madog Schwarzgurt war ein Cenyri mit aldrimarischen Wurzeln, ein unehelich geborenes Waisenkind aus Gwynthor. Als Laufbursche im Hafen machte er sich durch Verlässlichkeit unentbehrlich. Aus dem Gehilfen wurde ein Facharbeiter, aus dem Vorarbeiter ein Lagerverwalter und schließlich Godwyn Doeths Stellvertreter. Er heiratete dessen Tochter Gwen und erbte mit ihr die Lagerverwaltung, die zunächst vor allem Holzteile aufnahm.',
  expansion: 'Madog erweiterte den Betrieb. Die Ehen seiner Söhne erschlossen Beziehungen zu Jäger- und Bergbaufamilien: Pferde, Pelze, Felle, Metalle und Erze kamen zum Holzgeschäft hinzu. Aus Schwarzgurt wurde im cenyrischen Familiennamen Gwregysdu. Über Generationen wurden Ehen bewusst dort gesucht, wo sie Betriebe, Ressourcen und Erbansprüche verbanden. Der gewachsene Warenverkehr führte das Haus in die Klingende Münze.',
  present: 'Heute besitzt die Familie vier Lagerhäuser im Hafen Gwynthors, innerhalb des großen Handelspostens der Klingenden Münze. Die Gwregysdu sind dort eine von mehreren selbstständigen Parteien. Bleddyn und seine Söhne übernehmen Lagerung, Umschlag und Vertrieb; Verträge mit Höfen und Ressourcenbetrieben des Umlandes bilden die Grundlage. Eine wichtige venalische Verbindung führt zum Haus Falveri, ebenfalls im Umfeld der Klingenden Münze.',
  crime: 'Der nach Bradrhith verheiratete Gruffudd sollte dem Haus den Zugang zur Ceffyl-Zucht verschaffen. Sein über Mittelsmänner veranlasstes Mordkomplott wurde aufgedeckt; Mairwen und ihre Kinder starben, Llyr überlebte. Gruffudd sitzt isoliert bei den Draig, sein Todesurteil ist für weitere Ermittlungen ausgesetzt. Die Familie Gwregysdu steht unter Verdacht; die persönliche Beteiligung einzelner Angehöriger des heutigen Führungskreises ist noch nicht geklärt.',
  underworld: 'Gruffudds Verbindung zu den Schwarzen Zitteraalen führte über Selvor, genannt Schattenauge, der als Zeitungsschreiber in Mwynfaen auftrat. Im Hafen reichen die Kontaktwege des Hauses bis zu Mittlern der Gleißenden Hand. Welche dieser Bekanntschaften dem Handel dienen und welche dem Verschieben unverzeichneter Fracht, wird hinter verschlossenen Türen verhandelt. Über Schmuggel und weitere Unterweltgeschäfte wird gesprochen; einzelne Ladungen, Täter und Vereinbarungen sind bisher nicht offengelegt.',
  succession: 'Bleddyn, Gruffudds väterlicher Onkel, bleibt Herr des Hauses. Seine beiden Söhne Cynan und Tudur tragen die laufende Führung. Gruffudd gehörte als viertes von fünf Kindern zur Nebenlinie seines Vaters Idris und war nicht für das Familienerbe vorgesehen. Die Bradrhith-Nachfolge bleibt nach der jüngsten Autorenfestlegung offen; eine Übernahme des Gestüts durch die Gwregysdu ist nicht erfolgt.'
});

export function buildGwregysduBiography() {
  return {
    crestImage: GWREGYSDU_EMBLEM, biographyTitle: 'Haus Gwregysdu · Vom Schwarzgurt zum Lagerherrn',
    biographyText: `<p>${GWREGYSDU_HISTORY.origin}</p>`, historyTitle: 'Ehen, Waren und Erbansprüche',
    historyText: `<p>${GWREGYSDU_HISTORY.expansion}</p><p>${GWREGYSDU_HISTORY.present}</p>`,
    extraSections: [
      { position: 'afterWorks', title: 'Der Zugriff auf Bradrhith', text: `${GWREGYSDU_HISTORY.crime} ${GWREGYSDU_HISTORY.succession}` },
      { position: 'afterWorks', title: 'Verbindungen im Schatten', text: GWREGYSDU_HISTORY.underworld }
    ],
    worksTitle: 'Wovon das Haus lebt', works: [
      'Lagergebühren für eigene und anvertraute Fracht; Umschlag, Wiegen und die Zusammenstellung größerer Lieferungen.',
      'Vertrieb im Auftrag gegen vereinbarten Anteil; ergänzend auf eigene Rechnung erworbene Waren.',
      'Langjährige Lieferverbindungen zu Holz-, Jagd-, Pferde- und Bergbaubetrieben. Verwandtschaft allein überträgt noch kein Eigentum.'
    ],
    triviaTitle: 'Das Haus', trivia: ['Madogs leibliche Eltern sind nicht überliefert. Seine aldrimarischen Wurzeln begründen keinen erfundenen Clananschluss.', 'Die Ehefrauen des heutigen Hauptzweigs sind Cenyri; ihre Herkunftshäuser bleiben zunächst offen.', 'Die Rote Kompanie stellt vertraglich gebundene Wachleute. Ihre Zugehörigkeit belegt keine Teilnahme an Gruffudds Verbrechen.'],
    quotesTitle: 'Wahlspruch', quotes: [GWREGYSDU_MOTTO], connectionsTitle: 'Handel, Verwandtschaft und gefährliche Wege',
    connections: [
      { name: 'Klingende Münze', image: HARBOR_SYMBOLS.coin, detail: 'Gildenzugehörigkeit und Vertrieb innerhalb ihres großen Gwynthorer Handelspostens. Vier Lagerhäuser gehören den Gwregysdu.' },
      { name: 'Haus Falveri · Venalys', image: HARBOR_SYMBOLS.falveri, detail: 'Wichtiger Handelspartner innerhalb der Klingenden Münze. Die Verbindung besteht zwischen den Häusern; sie setzt keine neue Ehe oder politische Unterordnung voraus.' },
      { name: 'Rote Kompanie', image: HARBOR_SYMBOLS.company, detail: 'Bezahlter Wachdienst an Toren und Lagerhäusern; örtliche Einsatzleitung durch den Optio Pilo.' },
      { name: 'Schwarze Zitteraale', detail: 'Gruffudds belegtes Komplott über den Mittler Selvor, genannt Schattenauge. Ermittlungen gegen Kontaktwege und mögliche Helfer dauern an.' },
      { name: 'Gleißende Hand', image: HARBOR_SYMBOLS.hand, detail: 'Kontakte über Hafenmittler. Reichweite und Inhalt möglicher illegaler Geschäfte bleiben im Verborgenen.' }
    ],
    documentsTitle: 'Familie und Nebenlinie', documents: [
      { title: 'Stammbaum des Hauses Gwregysdu', icon: GWREGYSDU_EMBLEM, text: 'Madog und Gwen, die gewachsenen Linien und Bleddyns heutiger Hauptzweig.', link: '../Stammbäume/Stammbaum.html?family=haus-gwregysdu&mode=view' },
      { title: 'Haus Bradrhith · Gruffudds Linie', icon: HARBOR_SYMBOLS.bradrhith, text: 'Gruffudd, Arianwen und ihre bereits angelegten Kinder mit unveränderten Identitäten.', link: '../Stammbäume/Stammbaum.html?family=haus-bradrhith&mode=view&person=gruffudd-gwregysdu' }
    ]
  };
}

export function buildGwregysduHouseBiography() {
  const biography = buildGwregysduBiography();
  return { schema: 'aleria.house-module', schemaVersion: 1, pageTitle: 'Haus Gwregysdu', housePage: true,
    image: `../AleriaAlmanach/${HARBOR_ART.slice(2)}/scenes/hausgeschichte.png`, imageWidth: 32, imageTall: true,
    description: GWREGYSDU_HISTORY.present,
    stats: [['Stand', 'Bürgerliches Handelshaus'], ['Sitz', 'Gwynthor · Hafen'], ['Gründer', 'Madog Schwarzgurt'], ['Oberhaupt', harborPerson('bleddyn').name], ['Gilde', 'Klingende Münze'], ['Besitz', 'Vier Lagerhäuser im großen Handelsposten']],
    house: biography, quote: GWREGYSDU_MOTTO, quoteBy: 'Wahlspruch des Hauses' };
}
