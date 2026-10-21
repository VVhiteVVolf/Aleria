import { KLAUE_ART, KLAUE_DOGS, klauePerson } from './klaue-people.mjs';
const member = key => { const p = klauePerson(key); return { id: p.id, title: p.name, subtitle: p.role, portrait: p.portrait, worldPersonId: p.worldPersonId, text: `<p>${p.bio}</p>` }; };
const branch = (id, label, nodes) => ({ id, label, parentTreeId: id === 'fuehrung' ? '' : 'fuehrung', levels: [{ label, nodes }] });
export function buildKlaueHierarchy() {
  return { organizationTitle: 'Die Hände der Roten Klaue', eyebrow: 'Pfandhaus Valerus', subtitle: 'Zwei Inhaber, eine gemeinsame Kasse', centerLabel: 'Lucan & Camilla',
    emblem: `${KLAUE_ART}/ladenschild.png`, sideImage: `${KLAUE_ART}/scenes/schalterraum.png`, motto: 'Was bleibt, hat Wert.',
    description: '<p>Lucan und Camilla entscheiden gemeinsam über Darlehen und größere Pfänder. Aerwen betreut Empfang und ausgewählte Kundschaft. Bücher und Lager sind getrennte Aufgaben: Cadwyst hält die Forderung fest, Dewrys findet das dazugehörige Pfand.</p>',
    detailsTitle: 'Besetzung', details: [{ label: 'Führung', value: 'Lucan, Camilla und Aerwen' }, { label: 'Verwaltung & Logistik', value: 'Ein Meier und ein Pfandwart' },
      { label: 'Sicherheit', value: 'Drei Legionäre der Roten Kompanie' }, { label: 'Hausdienst', value: 'Eine Magd · zwei freie Laufburschenstellen · zwei Wachhunde' }],
    chartTitle: 'Vom Schalter bis zum Magazin', chartIntro: 'Ein Pfand verlässt das Magazin erst nach Gegenprüfung des Zettels. Die drei Legionäre sind zugewiesene Kompaniesöldner und bilden keine eigene Offiziershierarchie.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90, levels: [], trees: [
      branch('fuehrung', 'Führung', ['lucan', 'camilla', 'aerwen'].map(member)),
      branch('verwaltung', 'Verwaltung & Logistik', ['cadwyst', 'dewrys'].map(member)),
      branch('sicherheit', 'Sicherheit', ['hroald', 'kettil', 'rhydog'].map(member)),
      branch('sonstiges', 'Sonstiges', [member('eneth'), ...[1, 2].map(i => ({ id: `klaue-laufbursche-${i}`, title: 'Laufbursche', subtitle: `Freie Stelle ${i}`, portrait: '', text: '<p>Für Botengänge, kleine Besorgungen und die Zustellung verschlossener Mitteilungen vorgesehen; noch unbesetzt.</p>' })),
        ...KLAUE_DOGS.map(dog => ({ id: `klaue-${dog.key}`, title: dog.name, subtitle: dog.role, portrait: dog.portrait,
          text: `<p>${dog.bio}</p><p><a href="${dog.bestiaryReference.url}" target="_blank" rel="noopener">Bestiarium · ${dog.species}</a></p>` }))])
    ], footerNote: 'Aerwen ist Lucans Gemahlin und führt keinen Anteil am Geschäft gegen den Willen der Zwillinge. Die beiden Laufburschenstellen bleiben frei.' };
}
