import { PENRUDD_MOTTO } from './penrudd-household.mjs';
import { TOR_EMBLEM, TOR_FAMILY_LINK, penruddPerson } from './tor-people.mjs';
import { torSceneImage } from './tor-rooms.mjs';

function member(key, role) {
  const person = penruddPerson(key);
  return { id: `tor-${person.id}`, title: person.name, subtitle: role || person.role, portrait: person.portrait,
    text: `<p>${person.bio}</p><p><a href="${TOR_FAMILY_LINK}&amp;person=${person.id}" target="_blank" rel="noopener">Zur vorhandenen Familienakte</a></p>` };
}
const vacancy = (id, role, text) => ({ id: `tor-frei-${id}`, title: 'Freier Posten', subtitle: `${role} · unbesetzt`, portrait: '', text: `<p>${text}</p>` });
const level = (label, nodes) => ({ label, nodes });

export function buildTorHierarchy() {
  return {
    organizationTitle: 'Die Hände am Roten Tor', eyebrow: 'Haus Penrudd', subtitle: 'Acht erwachsene Familienmitglieder im Betrieb',
    centerLabel: 'Carwyn Penrudd und Olwen', emblem: TOR_EMBLEM, sideImage: torSceneImage('schankstube'), motto: PENRUDD_MOTTO,
    description: '<p>Carwyn und Olwen teilen die Verantwortung. Die Familienmitglieder wechseln einander ab; mehrere Aufgaben bedeuten keine mehrfachen Dienststellen. Cerys hilft in abgestimmten Teilzeiten, damit die Versorgung ihres kleinen Sohnes Rhys gesichert bleibt.</p>',
    detailsTitle: 'Ein überschaubares Haus', details: [
      { label: 'Schankplätze', value: '36 an sechs Tischen' }, { label: 'Herberge', value: 'Zwei Einzel- und vier Doppelkammern · zehn Betten' },
      { label: 'Gastpferde', value: 'Zehn Stallplätze' }, { label: 'Wagenhof', value: 'Vier Wagenplätze' },
      { label: 'Zusätzliche Stellen', value: 'Drei ausdrücklich unbesetzte Posten' }, { label: 'Lieferhof', value: 'Eigenständiger Haushalt · nicht Teil der Belegschaft' }
    ],
    chartTitle: 'Vom Herd bis zum Hoftor', chartIntro: 'Gwilym und Enid stehen im Altenteil. Kinder haben keine regulären Posten. Die Hofverwandten liefern gegen Bezahlung und erscheinen deshalb nicht als Personal der Herberge.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90, levels: [],
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [level('Die heutige Leitung', [member('carwyn', 'Wirt · Ausschank, Einkauf und Gäste'), member('olwen', 'Köchin · Küche und Hauswirtschaft')])] },
      { id: 'schank-empfang', label: 'Schank & Empfang', parentTreeId: 'fuehrung', levels: [level('An Tresen und Tischen', [member('rhosyn', 'Schank und Bedienung'), member('mared', 'Empfang · Zimmer und Rechnungsbuch')])] },
      { id: 'kueche', label: 'Küche', parentTreeId: 'fuehrung', levels: [
        level('Olwens Herd', [member('olwen', 'Köchin · Küche und Hauswirtschaft')]),
        level('Frühstück und Unterstützung', [member('cerys', 'Gästeversorgung und Frühstück · Teilzeit'), vacancy('kuechenhilfe', 'Küchenhilfe', 'Vorgesehene zusätzliche Hand für Spüle und Vorarbeiten. Gegenwärtig übernimmt die Familie diese Aufgaben im Wechsel.')])
      ] },
      { id: 'herberge', label: 'Herberge', parentTreeId: 'fuehrung', levels: [
        level('Kammern und Leinen', [member('ffion', 'Gästezimmer und Wäsche'), member('mared', 'Empfang · Zimmer und Rechnungsbuch')]),
        level('Zusätzliche Hilfe', [vacancy('kammermagd', 'Kammermagd', 'Unbesetzte Unterstützung für Zimmerpflege, Wasser und Leinen. Es arbeitet derzeit keine zusätzliche anonyme Magd im Haus.')])
      ] },
      { id: 'stall-waren', label: 'Stall & Waren', parentTreeId: 'fuehrung', levels: [level('Pferde, Fuhrwerk und Vorrat', [member('aled', 'Stall und Wagenhof'), member('hywel', 'Keller · Lieferannahme und Instandhaltung')])] },
      { id: 'sicherheit', label: 'Sicherheit', parentTreeId: 'fuehrung', levels: [level('Kein eigener Wachmann beschäftigt', [vacancy('nachtwache', 'Nachtwache', 'Ein möglicher zusätzlicher Nachtposten ist unbesetzt. Die Familie schließt das Hoftor und verwahrt Schlüssel; das Haus verspricht keine ständig bewachte Warenlagerung. Bei ernsten Vorfällen wird Hilfe der zuständigen Wache gerufen.')])] }
    ],
    footerNote: 'Gästepferde sind anvertraute Tiere und keine verkäuflichen Zuchttiere oder Haustiere der Familie. Tudurs Hofzweig bleibt organisatorisch und wirtschaftlich selbstständig.'
  };
}
