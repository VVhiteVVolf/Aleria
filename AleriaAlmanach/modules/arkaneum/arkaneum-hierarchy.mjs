import { ARKANEUM_ART, LOTHAIRE_EMBLEM, arkaneumPerson } from './arkaneum-people.mjs';
const member = id => {
  const person = arkaneumPerson(id);
  return { id: `arkaneum-${id}`, title: person.name, subtitle: person.role, portrait: person.portrait,
    text: `<p>${person.personality}</p><p>${person.tasks.join(' · ')}</p>` };
};
const branch = (id, label, ids) => ({ id, label, parentTreeId: id === 'fuehrung' ? '' : 'fuehrung', levels: [{ label, nodes: ids.map(member) }] });
export function buildArkaneumHierarchy() {
  return { organizationTitle: 'Die Hände des Arkaneums', eyebrow: 'Lothaires Arkaneum', subtitle: 'Elf Menschen zwischen Garten, Labor und Laden',
    centerLabel: 'Herluin Lothaire', emblem: `../Stammbäume/${LOTHAIRE_EMBLEM}`, sideImage: `${ARKANEUM_ART}/labor.png`,
    motto: 'Erst prüfen. Dann beschriften. Dann Herluin fragen.',
    description: '<p>Herluin verantwortet Labor und arkane Arbeiten. Rhydian betreut gewöhnliche Zutaten; Maelwyn lernt beim Großvater. Perban führt die Bücher, Nauthagerd die Vorräte. Die drei Beschaffer ziehen nach Tagesbedarf hinaus; die Laufburschen erledigen die Wege innerhalb der Stadt.</p>',
    detailsTitle: 'Wer wofür zuständig ist', details: [{ label: 'Leitung & Labor', value: 'Herluin, Rhydian und Maelwyn' },
      { label: 'Verwaltung & Vorrat', value: 'Perban und Nauthagerd' }, { label: 'Beschaffung', value: 'Cyrwyn, Torvald und Rioneth' },
      { label: 'Laufdienst', value: 'Neddric und Saithen' }, { label: 'Hausarbeit', value: 'Jeradis' }],
    chartTitle: 'Vom Fundort bis zum Verkaufsbrett', chartIntro: 'Die Aufgaben sind verteilt; die Magiebegabung des Inhabers ist keine Voraussetzung für Gartenarbeit, Beschaffung oder Buchführung.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90, levels: [], trees: [
      branch('fuehrung', 'Führung & Labor', ['herluin-lothaire', 'rhydian-o-cenyr', 'maelwyn-o-cenyr']),
      branch('verwaltung', 'Verwaltung & Vorrat', ['perban', 'nauthagerd']),
      branch('beschaffung', 'Beschaffung & Schutz', ['cyrwyn', 'torvald', 'rioneth']),
      branch('laufdienst', 'Laufdienst', ['neddric', 'saithen']), branch('hausdienst', 'Hausdienst', ['jeradis'])
    ], footerNote: 'Torvald und Nauthagerd sind Geschwister, ebenso Neddric und Saithen. Die beiden Geschwisterpaare gehören nicht zur Familie Lothaire.' };
}
