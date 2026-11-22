import { ZITTERAALE_ART, ZITTERAALE_EMBLEM, ZITTERAALE_LEADERS, ZITTERAALE_DEPUTIES, ZITTERAALE_CONTACT, ZITTERAALE_GROUPS } from './zitteraale-people.mjs';
import { buildZitteraaleGroupLeader } from './zitteraale-group-hierarchy.mjs';

const office = (person, text) => ({ id: person.characterId, title: person.name, subtitle: person.role, portrait: person.portrait, text });

export function buildZitteraaleHierarchy() {
  return {
    organizationTitle: 'Die Schwarzen Zitteraale', eyebrow: 'Raubritter · Führung und Unterbanden',
    subtitle: 'Ein Bandenführer · zwei Stellvertreter · acht Unterbanden', centerLabel: 'Der Schwarze Zitteraal',
    emblem: ZITTERAALE_EMBLEM, sideImage: `${ZITTERAALE_ART}/scenes/hauptquartier.png`, motto: 'Im trüben Wasser bleibt kein Name.',
    description: '<p>Der Schwarze Zitteraal steht an der Spitze. Seine beiden Stellvertreter stimmen die Aufträge und Verstärkungen der acht großen Unterbanden ab. Jede Gruppe besitzt einen eigenen Führer und eine eigene Gruppenakte.</p>',
    detailsTitle: 'Bandenordnung', details: [
      { icon: '⚑', label: 'Bandenhaupt', value: 'Der Schwarze Zitteraal' },
      { icon: '⚔', label: 'Stellvertretung', value: 'Der Schinder und der Eidlose' },
      { icon: '⚑', label: 'Unterbanden', value: 'Acht Gruppen mit eigener Führung' },
      { icon: '✉', label: 'Verbindungen', value: 'Llineth · Kundschaft und Abnehmer' }
    ],
    chartTitle: 'Führung und Gruppen', treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 92,
    chartIntro: 'Der Reiter Gruppen zeigt die acht Banner und führt zu den jeweiligen Gruppenakten.',
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [
        { label: 'Bandenführer', nodes: [office(ZITTERAALE_LEADERS[0], 'Bestimmt die gemeinsamen Ziele, bestätigt größere Vorhaben und entscheidet über Beuteverteilung und Gefolgschaft.')] },
        { label: 'Stellvertreter', columns: 2, nodes: ZITTERAALE_DEPUTIES.map(person => office(person,
          'Vertritt das Bandenhaupt bei der Koordination der Unterbanden. Gibt Aufträge weiter und stimmt bewaffnete Einsätze und Verstärkungen ab.')) },
        { label: 'Rädelsführer der acht Unterbanden', columns: 4, nodes: ZITTERAALE_GROUPS.map(buildZitteraaleGroupLeader) }
      ] },
      { id: 'gruppen', label: 'Gruppen', parentTreeId: 'fuehrung', levels: [{ label: 'Acht Gruppen · zwei Viererreihen', columns: 4,
        nodes: ZITTERAALE_GROUPS.map(group => ({
          id: group.id, title: group.name, subtitle: `⚑ Gruppe ${group.numeral}.`, portrait: group.banner,
          text: `<p>${group.summary || (group.detailed ? 'Eine der ältesten Unterbanden der Schwarzen Zitteraale, geführt von Medrawd Angau.' : 'Gruppenname, Wirkungsgebiet und persönliche Besetzung sind noch offen.')}</p><p><a href="/AleriaAlmanach/AleriaAlmanach.html?entry=${group.id}">Gruppenakte öffnen</a></p>`
        })) }] },
      { id: 'verbindungen', label: 'Verbindungen', parentTreeId: 'fuehrung', levels: [{ label: 'Kundschaft und Kontakte', nodes: [office(ZITTERAALE_CONTACT,
        'Pflegt Verbindungen zu Kundschaftern, Boten und Abnehmern. Bündelt eingehende Hinweise und bereitet deren Weitergabe an die Führung vor.')] }] }
    ], levels: [], footerNote: 'Die einzelnen Gruppenakten enthalten Führung, Räuber, Verstorbene, Ex-Mitglieder und eine eigene Hauptquartiersszene.'
  };
}
