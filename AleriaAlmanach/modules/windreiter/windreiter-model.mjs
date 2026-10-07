import { buildWindreiterHierarchies, buildWindreiterBannerHierarchy } from './windreiter-hierarchy.mjs';

export const WINDREITER_ART = './public/assets/windreiter';
export const WINDREITER_EMBLEM = '../Fraktionen/assets/emblems/gilden/windreiter.webp';
const p = text => `<p>${text}</p>`;
const art = name => `${WINDREITER_ART}/${name}.png`;

export function buildWindreiter(source) {
  const copy = (start, end = start + 1) => source.blocks.slice(start, end).map(block => block.html).join('\n');
  const story = (pageTitle, description, image = '') => ({ pageTitle, description, ...(image ? { image: art(image), imageFit: 'contain', imagePosition: 'center', imageWidth: 38, imageTall: true } : {}), commentSequence: [] });
  const guild = { pageTitle: 'Gildenbio · Herkunft, Wesen & Beziehungen', guildPage: true, image: art('windreiter-krieger'), imageFit: 'contain',
    stats: [['Name', 'Die Windreiter'], ['Art', 'Überregionale Krieger- und Söldnergilde'], ['Ursprung', 'Fürstentum Aislearneach'], ['Wirkungsgebiet', 'Nahezu alle bekannten Kontinente'], ['Führung', 'Gildenoberhaupt und fünf Kommandanten'], ['Mitgliederstärke', 'Nicht beziffert'], ['Leitwerte', 'Ehre · Pflichtgefühl · Loyalität']],
    guild: { crestImage: WINDREITER_EMBLEM, portraitFormat: 'portrait', sideWidth: 100,
      biographyTitle: 'Schutz, der erreichbar bleiben soll', biographyText: copy(0) + p('Die Windreiter verbinden das gemeinsame Gildenzeichen mit der Eigenständigkeit ihrer Banner. Ein Dorfposten, eine große Stadtwache und ein wandernder Verband können sehr verschieden aussehen und dennoch derselben Gilde angehören.'),
      abilitiesTitle: 'Was die Gilde prägt', abilities: [
        { title: 'Schutz als Beruf', detail: 'Geleit, Wache und Beistand für Bürger, Handelshäuser und Adel.', icon: art('service-geleit') },
        { title: 'Verzweigte Gemeinschaft', detail: 'Feste Gildenhäuser, territoriale Banner und wandernde Banden.', icon: WINDREITER_EMBLEM },
        { title: 'Ehre & Erwerb', detail: 'Alte Schutzideale stehen neben den Interessen zahlender Auftraggeber.', icon: art('service-vertrag') }
      ], historyTitle: 'Die Wurzeln in Aislearneach', historyText: p('Die Fianna gaben ein Vorbild von Mut und Rechtschaffenheit, konnten aber nicht jeden Schutzbedarf erfüllen. Die Windreiter entstanden aus der Nachfrage nach bezahlbarem, praktischem Beistand. Ein Gründungsjahr und ein namentlicher Gründer sind nicht überliefert.'),
      worksTitle: 'Aufgaben', works: ['Karawanen und Reisende begleiten', 'Handelsrouten und Besitztümer bewachen', 'Personenschutz und Kampfunterstützung', 'Kleinere Aufträge über Schwarze Bretter vermitteln'],
      connectionsTitle: 'Beziehungen', connections: [
        { name: 'Markt der Fortuna', detail: 'Als wichtiger Auftraggeber für Handels- und Geleitschutz genannt.', image: '../Fraktionen/assets/emblems/gilden/markt-der-fortuna.webp' },
        { name: 'Ruinenpforte', detail: 'Archäologen-Gilde und genannter Auftraggeber.', image: '../Fraktionen/assets/emblems/gilden/ruinenpforte.webp' },
        { name: 'Fianna', detail: 'Vorbild der frühen Ideale; keine daraus abgeleitete Unterstellung.' },
        { name: 'Blutbund', detail: 'Vergleichsgilde mit stärkerem Schwerpunkt auf Kopfgeld- und Gesetzlosenjagd; keine belegte Feindschaft.' }
      ], contractsTitle: 'Formen der Anstellung', contracts: [
        { title: 'Vertraglicher Dienst', icon: art('service-vertrag'), text: 'Längerfristige Bindung einzelner Söldner oder eines Teams.' },
        { title: 'Freie Aufträge', icon: art('service-brett'), text: 'Örtliche Anfragen werden am Schwarzen Brett vermittelt.' }
      ], documentsTitle: 'Gemeinsame Einrichtungen', documents: [
        { title: 'Gildenhäuser & Vorposten', icon: WINDREITER_EMBLEM, text: 'Verwaltung, Vermittlung und Anlaufstelle der Mitglieder.' }
      ], triviaTitle: 'Gilde und einzelne Mitglieder', trivia: ['Nicht jedes Mitglied gehört einem festen Banner an.', 'Der Name Windreiter bedeutet keine allgemeine Reitpflicht.', 'Personen, Patrongötter und Gesamtstärke bleiben ohne unbelegte Ergänzungen.'],
      footer: 'Eine weit verzweigte Gilde zwischen Schutzversprechen, Kameradschaft und Erwerb.' }
  };
  const service = { pageTitle: 'Aufgabenbereich & Service', guildServicesPage: true, commentSequence: [], guildServices: {
    title: 'Dienste der Windreiter', introduction: copy(8), services: [
      { title: 'Vertragsgebundene Söldner', icon: art('service-vertrag'), description: copy(9), clients: 'Gilden, Handelshäuser und vermögende Privatpersonen', scope: 'Einzelne Kräfte oder mehrere Söldner; häufig längerfristig', terms: 'Aufgabe, Laufzeit, Sold und Ablösung nach Vereinbarung' },
      { title: 'Freiberufliche Söldner', icon: art('service-freie'), description: copy(10), clients: 'Wechselnde örtliche Auftraggeber', scope: 'Einzelaufträge nach Eignung und Verfügbarkeit', terms: 'Die Annahme erfolgt durch den freien Söldner; bestehende Bindungen bleiben maßgeblich' },
      { title: 'Das Schwarze Brett', icon: art('service-brett'), description: copy(11), clients: 'Bürger, Händler und Reisende', scope: 'Kleinere Anliegen, Begleitung und örtliche Hilfe', terms: 'Ein Aushang vermittelt ein Anliegen; die Übernahme muss vereinbart werden' },
      { title: 'Begleitschutz & Sicherheit', icon: art('service-geleit'), description: copy(12), clients: 'Karawanenführer, Händler und Schiffskapitäne', scope: 'Passend zusammengestellte Teams für Weg und Schutzbedarf', terms: 'Route, Dauer, Gefahren und anvertraute Personen oder Waren klären' },
      { title: 'Scharmützel & Kampfunterstützung', icon: art('service-kampf'), description: copy(13), clients: 'Auftraggeber in bewaffneten Konflikten', scope: 'Verstärkung in Scharmützeln und Schlachten', terms: 'Einsatz, Führung, Versorgung und Vergütung vorab vereinbaren' }
    ], process: p('Ein Anliegen erreicht das Gildenhaus, einen freien Söldner oder einen Bannerführer. Danach werden geeignete Kräfte, Umfang und Bedingungen vereinbart. Die zuständige Führung teilt gebundene Mannschaften ein; die Verwaltung hält Verpflichtungen und Abrechnung fest.'),
    conditions: copy(14) + p('Feste Tarife sind nicht überliefert. Die Formulierungen zu Ablauf und Vertragsumfang erläutern die beschriebenen Dienste und begründen keine allgemeine Preisordnung. Kopfgeldaufträge gehören nur selten zum Angebot.'),
    footer: 'Der Auftrag bestimmt den Dienst. Die Zugehörigkeit bestimmt die Verantwortung.'
  } };
  const pages = [
    story('Ein Schild an den Wegen Alerias', copy(0, 3), 'windreiter-geleit'), guild,
    story('Hintergrund · Aus dem Bedarf der einfachen Leute', copy(3, 8)), service,
    ...buildWindreiterHierarchies(source),
    story('Standorte · Kerntrupp, Wache & wanderndes Banner', copy(15, 29), 'windreiter-gildenhaus'),
    buildWindreiterBannerHierarchy(source),
    story('Ein regulärer Windreiter', p('Die Darstellung zeigt einen gewöhnlichen Angehörigen der Gilde mit vollständig geschlossenem Helm. Türkis und Elfenbein sowie das aufsteigende Pferd machen seine Zugehörigkeit sichtbar. Schwert, Schild, Kettenzeug und Platten dienen dem Bild eines ausgerüsteten Schutzsöldners.') + p('Es ist kein benannter Held und kein Kommandant. Das Bild legt weder eine einheitliche Ausrüstung aller Banner noch neue Kampfwerte fest. Ein Mitglied kann einer festen Wache angehören, mit seiner Bande reisen oder im Rahmen seiner Verpflichtungen freie Dienste annehmen.') + p('Im Alltag bewährt sich ein Windreiter durch Aufmerksamkeit, Absprachen und Verlässlichkeit: den Weg prüfen, bei der Karawane bleiben, den nächsten Posten einweisen. Das gemeinsame Wappen soll auch dann etwas bedeuten, wenn gerade niemand ein Lied über den Dienst schreiben wird.'), 'windreiter-krieger'),
    story('Zwischen Ehre, Pflicht und Sold', p('Die frühen Windreiter entstanden aus einem alltäglichen Bedürfnis: Schutz dort, wo die wenigen großen Helden nicht sein konnten. Daraus erwuchs eine Gilde, deren Ansehen weniger von einem einzigen Sieg als von vielen eingehaltenen Zusagen lebt.') + p('Eine wachsende Organisation trägt dieses Versprechen nicht von selbst weiter. Zwischen einem einflussreichen Handelshaus und einer unvermögenden Reisenden besteht ein Unterschied, den auch das schönste Gildenwort nicht beseitigt. Die Führung muss entscheiden, welche Dienste ihre Kräfte binden und welche Verpflichtungen Vorrang haben.') + p('Darum gehören Kasse und Kodex, Banner und Gildenhaus zusammen. Verwaltung macht Zusagen nachprüfbar; erfahrene Krieger geben Gewohnheiten weiter; die Mitglieder tragen den Ruf der Gilde an jeden neuen Ort. Nicht jeder wird den alten Idealen gerecht. Die Spannung zwischen Erwerb und Schutz bleibt Teil ihrer Geschichte.'), 'windreiter-gildenhaus')
  ];
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  return { id: 'windreiter', title: 'Die Windreiter', subtitle: 'Eine Gilde · viele Banner · ein Schutzversprechen', type: 'Söldnergilde',
    category: 'Söldner · Windreiter', symbol: WINDREITER_EMBLEM, image: WINDREITER_EMBLEM, icon: '✦', stamp: 'EHRE · PFLICHT · LOYALITÄT',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: pages.map((page, index) => ({ ...page, pageTitle: `${romans[index]}. — ${page.pageTitle}` })) };
}
