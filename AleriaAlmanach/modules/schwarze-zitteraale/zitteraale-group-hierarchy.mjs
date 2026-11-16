import { ZITTERAALE_ART, BRADHRITH_FORMER_MEMBERS } from './zitteraale-people.mjs';
import { UNTOTE_AELE_LIEUTENANTS } from './untote-aele-lieutenants.mjs';

const anonymousLeader = `${ZITTERAALE_ART}/portraits/rudelfuehrer.png`;
const raiderPortrait = index => index === 0 ? `${ZITTERAALE_ART}/portraits/komplize.png`
  : `${ZITTERAALE_ART}/groups/portraits/raider-${String(index + 1).padStart(2, '0')}-v1.png`;

export function buildZitteraaleGroupLeader(group) {
  return {
    id: group.leaderId, title: group.leaderName, subtitle: `⚑ Gruppenführer · Gruppe ${group.numeral}.`,
    portrait: group.leaderPortrait,
    text: 'Führt die Unterbande, bestimmt ihre Aufträge und verteilt Beute und Verstärkungen. Hält über die beiden Stellvertreter Verbindung zum Bandenhaupt.'
  };
}

function vacantMember(group, kind, index) {
  return {
    id: `${group.id}-${kind}-${index + 1}`, title: 'Unbesetzt',
    subtitle: kind === 'verstorben' ? '† Freier Erinnerungsplatz' : '↗ Freier ehemaliger Platz',
    portrait: raiderPortrait(index), text: 'Für eine spätere namentliche Zuordnung vorgesehen.'
  };
}

function formerMembers(group, deceased) {
  const count = deceased ? 8 : 4;
  const nodes = [];
  if (group.detailed && deceased) nodes.push({
    id: `${group.id}-erster-leutnant-gefallen`, title: 'Erster Leutnant · Name unbekannt', subtitle: '† Im Gefecht gegen Sir Rhys Draig gefallen',
    portrait: anonymousLeader, text: 'Die erste Leutnantstelle koordiniert einen Teil der Räuber und vertritt die Gruppenführung bei zugewiesenen Aufträgen.'
  });
  if (group.detailed) for (const person of BRADHRITH_FORMER_MEMBERS.filter(person => person.deceased === deceased)) nodes.push({
    id: person.id, title: person.name, subtitle: `${deceased ? '†' : '↗'} ${person.status}`, portrait: person.portrait,
    text: deceased ? 'Ein einfacher Räuber übernimmt Überfälle, Wachdienste und das Eintreiben der Forderungen.'
      : 'Die zweite Leutnantstelle führt den zugewiesenen Teil der Räuber und übernimmt die Befehlsweitergabe bei getrennten Einsätzen.'
  });
  return [...nodes, ...Array.from({ length: count - nodes.length }, (_, index) => vacantMember(group, deceased ? 'verstorben' : 'ehemalig', index))];
}

export function buildZitteraaleGroupHierarchy(group) {
  return {
    organizationTitle: group.name, eyebrow: `Schwarze Zitteraale · Gruppe ${group.numeral}.`,
    subtitle: 'Führung, Räuber und frühere Mitglieder', centerLabel: group.name, emblem: group.banner,
    sideImage: group.banner, motto: group.detailed ? 'Ein Zeichen für den Verfall.' : 'Gruppenname noch offen',
    description: group.detailed
      ? '<p>Ein Gruppenführer und zwei Leutnants führen das aktive Aufgebot. Nach den schweren Verlusten gegen Sir Rhys Draig wurden die Reihen mit Rekruten und Mitgliedern aus dem Bandenhauptquartier aufgefüllt.</p>'
      : '<p>Die Unterbande besitzt eigene Führung und ein vorbereitetes Aufgebot. Persönliche Besetzungen, Zuständigkeiten und Wirkungsgebiet sind noch offen.</p>',
    detailsTitle: 'Aufbau', details: [
      { icon: '⚑', label: 'Führung', value: 'Ein Gruppenführer und zwei Leutnants' },
      { icon: '⚔', label: 'Räuber', value: 'Sechzehn Plätze in vier Viererreihen' },
      { icon: '†', label: 'Verstorbene', value: 'Acht Plätze in zwei Viererreihen' },
      { icon: '↗', label: 'Ex-Mitglieder', value: 'Vier Plätze in einer Reihe' }
    ],
    chartTitle: 'Gruppenordnung', chartIntro: 'Die aktuellen Leutnantstellen stehen unter dem Gruppenführer. Verstorbene und Ex-Mitglieder besitzen eigene Reiter.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 92,
    trees: [
      { id: 'fuehrung', label: 'Führung und Räuber', parentTreeId: '', levels: [
        { label: 'Gruppenführung', nodes: [buildZitteraaleGroupLeader(group)] },
        { label: 'Leutnants', columns: 2, nodes: [1, 2].map(rank => ({
          id: `${group.id}-leutnant-${rank}`,
          title: group.detailed ? UNTOTE_AELE_LIEUTENANTS[rank - 1].title : `${rank === 1 ? 'Erster' : 'Zweiter'} Leutnant`,
          subtitle: group.detailed ? `⚑ ${UNTOTE_AELE_LIEUTENANTS[rank - 1].role}` : '⚑ Aktuelle Besetzung offen',
          portrait: group.detailed ? UNTOTE_AELE_LIEUTENANTS[rank - 1].portrait : anonymousLeader,
          text: 'Unterstützt die Gruppenführung und koordiniert die zugewiesenen Räuber. Übernimmt Einsatzführung, Wachen und Rückzug auf deren Auftrag.'
        })) },
        ...Array.from({ length: 4 }, (_, row) => ({ label: `Räuber · Reihe ${row + 1}`, columns: 4,
          nodes: Array.from({ length: 4 }, (_, column) => ({
            id: `${group.id}-raeuber-${row * 4 + column + 1}`, title: 'Schwarzer Zitteraal · Räuber', subtitle: '⚔ Unbenannt',
            portrait: raiderPortrait(row * 4 + column),
            text: 'Übernimmt bewaffnete Überfälle, Wachdienste und das Eintreiben von Forderungen innerhalb der zugewiesenen Schar.'
          })) }))
      ] },
      { id: 'verstorbene', label: 'Verstorbene', parentTreeId: '', levels: [{ label: 'Verstorbene · zwei Viererreihen', columns: 4, nodes: formerMembers(group, true) }] },
      { id: 'ex-mitglieder', label: 'Ex-Mitglieder', parentTreeId: '', levels: [{ label: 'Ex-Mitglieder · eine Viererreihe', columns: 4, nodes: formerMembers(group, false) }] }
    ], levels: [], footerNote: 'Unbesetzte Karten sind freie Plätze für die weitere Ausarbeitung.'
  };
}
