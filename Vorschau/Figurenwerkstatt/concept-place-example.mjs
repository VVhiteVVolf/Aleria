import { CONCEPT_EXAMPLES, exampleArt as art } from './concept-example-catalog.mjs';
import { createExampleDraft } from './concept-example-draft.mjs';

const { character, house, faction, item } = CONCEPT_EXAMPLES;

export function examplePlace(now) {
  return createExampleDraft('place', {
    kind: 'Brückenweiler mit Diensthof und Fähre',
    region: 'Cenyr, Grafschaft Celtigerns Wacht',
    population: 'Rund sechzig Einwohner beiderseits des Flusses',
    authority: 'Haus Celynbarth verwaltet Torhof und Lager. Der Bund der Uferlaternen organisiert den Warndienst.',
    pitch: 'Gelynwacht steht an einer niedrigen Steinbrücke zwischen Waldhügeln und Uferhöfen. Reisende erfahren am Torhof, ob sie den Übergang, die Fähre oder den längeren Höhenweg nehmen sollen. Eine doppelte Quittung stellt die Vereinbarungen der beiden Ufer auf die Probe.',
    location: 'Der Fluss kommt aus einer engen Waldschlucht und bildet unterhalb der Brücke eine ruhigere Bucht. Am Ostufer liegt der ummauerte Torhof. Gegenüber führen ein Fußweg zum Unteren Fährhaus und ein trockenerer Höhenweg nach Nordwesten.',
    map: art('gelynwacht-karte'),
    look: 'Niedrige Fachwerkhäuser stehen um einen quadratischen Schieferturm. Unter seinem Vordach liegen trockene Seile und stapelbare Kisten. Wer von den Höfen kommt, hört zuerst die Fähre am Anleger anstoßen.',
    customs: 'Vor dem ersten Herbstregen gehen die Uferleute gemeinsam die Pegelmarken ab. Die letzten Meldungen hängen unter dem Tordach. Nach der Abendfahrt sammeln sich Fährleute und Fuhrleute im Lagerhof zum Essen.',
    community: 'Zum Weiler gehören Hausdienst, zwei Fährfamilien, Holzarbeiter, Lagerleute und die umliegenden Höfe. Sian Celynbarth hört beide Ufer an. Elin führt das Fährhaus. Mared sammelt Quittungen und Zeugenaussagen.',
    access: 'Bei gewöhnlichem Wasserstand ist die Brücke der direkte Übergang. Das Untere Fährhaus liegt eine Viertelstunde flussabwärts. Vom Westufer führt der Höhenweg um den Waldhang zum nächsten befestigten Übergang und verlängert die Reise um rund eine Stunde.',
    supply: 'Die Höfe liefern Getreide, Käse und Holz. Unter dem Tordach werden Werkzeuge und Sendungen gelagert. Instandhaltung und Herberge finanzieren sich aus Lagergebühren und Beiträgen der Uferhöfe.',
    services: 'Der Torhof hat zwei trockene Kammern und Platz für Zugtiere. Im Fährhaus lassen sich Seile ausbessern. Bei Hochwasser weisen die Fährleute am oberen Pegelpfosten auf den Höhenweg.',
    founding: 'Aus einer Hütte am Ufer wuchs der Torhof. Vor drei Wintern beschädigte ein Hochwasser Brücke und alte Pegelmarken. Die Fährleute richteten daraufhin gemeinsam einen Warndienst ein.',
    hooks: 'Beim nächsten Pegelgang tauchen zwei Quittungen für dieselbe Werkzeugkiste auf. Wer Brückenbuch, Fährliste und Pegelzeichen abgleicht, kann beide Einträge zeitlich einordnen.',
    questions: 'Wer entscheidet bei widersprüchlichen Meldungen über die Sperrung? Wie viel Mitsprache haben die Höfe bei einem Brückenneubau?',
    notes: 'Arbeitskarte für eine Untersuchung mit drei Stationen. Beginnt die Gruppe im Fährhaus, kann das Gespräch am Torhof als zweite Station folgen.'
  }, {
    images: [
      { id: 'a', name: 'Torhof und Steinbrücke', url: art('celynbarth-gelynwacht'), format: 'landscape', note: 'Gemeinsame Ansicht von Ort und Familiensitz. Steinbrücke und Torhof bestimmen das Bild.' },
      { id: 'b', name: 'Ortskarte mit Höhenweg', url: art('gelynwacht-karte'), format: 'landscape', note: 'Draufsicht für die Wegeplanung zwischen Torhof, unterer Fähre und Holzplatz.' },
      { id: 'c', name: 'Das Untere Fährhaus', url: art('gelynwacht-unteres-faehrhaus'), format: 'landscape', note: 'Der Anleger ist ein möglicher Einstieg für die Szene um die doppelte Quittung.' }
    ],
    landmarks: [
      { id: 'gelynwacht-bruecke', name: 'Steinbrücke und Torhof', location: 'Talmitte, Ostufer', image: art('celynbarth-gelynwacht'), format: 'landscape', note: 'Hier hängen Meldungen und Reisehinweise. Das Lagerbuch liegt im Torhof.' },
      { id: 'gelynwacht-faehrhaus', name: 'Unteres Fährhaus', location: 'Westufer, flussabwärts', image: art('gelynwacht-unteres-faehrhaus'), format: 'landscape', note: 'Elin führt ein eigenes Fährbuch. Hinter dem Bretterverschlag liegt das Fährlicht.' },
      { id: 'gelynwacht-holzplatz', name: 'Holzplatz am Hochweg', location: 'Waldlichtung im Nordwesten', note: 'Bretter für Steg und Brücke lagern unter einer schmalen Überdachung. Fuhrleute können den Weg der Werkzeugkiste bestätigen.' }
    ],
    residents: [
      { id: 'gelynwacht-mared', target: character.reference, role: 'Botin und angehende Heroldin', note: 'Aufgewachsen im Torhof. Sie kennt die Pegelzeichen und soll die Quittungen vergleichen.' },
      { id: 'gelynwacht-elin', name: 'Elin Celynbarth', role: 'Verwalterin des Unteren Fährhauses', note: 'Ihre Aufzeichnungen beginnen mit der ersten Überfahrt nach Tagesanbruch.' },
      { id: 'gelynwacht-bund', target: faction.reference, role: 'Fähr- und Warndienst', note: 'Seine Leute stellen Warnzeichen auf und stimmen die Dienstzeiten ab.' }
    ],
    relations: [
      { id: 'gelynwacht-haus', category: 'authority', target: house.reference, role: 'Diensthaus am Torhof', note: 'Die Familie stellt Lager und Herberge und verwahrt die Durchfahrtslisten.' },
      { id: 'gelynwacht-hochsteg', category: 'neighbors', name: 'Hochsteg', role: 'Nächster befestigter Übergang', note: 'Hochsteg profitiert vom Umweg bei gesperrter Brücke. Sein Fährmann meldet eigene Ansprüche an.' },
      { id: 'gelynwacht-licht', category: 'other', target: item.reference, role: 'Ausrüstung des Unteren Fährhauses', note: 'An der grünen Scheibe erkennen Wartende das örtliche Fährlicht.' }
    ],
    decisions: [
      { id: 'entscheidung-location', name: 'Lage & Ortstyp', result: 'Brückenweiler mit Diensthof in einem engen Flusstal von Celtigerns Wacht.', status: 'confirmed', reason: 'Brücke, Fähre und Höhenweg bieten drei Wege mit eigenen Begegnungen.' },
      { id: 'entscheidung-authority', name: 'Herrschaft & Zuständigkeit', result: 'Haus Celynbarth stellt den Hof. Der Bund teilt den Warndienst ein.', status: 'open', alternatives: 'Das Haus entscheidet über die Sperrung.\nBeide Ufer stimmen gemeinsam ab.' }
    ],
    timeline: [
      { id: 'gelynwacht-marke', date: 'Vor drei Generationen', name: 'Erstes Furtzeichen', note: 'Die späteren Celynbarth halten den Übergang erstmals schriftlich fest.' },
      { id: 'gelynwacht-flut', date: 'Vor drei Wintern', name: 'Die Brücke wird beschädigt', note: 'Fähre und Höhenweg übernehmen vorübergehend den Verkehr.' },
      { id: 'gelynwacht-szene', date: 'Beginn des Entwurfs', name: 'Eine Ladung erscheint in zwei Büchern', note: 'Beide Ufer bringen ihre Abschriften zum Torhof.' }
    ],
    sources: [
      { id: 'gelynwacht-atlas', name: 'Kontinentatlas für die regionale Einordnung', url: '../../Kontinente/index.html', note: 'Die Lage des fiktiven Weilers kann mit den vorhandenen Grenzwegen abgestimmt werden.' }
    ]
  }, now);
}
