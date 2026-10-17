import { FONTANI_PEOPLE, FONTANI_EMBLEM, BATHHOUSE_ART } from './bathhouse-people.mjs';

const position = (id, title, text) => ({ id: `fontani-${id}`, title, subtitle: 'Unbenannte Stelle', portrait: '', text });

export function buildBathhouseHierarchy() {
  return {
    organizationTitle: 'Das Haus am warmen Wasser', eyebrow: 'Badehaus der Fontani',
    subtitle: 'Drei Familienangehörige · sieben Bedienstete', centerLabel: 'Unter Cassiano Lucius Fontani',
    emblem: FONTANI_EMBLEM, sideImage: `${BATHHOUSE_ART}/scenes/aussenansicht.png`,
    motto: 'Aqua et Quies · Wasser und Ruhe',
    description: '<p>Die Familie führt das Haus selbst. Sieben weitere Stellen sind vorgesehen; ihre Namen und Gesichter bleiben vorerst offen.</p>',
    detailsTitle: 'Ein kleines Haus', details: [
      { label: 'Führung', value: 'Cassiano, Livia und Terenzio' },
      { label: 'Verwaltung', value: 'Zwei Bedienstete' },
      { label: 'Bedienung', value: 'Fünf Bedienstete einschließlich Heizer' },
      { label: 'Gesamt', value: 'Zehn Personen einschließlich Familie' }
    ],
    chartTitle: 'Führung und täglicher Dienst',
    chartIntro: 'Cassiano verantwortet den Betrieb und das Baderhandwerk. Livia leitet Empfang, Vorräte und Wäsche; Terenzio betreut die Wasser- und Heiztechnik. Die genannten Bedienstetenzahlen gelten für den gesamten Betrieb, nicht je Familienmitglied.',
    treeDisplayMode: 'tabs', portraitScale: 80, cardFontScale: 90,
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [
        { label: 'Inhaber', nodes: [FONTANI_PEOPLE[0]].map(p => ({ id: `fontani-${p.id}`, title: p.name, subtitle: p.role, portrait: p.portrait, text: p.bio })) },
        { label: 'Familie im Betrieb', nodes: FONTANI_PEOPLE.slice(1).map(p => ({ id: `fontani-${p.id}`, title: p.name, subtitle: p.role, portrait: p.portrait, text: p.bio })) }
      ] },
      { id: 'verwaltung', label: 'Verwaltung', parentTreeId: 'fuehrung', levels: [
        { label: 'Zwei Stellen · unter Livia', nodes: [
          position('empfang', 'Empfang und Kasse', 'Begrüßt Gäste, vergibt Wannenstunden, nimmt Zahlungen entgegen und gibt saubere Tücher aus.'),
          position('schreiber', 'Schreiber und Vorratsführung', 'Führt Einnahmen, Einkäufe und Vorratslisten. Stimmt Holz, Seife, Öl und Leinen mit der Familie ab.')
        ] }
      ] },
      { id: 'bedienung', label: 'Bedienung', parentTreeId: 'fuehrung', levels: [
        { label: 'Bad und Gäste · drei Stellen unter Cassiano', nodes: [
          ...[1, 2].map(i => position(`bader-${i}`, 'Bader', 'Bereitet Bäder vor, prüft die Wassertemperatur, betreut Waschplätze und übernimmt auf Wunsch Abreibungen.')),
          position('gaestedienst', 'Gästedienst', 'Begleitet Gäste zu freien Plätzen, bringt Wasser und Tücher und richtet die privaten Wannenstuben her.')
        ] },
        { label: 'Wäsche und Reinigung · eine Stelle unter Livia', nodes: [position('waesche', 'Wäsche- und Reinigungskraft', 'Wäscht und trocknet Leinen, reinigt Waschplätze und Böden und unterstützt das Reinigen und Neubefüllen der Becken.')] },
        { label: 'Wärme und Wasser · eine Stelle unter Terenzio', nodes: [position('heizer', 'Heizer', 'Unterhält Holzfeuer und Wasservorrat, hält die Feuerzüge frei und unterstützt den täglichen Wasserwechsel.')] }
      ] }
    ], levels: [],
    footerNote: 'Sieben unbenannte Stellen ohne Porträts. Die ältere Familiengeschichte bleibt überliefert, ohne weitere Angehörige anzulegen.'
  };
}
