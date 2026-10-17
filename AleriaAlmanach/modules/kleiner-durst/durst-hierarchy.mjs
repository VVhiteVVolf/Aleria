import { DURST_ART, RHWYD_EMBLEM, RHWYD_MOTTO, DURST_MAID, DURST_DOG, durstPerson } from './durst-people.mjs';
const member = p => ({ id: `durst-${p.key}`, title: p.name, subtitle: p.role, portrait: p.portrait,
  text: `<p>${p.bio}</p>${p.bestiaryReference ? `<p><a href="${p.bestiaryReference.url}" target="_blank" rel="noopener">Bestiarium · ${p.bestiaryReference.name}</a></p>` : ''}` });
const level = (label, ...keys) => ({ label, nodes: keys.map(key => member(durstPerson(key))) });
export function buildDurstHierarchy() {
  return { organizationTitle: 'Die wenigen Hände des Hauses', eyebrow: 'Zum Kleinen Durst',
    subtitle: 'Fünf Familienangehörige · eine angestellte Magd', centerLabel: 'Efa und Iorwerth Rhwyd',
    emblem: RHWYD_EMBLEM, sideImage: `${DURST_ART}/scenes/schankstube.png`, motto: RHWYD_MOTTO,
    description: '<p>Hier trägt kaum jemand nur eine Aufgabe. Die Rhwyd halten die Kneipe gemeinsam offen; Carys ist ihre einzige Angestellte. Für einen Wachmann reicht das Geld nicht.</p>',
    detailsTitle: 'Der ganze Betrieb', details: [{ label: 'Inhaber', value: 'Efa und Iorwerth' }, { label: 'Familie im Alltag', value: 'Meleri, Nia und Dewi' },
      { label: 'Angestellte', value: 'Eine Magd · Carys' }, { label: 'Schankraum', value: 'Fünf kleine Tische · etwa zwanzig Plätze' }, { label: 'Wachmann', value: 'Keiner' }, { label: 'Zimmervermietung', value: 'Keine' }],
    chartTitle: 'Tresen, Herd und Hausarbeit', chartIntro: 'Die Bereiche teilen Arbeit ein; sie schaffen keine zusätzlichen Stellen. Bram ist der alte Hund der Hausgemeinschaft und ersetzt längst keine Wache mehr.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90,
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [level('Mutter und Sohn · gemeinsam verantwortlich', 'efa', 'iorwerth')] },
      { id: 'kueche-schank', label: 'Küche und Schank', parentTreeId: 'fuehrung', levels: [level('Am Herd', 'nia'), level('An den Tischen', 'meleri')] },
      { id: 'hausdienst', label: 'Hausdienst und Kaminplatz', parentTreeId: 'fuehrung', levels: [
        { label: 'Die einzige Angestellte', nodes: [member(DURST_MAID)] }, level('Hilft überall mit', 'dewi'),
        { label: 'Der alte Wachhund · kein bezahlter Posten', nodes: [member(DURST_DOG)] }
      ] }
    ], levels: [], footerNote: 'Gethin und die vier 1720 gefallenen Brüder gehören zur Familiengeschichte und zum Stammbaum. Sie tragen keine heutigen Dienstposten.'
  };
}
