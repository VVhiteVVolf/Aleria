import { FEDERKIEL_ART, federkielIllustration } from './federkiel-section.mjs';

const services = [
  {
    id: 'briefversand', title: 'Einen Brief verschicken',
    description: 'Briefe und kurze Botschaften günstig in der Stadt und im Umland zustellen lassen. Die Post sammelt Sendungen für denselben Weg und gibt sie gemeinsam auf.',
    scope: 'Gewöhnliche Briefe und gefaltete Nachrichtenzettel',
    terms: 'Das einfache Porto und der nächste passende Abgang werden am Schalter genannt.'
  },
  {
    id: 'selbst-schreiben', title: 'Am Schreibplatz selbst schreiben',
    description: 'An der Schreibbank stehen Papier, Tinte und Feder bereit. Eine Schreibkraft hilft auf Wunsch beim Formulieren, bei der Anschrift oder beim Falten des Briefs.',
    scope: 'Schreibplatz und Hilfe bei Bedarf',
    terms: 'Material und gewünschte Schreibhilfe werden vorher besprochen.'
  },
  {
    id: 'diktieren', title: 'Einen Brief diktieren',
    description: 'Wer selbst keinen Brief schreiben kann, erzählt der Schreibkraft in eigenen Worten, was ankommen soll. Die Schreibkraft setzt den Brief auf und liest ihn auf Wunsch zur Freigabe zurück.',
    scope: 'Eine Botschaft nach Diktat',
    terms: 'Die Schreibstube bietet für persönliche Nachrichten einen ruhigen Platz an.'
  },
  {
    id: 'vorlesen', title: 'Post vorlesen lassen',
    description: 'Eine Schreibkraft liest einen erhaltenen Brief auf Wunsch in der ruhigen Nische vor und hilft dabei, eine Antwort vorzubereiten.',
    scope: 'Eingegangene Briefe und Botschaften',
    terms: 'Ein verschlossener Brief wird nur mit Zustimmung geöffnet.'
  },
  {
    id: 'abholung', title: 'Briefe an einer Station abholen',
    description: 'Briefe können an eine Federkiel-Stelle adressiert und dort hinterlegt werden. Das hilft Menschen, die unterwegs sind oder keine feste Zustelladresse haben.',
    scope: 'Aufbewahrung an der vereinbarten Zielstation',
    terms: 'Die Zielstation und der Name für die Ausgabe werden bei der Aufgabe festgehalten.'
  },
  {
    id: 'fernpost', title: 'Nachrichten über Land schicken',
    description: 'Die Fernpost befördert Briefe durch ganz Cenyr und über das weltweite Stationsnetz ins Ausland. Jede Station übernimmt die versiegelten Sendungen für den nächsten Abschnitt.',
    scope: 'Briefe auf längeren Wegen und über die Grenze',
    terms: 'Der Schalter klärt den erreichbaren Zielort, die nächste Verbindung und das Porto vor der Aufgabe.'
  }
];

export function buildFederkielServicesPage() {
  return {
    schemaVersion: 1, pageTitle: 'Dienstleistungen', commentThreadKey: 'federkiel-dienstleistungen',
    ...federkielIllustration('dienstleistungen'), guildServicesPage: true,
    guildServices: {
      title: 'Briefe schreiben, lesen und verschicken',
      introduction: '<p>Einfache Briefe reisen günstig mit der Sammelpost. In der Schreibstube können Menschen ohne Lese- oder Schreibkenntnisse Briefe diktieren und vorlesen lassen.</p>',
      services: services.map(({ id, ...service }) => ({ ...service, icon: `${FEDERKIEL_ART}/services/${id}-v1.webp` })),
      process: '<ol><li>Brief mitbringen, am Schreibplatz verfassen oder diktieren.</li><li>Am Schalter Zielort und Zustellweg klären und das Porto zahlen.</li><li>Die Post versiegelt und bündelt die Briefe nach Abgang. Kuriere reichen die Sendungen von Station zu Station weiter.</li><li>Am Ziel wird der Brief zugestellt oder zur Abholung hinterlegt.</li></ol>',
      conditions: '<p>Regelmäßige Sammelabgänge halten das Porto niedrig. Längere Wege richten sich nach den Anschlüssen zwischen den Poststationen. Persönliche Schreiben werden in der Schreibstube vertraulich behandelt.</p>'
    }
  };
}
