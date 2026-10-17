import { PATRIARCH, ARIANWEN, PEREDUR, ANGHARAD, CHURCH_SYMBOL, CATHEDRAL_ART } from './cathedral-people.mjs';

const office = (id, title, subtitle, text) => ({ id: `kathedrale-${id}`, title, subtitle, portrait: '', text });
const positions = (id, count, title, text, subtitle = 'Person noch nicht benannt') => Array.from({ length: count }, (_, index) =>
  office(`${id}-${index + 1}`, title, `${subtitle} · Platz ${index + 1}`, text));
const patriarchLevel = branch => ({ label: 'Oberste geistliche Führung', nodes: [{
  id: `kathedrale-patriarch-${branch}`, title: PATRIARCH.name, subtitle: PATRIARCH.role,
  portrait: PATRIARCH.portrait,
  text: 'Oberster Geistlicher der Grafschaft, der Gemeinde Gwynthors und seines persönlichen Stabes.'
}] });

export function buildCathedralHierarchy() {
  return {
    organizationTitle: 'Der persönliche Kreis des Patriarchen', eyebrow: 'Kirchliche Ordnung',
    subtitle: 'Große Kathedrale der Neun · Gwynthor', centerLabel: 'Unter Patriarch Gwalchgwyn Saethwyr',
    emblem: CHURCH_SYMBOL, sideImage: `${CATHEDRAL_ART}/kathedrale.png`,
    motto: 'Glaube, Dienst und Verantwortung.',
    description: '<p>Dieser Aufbau zeigt den engen Kreis Gwalchgwyns. Die übrigen Gemeinden, Klöster und kirchlichen Häuser Celtigerns Wacht behalten ihre eigene Ordnung.</p>',
    detailsTitle: 'Auftrag und Zugehörigkeit',
    details: [
      { label: 'Führung', value: 'Patriarch und neun hohe Prälaten' },
      { label: 'Militärischer Stab', value: '31 ritterliche Plätze, dazu zwei Militärkapläne' },
      { label: 'Kirchdiener', value: '17 persönliche, geistliche und bürokratische Dienste' },
      { label: 'Buße', value: 'Vier Plätze je Stand · Arianwen in laufender Buße' }
    ],
    chartTitle: 'Führung, Schutz und persönlicher Dienst',
    chartIntro: 'Alle vier Bereiche stehen unter dem Patriarchen. Seine neun hohen Prälaten sind unmittelbar nach ihm die ranghöchsten Geistlichen Celtigerns Wacht und tragen unterschiedliche hohe Aufgaben. Aus ihrem Kreis wird nach seinem Tod der nächste Patriarch bestimmt. Die Zahlen im militärischen Stab sind Gesamtzahlen je Rang; unbenannte Plätze sind vorbereitete Rollen.',
    treeDisplayMode: 'tabs', portraitScale: 80, cardFontScale: 88,
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [patriarchLevel('fuehrung'), {
        label: 'Neun hohe Prälaten · gleicher Rang',
        nodes: [
          { id: 'kathedrale-peredur', title: PEREDUR.name, subtitle: PEREDUR.role, portrait: PEREDUR.portrait,
            text: 'Einer der neun hohen Prälaten und ein Priester Ordans. Der erfahrene Geistliche aus Haus Eneiniog dient unmittelbar unter Gwalchgwyn; ruhige Güte und maßvolle Autorität prägen sein Auftreten. Ein besonderes Ressort wird hier noch nicht festgelegt.' },
          ...positions('praelat', 8, 'Hoher Prälat',
            'Unbenannter hoher Geistlicher im unmittelbaren Kreis des Patriarchen. Ein einzelner Aufgabenbereich ist noch nicht festgelegt.')
        ]
      }] },
      { id: 'militaer', label: 'Militärischer Stab', parentTreeId: 'fuehrung', levels: [
        patriarchLevel('militaer'),
        { label: 'Führung des militärischen Stabes', nodes: positions('hochpaladin', 1, 'Hochpaladin', 'Führt die bewaffneten Begleiter des Patriarchen, ordnet Schutz und Ausbildung und verantwortet die Einsätze des Stabes.') },
        { label: 'Sechs Paladine', nodes: [
          { id: 'kathedrale-angharad', title: ANGHARAD.name, subtitle: ANGHARAD.role, portrait: ANGHARAD.portrait,
            text: 'Die Paladin aus Haus Eneiniog gehört zu den sechs Paladinen unter dem Hochpaladin. Ihr Dienst gilt dem Schutz des Patriarchen, der Gläubigen und der heiligen Stätten.' },
          ...positions('paladin', 5, 'Paladin', 'Geweihter Ritter im persönlichen Stab. Schützt den Patriarchen und die Gläubigen, begleitet Reisen und führt die unterstellten Kräfte.')
        ] },
        { label: 'Acht Glaubensritter · Templerdienst', nodes: positions('glaubensritter', 8, 'Glaubensritter', 'Kirchritter im Templerdienst. Bewacht heilige Stätten, begleitet Pilger und versieht den bewaffneten Dienst unter den Paladinen.') },
        { label: 'Acht Schwurknechte', nodes: positions('schwurknecht', 8, 'Schwurknecht', 'Eidverpflichteter Waffenknecht des kirchlichen Stabes. Unterstützt die Glaubensritter bei Wache, Geleit und Ausrüstung.') },
        { label: 'Vier Knappen', nodes: positions('knappe', 4, 'Knappe', 'Erlernt ritterliche Waffenführung und Glaubenspflichten, begleitet einen Ritter und unterstützt dessen täglichen Dienst.') },
        { label: 'Vier Pagen', nodes: positions('page', 4, 'Page', 'Erlernt Umgangsformen, Versorgung und die ersten Grundlagen des kirchlichen Ritterdienstes.') },
        { label: 'Geistliche Begleitung · dem Hochpaladin zugeordnet', nodes: positions('militaerkaplan', 2, 'Militärkaplan', 'Priesterlicher Kleriker für Seelsorge, Gelübde, Gebet und Beistand im militärischen Stab. Dieses Begleitamt ist kein zusätzlicher militärischer Rang.') }
      ] },
      { id: 'kirchdiener', label: 'Kirchdiener des Patriarchen', parentTreeId: 'fuehrung', levels: [
        patriarchLevel('diener'),
        { label: 'Persönliche Leitung der Dienste', nodes: [office('haushofmeister', 'Haushofmeister', 'Eine Stelle', 'Ordnet den persönlichen Haushalt, die Tagesabläufe und die Zusammenarbeit der Diener des Patriarchen.')] },
        { label: 'Kanzlei und Schriftverkehr', nodes: [
          office('sekretaer', 'Persönlicher Sekretär', 'Eine Stelle', 'Führt Termine, bereitet Audienzen vor und hält dringende Anliegen für Gwalchgwyn bereit.'),
          office('siegler', 'Siegler und Registrator', 'Eine Stelle', 'Verwahrt das Amtssiegel, ordnet Ausfertigungen und sorgt für nachvollziehbare Ablage.'),
          ...positions('schreiber', 2, 'Schreiber', 'Fertigt Briefe, Berichte, Abschriften und Besuchsvermerke für den persönlichen Stab.'),
          office('bote', 'Kanzleibote', 'Eine Stelle', 'Überbringt Nachrichten zwischen Patriarch, Prälaten, Gemeinden und Hof.')
        ] },
        { label: 'Geistlicher Alltag und Fürsorge', nodes: [
          ...positions('hauskaplan', 2, 'Hauskaplan', 'Bereitet Gebete und Gottesdienste vor, begleitet Seelsorge und unterstützt die geistlichen Pflichten des Patriarchen.'),
          office('sakristan', 'Persönlicher Sakristan', 'Eine Stelle', 'Hält Amtsgewänder, liturgische Geräte und die Ausstattung der patriarchalen Gottesdienste bereit.'),
          office('almosenpfleger', 'Almosenpfleger', 'Eine Stelle', 'Sammelt geprüfte Hilfsgesuche, begleitet die persönliche Armenfürsorge und hält zugesagte Hilfe nach.'),
          ...positions('akolyth', 2, 'Akolyth', 'Unterstützt Gebet und Zeremonien und erlernt unter Anleitung den geistlichen Dienst. Akolyth bezeichnet hier eine Aufgabe in Ausbildung, keine zusätzliche Kaste.')
        ] },
        { label: 'Persönlicher Haushalt und Reise', nodes: [
          ...positions('kammerdiener', 2, 'Kammerdiener', 'Versieht Kleidung, persönliche Räume und die praktische Begleitung des Tages.'),
          office('koch', 'Koch', 'Eine Stelle', 'Bereitet die Mahlzeiten des persönlichen Haushalts vor und stimmt Versorgung und Reiseproviant ab.'),
          ...positions('reisehelfer', 2, 'Reise- und Haushaltsgehilfe', 'Unterstützt Gepäck, Besorgungen, Vorräte und die Vorbereitung kirchlicher Besuchsreisen.')
        ] }
      ] },
      { id: 'busse', label: 'Bußgänger & Geläuterte', parentTreeId: 'fuehrung', levels: [
        patriarchLevel('busse'),
        { label: 'Vier Plätze für Geläuterte · Bußgang abgeschlossen', nodes: positions('gelaeutert', 4, 'Geläuterter',
          'Hat den Bußgang vollendet und ist von den vereinbarten Diensten und Gelübden befreit. Eine weitere Verbindung zur Kathedrale ist freiwillig; dieser Platz begründet keine neue Dienstpflicht.', 'Offener Platz · freie Rückkehr in die Gesellschaft') },
        { label: 'Vier Plätze für Bußgänger · laufende Verpflichtung', nodes: [
          { id: 'kathedrale-arianwen', title: ARIANWEN.name, subtitle: 'Bußgängerin · Gwalchgwyn ist ihr direkter Bußvater', portrait: ARIANWEN.portrait,
            text: 'Nach ihrer Beteiligung am Komplott gegen ihre Schwester bleibt Arianwen in Gwynthor unter unmittelbarer kirchlicher Obhut. Im persönlichen Kreis des Patriarchen erfüllt sie Dienst und Schweigegelübde. Er leitet ihre Buße und begleitet den Weg zur späteren Wiedereingliederung; ihr Bußgang ist noch nicht abgeschlossen.' },
          ...positions('bussgaenger', 3, 'Bußgänger', 'Erfüllt den individuell vereinbarten Dienst unter Eid und Schweigegelübde. Aufrichtige Umkehr und Wiedergutmachung sollen die freie Rückkehr ermöglichen.')
        ] }
      ] }
    ], levels: [],
    footerNote: 'Kleriker ist der gemeinsame Begriff für Angehörige des Klerus. Berufung, Rang und Auftrag bleiben unterschieden. Militärkapläne bilden keine eigene Rangstufe; die beiden Bußstände sind keine Befehlskette. Alle unbenannten Plätze bleiben ohne Namen und Porträts.'
  };
}
