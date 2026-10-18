import { HARBOR_ART, GWREGYSDU_EMBLEM, GWREGYSDU_MOTTO, harborPerson } from './harbor-people.mjs';
const personNode = key => { const p = harborPerson(key); return { id: `gwregysdu-${key}`, title: p.name, subtitle: p.role, portrait: p.portrait, text: p.bio }; };
const offices = (prefix, count, title, text, portrait = '') => Array.from({ length: count }, (_, i) => ({ id: `gwregysdu-${prefix}-${i + 1}`, title, subtitle: `Unbenannt · Stelle ${i + 1}`, text, portrait }));
const guardImage = rank => `${HARBOR_ART}/portraits/${rank}.png`;

export function buildGwregysduHierarchy() {
  return {
    organizationTitle: 'Haus, Lager und Wache', eyebrow: 'Gwregysdu · Hafenlogistik',
    subtitle: 'Familienführung · unbenannte Logistikstellen · vertraglicher Wachdienst', centerLabel: 'Bleddyn Gwregysdu',
    emblem: GWREGYSDU_EMBLEM, sideImage: `${HARBOR_ART}/scenes/kaihof.png`, motto: GWREGYSDU_MOTTO,
    description: '<p>Bleddyn trägt die Verantwortung für das Haus. Cynan führt Lager und Verträge, Tudur stimmt Fracht und Handelspartner ab. Die übrige Familie wird im Stammbaum vorgestellt. Die Logistikstellen bleiben vorerst ohne Personen und Porträts.</p>',
    detailsTitle: 'Umfang des Betriebs', details: [
      { label: 'Besitz', value: 'Vier Lagerhäuser · eine von mehreren Parteien des Handelspostens' },
      { label: 'Logistik', value: 'Vier Lagermeister · zwei Schreiber · zwei Waagknechte · zwölf Lagerknechte · vier Fuhrleute' },
      { label: 'Wache', value: 'Ein Optio Pilo · zwei Leutnante · 24 Soldaten' },
      { label: 'Zugehörigkeit der Wache', value: 'Rote Kompanie · den Gwregysdu vertraglich unterstellt' }
    ],
    chartTitle: 'Führung und unterstellte Dienste', chartIntro: 'Die 27 Angehörigen der Roten Kompanie bilden das hier eingesetzte Wachdetachement. Optio Pilo bezeichnet den Hauptmann der Zenturie; die dargestellten 24 Soldaten sind die örtliche Stärke. Drei Gruppen zeigen jeweils zwei Reihen zu vier Plätzen. Die Dienstpläne verteilen diese Kräfte auf Wachen, Ablösung und Geleit.',
    treeDisplayMode: 'tabs', portraitScale: 86, cardFontScale: 90,
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [
        { label: 'Herr des Hauses · Klingende Münze', nodes: [personNode('bleddyn')] },
        { label: 'Söhne in der Geschäftsführung', nodes: [personNode('cynan'), personNode('tudur')] }
      ] },
      { id: 'logistik', label: 'Logistik', parentTreeId: 'fuehrung', levels: [
        { label: 'Vier Lagerhäuser · je ein Lagermeister', nodes: offices('lagermeister', 4, 'Lagermeister', 'Verantwortet Belegung, Verschluss und Bestandsführung eines Lagerhauses. Der Name ist noch offen.') },
        { label: 'Schrift und Gewicht', nodes: [...offices('schreiber', 2, 'Lagerschreiber', 'Erfasst Eingang, Lagerfrist, Eigentümer und Auslieferung.'), ...offices('waage', 2, 'Waagknecht', 'Prüft Gewicht, Gebinde und Warenzeichen bei Annahme und Ausgabe.')] },
        { label: 'Lagerarbeit · zwölf Stellen', nodes: offices('lagerknecht', 12, 'Lagerknecht', 'Bewegt und sichert Fracht, hält Laufwege frei und hilft beim Umschlag.') },
        { label: 'Auslieferung · vier Stellen', nodes: offices('fuhrmann', 4, 'Fuhrmann', 'Übernimmt vereinbarte Fahrten zwischen Handelsposten, Stadt und Umland.') }
      ] },
      { id: 'wache', label: 'Rote Kompanie · Führung', parentTreeId: 'fuehrung', levels: [
        { label: 'Hauptmann der Zenturie', nodes: offices('optio-pilo', 1, 'Optio Pilo', 'Führt das örtliche Wachdetachement der Roten Kompanie, teilt die Wachen ein und stimmt Einsätze mit der Hausführung ab.', guardImage('optio-pilo')) },
        { label: 'Zwei Leutnante', nodes: offices('leutnant', 2, 'Leutnant', 'Untersteht dem Optio Pilo; führt eine Wachablösung und beaufsichtigt Torposten und Geleit.', guardImage('leutnant')) }
      ] },
      ...Array.from({ length: 3 }, (_, group) => ({ id: `wachgruppe-${group + 1}`, label: `Wachgruppe ${group + 1} · acht Soldaten`, parentTreeId: 'wache', levels: [
        { label: 'Erste Reihe · vier Soldaten', nodes: offices(`soldat-${group + 1}-a`, 4, 'Soldat der Roten Kompanie', 'Bewacht Tore, Lager und übergebene Fracht; kein Familienangehöriger und keine Stadtwache.', guardImage('soldat')) },
        { label: 'Zweite Reihe · vier Soldaten', nodes: offices(`soldat-${group + 1}-b`, 4, 'Soldat der Roten Kompanie', 'Versieht Ablösung, Rundgang und vereinbartes Geleit unter den Offizieren.', guardImage('soldat')) }
      ] }))
    ], levels: [], footerNote: 'Drei anonyme Rangporträts: eines für den Hauptmann, eines gemeinsam für beide Leutnante, eines gemeinsam für alle 24 Soldaten. Helme und Schatten verbergen die Gesichter. Gruffudd besitzt im Hafenbetrieb keinen Führungsposten.'
  };
}
