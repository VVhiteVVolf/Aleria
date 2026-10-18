import { HELLER_ART, CNEACAIL_EMBLEM, HELLER_DOG, hellerPerson } from './heller-people.mjs';
const member = p => ({ id: `heller-post-${p.key}`, title: p.name, subtitle: p.role, portrait: p.portrait, text: `<p>${p.bio}</p>${p.bestiaryReference ? `<p><a href="${p.bestiaryReference.url}" target="_blank" rel="noopener">Bestiarium · ${p.bestiaryReference.name}</a></p>` : ''}` });
const level = (label, keys) => ({ label, nodes: keys.map(key => member(hellerPerson(key))) });
export function buildHellerHierarchy() {
  return { organizationTitle: 'Die wenigen Hände im Letzten Heller', eyebrow: 'Zum Letzten Heller', subtitle: 'Ein Wirt, zwei Hilfen, fünf Dirnen und der Hausdienst', centerLabel: 'Alasdair Cneacail', emblem: CNEACAIL_EMBLEM, sideImage: `${HELLER_ART}/scenes/schankstube.png`, motto: 'Erst die Zeche. Dann die Tür.',
    description: '<p>Alasdair hält Kasse und Schlüssel. Fergal hilft am Ausschank, Sorcha steht allein in der Küche. Fünf erwachsene Frauen nehmen die Gäste in den drei Kammern an. Sten hält die Treppe frei; Maela trägt den Hausdienst.</p>',
    detailsTitle: 'Der kleine Betrieb', details: [{ label: 'Inhaber', value: 'Alasdair Cneacail' }, { label: 'Schankhilfe', value: 'Fergal' }, { label: 'Küche', value: 'Sorcha' }, { label: 'Dirnen', value: 'Fünf erwachsene Frauen · Ceitheach und Aldrimar' }, { label: 'Kammern', value: 'Drei kleine Räume · keine Herberge' }, { label: 'Hausdienst', value: 'Ein Türsteher · eine Magd · ein Hund' }],
    chartTitle: 'Tresen, Kammern und Hausdienst', chartIntro: 'Finlay arbeitet für die Klingende Münze. Im Letzten Heller trägt er keine Aufgabe; Arran gehört zur Geschichte des Hauses.', treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90,
    trees: [{ id: 'fuehrung', label: 'Führung & Ausschank', parentTreeId: '', levels: [level('Der Wirt', ['alasdair']), level('Zwei Flüchtlinge halten Tresen und Küche in Gang', ['fergal', 'sorcha'])] },
      { id: 'dirnen', label: 'Dirnen', parentTreeId: 'fuehrung', levels: [level('Aus Ceitheach', ['eilidh', 'mairead', 'fiona']), level('Aus Aldrimar', ['runa', 'signe'])] },
      { id: 'sonstiges', label: 'Sonstiges', parentTreeId: 'fuehrung', levels: [level('Tür und Hausarbeit', ['sten', 'maela']), { label: 'An der Hintertür', nodes: [member(HELLER_DOG)] }] }],
    levels: [], footerNote: 'Die Männer der Sept tragen den Familiennamen Cneacail. Die angestellten Flüchtlinge führen im Haus ihre Vornamen.' };
}
