import { AURDDEN_ART, AURDDEN_EMBLEM, aurddenPerson } from './aurdden-people.mjs';

export const AURDDEN_VACANCIES = Object.freeze([
  { id: 'meier', title: 'Meier · Betriebsverwaltung', text: 'Koordiniert Einkauf, Fristen, Dienstpläne und die laufende Abrechnung unter den drei Brüdern.' },
  { id: 'fasser', title: 'Edelsteinfasser · zusätzliche Fachstelle', text: 'Übernimmt Fassungen und schwierige Reparaturen nach Abstimmung mit Thalan.' },
  { id: 'kontor', title: 'Kontorschreiber · Auftragsverwaltung', text: 'Führt Materialeingang, Bestellungen, Abholungen und vereinbarte Zahlungen zusammen.' },
  { id: 'hausdienst', title: 'Hausdienst · Reinigung und Wäsche', text: 'Pflegt Verkaufsräume, Arbeitsflächen und die für die Präsentation verwendeten Tücher.' },
  { id: 'bote', title: 'Vertrauensbote · versiegelte Übergaben', text: 'Übernimmt bestätigte Botengänge und die geordnete Übergabe angenommener Aufträge.' }
]);
const personNode = id => { const person = aurddenPerson(id); return { id: `sternenfang-${id}`, title: person.name,
  characterId: person.characterId, subtitle: person.title, portrait: person.portrait, text: `<p>${person.notes}</p>` }; };
const vacancyNode = id => { const post = AURDDEN_VACANCIES.find(candidate => candidate.id === id); return {
  id: `sternenfang-post-${id}`, title: post.title, subtitle: 'Unbesetzter Posten', portrait: '', text: `<p>${post.text}</p>` }; };
const level = (label, ids) => ({ label, nodes: ids.map(personNode) });

export function buildAurddenHierarchy() {
  const trees = [
    { id: 'leitung', label: 'Leitung und Kontor', parentTreeId: '', levels: [
      level('Gemeinsame Geschäftsführung', ['kyrwyn-aurdden', 'thalan-aurdden', 'saithen-aurdden']),
      { label: 'Betriebsverwaltung', nodes: [vacancyNode('meier')] },
      level('Kundentermine, Prüfung und Hausorganisation', ['avelena-spouse-aurdden', 'firwen-spouse-aurdden', 'perdella-spouse-aurdden']),
      { label: 'Auftragsbücher', nodes: [vacancyNode('kontor')] }
    ] },
    { id: 'werkstatt', label: 'Goldschmiede und Edelsteine', parentTreeId: 'leitung', levels: [
      level('Werkstattleitung', ['thalan-aurdden']),
      level('Gold, Schliff und Fassung', ['iwria-aurdden', 'kyran-aurdden', 'gwaeden-aurdden']),
      level('Sonderanfertigungen und Perlen', ['oenric-aurdden', 'helygen-aurdden']),
      { label: 'Zusätzliche Fachstelle', nodes: [vacancyNode('fasser')] },
      level('Ausbildung unter Aufsicht', ['janeth-aurdden', 'thalric-aurdden'])
    ] },
    { id: 'verkauf', label: 'Beratung und Präsentation', parentTreeId: 'leitung', levels: [
      level('Verkaufsleitung', ['saithen-aurdden']), level('Auslage und Beratung', ['dyrwen-aurdden']),
      { label: 'Dienst und Übergaben', nodes: [vacancyNode('hausdienst'), vacancyNode('bote')] }
    ] },
    { id: 'wachen', label: 'Schutz des Hauses', parentTreeId: 'leitung', levels: [
      level('Zwei angestellte Söldner aus Aldrimar', ['hjalrik-stenholm', 'bjarne-haldsvik'])
    ] }
  ];
  return { eyebrow: 'Der Sternenfang · Aurdden', organizationTitle: 'Das Juwelierhaus', centerLabel: 'Der Sternenfang',
    emblem: AURDDEN_EMBLEM, sideImage: `${AURDDEN_ART}/verkaufsraum.png`, motto: 'Was die Tiefe birgt, bringen wir ans Licht.',
    subtitle: 'Drei Brüder, eine Werkstatt und ein gemeinsamer Laden',
    description: '<p>Die drei Brüder führen den Sternenfang gemeinsam. Benannte Familienangehörige besetzen eigene Aufgaben; zwei Aldrimarer sichern das Haus. Fünf ausdrücklich unbesetzte Stellen bleiben für späteres Personal offen. Der Bankzweig führt ein eigenes Geschäft.</p>',
    chartTitle: 'Vom Entwurf bis zur Übergabe', chartIntro: 'Beratung, Werkstatt und Verwaltung arbeiten unter derselben Leitung.',
    layoutMode: 'vertical', treeDisplayMode: 'tabs', portraitScale: 115, cardFontScale: 95,
    details: [{ icon: '✦', label: 'Standort', value: 'Klingende Münze · Gwynthor-Stadt' }, { icon: '◈', label: 'Dienstbindung', value: 'Haus Loer' }],
    trees, levels: structuredClone(trees[0].levels) };
}
