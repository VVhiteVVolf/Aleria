import { FFALS_ART, ffalsPerson } from './ffals-people.mjs';

export const FFALS_VACANCIES = Object.freeze([
  { key: 'goldschmied', title: 'Goldschmiedemeister · Fachverantwortung', text: 'Prüft Edelmetallarbeiten und übernimmt anspruchsvollere Anfertigungen und Reparaturen.' },
  { key: 'fasser', title: 'Edelsteinfasser · Besatz und Reparatur', text: 'Fasst geeignete Schmucksteine und prüft den Sitz bereits vorhandener Fassungen.' },
  { key: 'geselle', title: 'Schmuckgeselle · Werkbank', text: 'Übernimmt gewöhnliche Metallarbeiten, Polieren und die Vorbereitung von Reparaturen.' },
  { key: 'lehrling', title: 'Juwelierlehrling · Ausbildung', text: 'Erlernt unter fachlicher Anleitung Werkzeugpflege und einfache Werkstattarbeiten.' },
  { key: 'kontor', title: 'Kontorhilfe · Listen und Abholungen', text: 'Hält Warenannahme, vereinbarte Aufträge und Abholtermine übersichtlich fest.' }
]);

function personNode(key) {
  const person = ffalsPerson(key);
  return { id: `goldene-fassung-person-${key}`, characterId: person.characterId, title: person.name,
    subtitle: person.role, portrait: person.portrait, text: `<p>${person.bio}</p>` };
}

function vacancyNode(key) {
  const vacancy = FFALS_VACANCIES.find(item => item.key === key);
  if (!vacancy) throw Error(`Unbekannter Juwelierposten: ${key}`);
  return { id: `goldene-fassung-post-${key}`, title: vacancy.title, subtitle: 'Unbesetzter Posten', portrait: '', text: `<p>${vacancy.text}</p>` };
}

export function buildFfalsHierarchy() {
  const trees = [
    { id: 'leitung', label: 'Leitung & Verkauf', parentTreeId: '', levels: [
      { label: 'Geschäftsführung und Einkauf', nodes: [personNode('alwyn')] },
      { label: 'Beratung und Ladendienst', nodes: [personNode('seren'), personNode('rhun')] },
      { label: 'Aufträge und Abholungen', nodes: [vacancyNode('kontor')] }
    ] },
    { id: 'werkstatt', label: 'Werkstatt & Lager', parentTreeId: 'leitung', levels: [
      { label: 'Vorgesehene fachliche Verantwortung', nodes: [vacancyNode('goldschmied')] },
      { label: 'Steine und Metallarbeiten', nodes: [vacancyNode('fasser'), vacancyNode('geselle')] },
      { label: 'Warenannahme und Mithilfe', nodes: [personNode('bryn')] },
      { label: 'Ausbildung', nodes: [vacancyNode('lehrling')] }
    ] }
  ];
  return { eyebrow: 'Die goldene Fassung', organizationTitle: 'Laden, Werkstatt & freie Stellen', centerLabel: 'Die goldene Fassung',
    emblem: `${FFALS_ART}/schild.png`, sideImage: `${FFALS_ART}/personal.png`, motto: 'Ein passendes Stück für den richtigen Anlass.',
    subtitle: 'Vier Ladenrollen und einzeln vorgesehene Fachstellen', description: '<p>Alwyn führt das Geschäft, Seren betreut die Kundschaft, Rhun hilft im Laden und Bryn bei Warenannahme und Werkstatt. Weitere Fach- und Ausbildungsstellen können einzeln besetzt werden. Die freien Stellen sind keine bereits beschäftigten Personen.</p>',
    chartTitle: 'Vom Einkauf bis zur Abholung', chartIntro: 'Geschäftsführung, Ladendienst und handwerkliche Facharbeit bleiben als Aufgaben getrennt.',
    layoutMode: 'vertical', treeDisplayMode: 'tabs', portraitScale: 125, cardFontScale: 95,
    details: [{ icon: '✦', label: 'Standort', value: 'Gwynthor-Stadt' }, { icon: '◈', label: 'Leitung', value: 'Alwyn Ffals' }],
    trees, levels: structuredClone(trees[0].levels) };
}
