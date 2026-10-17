import { STORE_ART, PENDRWN_EMBLEM, STORE_CAT, storePerson } from './store-people.mjs';
const member = p => ({ id: `voller-korb-${p.key}`, title: p.name, subtitle: p.role, portrait: p.portrait,
  text: `<p>${p.bio}</p>${p.bestiaryReference ? `<p><a href="${p.bestiaryReference.url}" target="_blank" rel="noopener">Bestiarium · ${p.bestiaryReference.name}</a></p>` : ''}` });
const level = (label, ...keys) => ({ label, nodes: keys.map(key => member(storePerson(key))) });
export function buildStoreHierarchy() {
  return { organizationTitle: 'Die Hände des Vollen Korbs', eyebrow: 'Haus Pendrwn · Gwynthor',
    subtitle: 'Zwei Inhaber · drei weitere Angehörige des Händlerzweigs · drei Angestellte', centerLabel: 'Cadwgan und Idwal Pendrwn',
    emblem: PENDRWN_EMBLEM, sideImage: `${STORE_ART}/scenes/verkaufsraum.png`, motto: 'Für Haus und Weg.',
    description: '<p>Cadwgan und Idwal führen den Laden gemeinsam. Mabli und Tesni übernehmen Kasse und Verkauf, Rhun den Wareneingang. Drei bezahlte Kräfte ergänzen den kleinen Betrieb.</p>',
    detailsTitle: 'Der Betrieb', details: [{ label: 'Inhaber', value: 'Cadwgan und Idwal Pendrwn' }, { label: 'Lieferant', value: 'Markt der Fortuna' },
      { label: 'Familie im Laden', value: 'Mabli, Rhun und Tesni' }, { label: 'Angestellte', value: 'Elen, Iestyn und Cadoc' },
      { label: 'Sicherheit', value: 'Ein Hauswächter' }, { label: 'Haustiere', value: 'Eine Lagerkatze · Fflam' }],
    chartTitle: 'Tresen, Fracht und verschlossene Türen', chartIntro: 'Die Führung steht beim Verkauf; Rhun verantwortet die Logistik. Cadoc bewacht das Haus und ist kein Angehöriger der Stadtwache.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90,
    trees: [
      { id: 'verkauf', label: 'Verkauf', parentTreeId: '', levels: [level('Gemeinsame Inhaber', 'cadwgan', 'idwal'), level('Kasse und Kunden', 'mabli', 'tesni', 'elen')] },
      { id: 'logistik', label: 'Logistik', parentTreeId: 'verkauf', levels: [level('Wareneingang und Auslieferung', 'rhun'), level('Lager und Tragearbeit', 'iestyn')] },
      { id: 'sicherheit', label: 'Sicherheit', parentTreeId: 'verkauf', levels: [level('Tür, Lieferpforte und abendlicher Verschluss', 'cadoc')] },
      { id: 'haustiere', label: 'Haustiere', parentTreeId: 'verkauf', levels: [{ label: 'Zwischen Kisten und Fenstersims', nodes: [member(STORE_CAT)] }] }
    ], levels: [], footerNote: 'Die Lieferleute des Marktes der Fortuna gehören zu ihrem eigenen Handelshaus. Sie werden hier nicht als Pendrwn-Angestellte geführt.' };
}
