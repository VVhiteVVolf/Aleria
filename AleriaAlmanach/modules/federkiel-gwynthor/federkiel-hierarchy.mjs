import { buildTradingPostHierarchy } from '../guild-trading-post/trading-post-hierarchy.mjs';
import { FEDERKIEL_BANNKREIS_COURIERS } from './federkiel-couriers.mjs';
import { FEDERKIEL_PLACES } from './federkiel-places.mjs';
import { FEDERKIEL_ART, FEDERKIEL_GUILD_EMBLEM, federkielSceneImage } from './federkiel-section.mjs';

function role(title, text, silhouette = 'leitung') {
  return { title, text, portrait: `${FEDERKIEL_ART}/roles/silhouette-${silhouette}-v1.webp` };
}

function crew(label, count, title, text, silhouette, occupants = []) {
  return {
    label,
    columns: count,
    nodes: Array.from({ length: count }, (_, index) => {
      const place = role(title, text, silhouette);
      const occupant = occupants[index];
      return occupant ? { ...place, subtitle: occupant.name, portrait: occupant.portrait } : place;
    })
  };
}

function leadLevel(label, title, text) {
  return { label, nodes: [role(title, text)] };
}

function tree(id, label, levels, parentTreeId = '') {
  return { id, label, levels, parentTreeId };
}

function hierarchy({ id, title, subtitle, description, details, chartIntro, trees }) {
  return buildTradingPostHierarchy({
    title, subtitle, description, chartIntro, trees,
    emblem: FEDERKIEL_GUILD_EMBLEM,
    sideImage: federkielSceneImage(id),
    motto: 'Gilde Federkiel · Gwynthor',
    details: details.map(([label, value]) => ({ label, value })),
    chartTitle: 'Leitung und Dienststellen'
  });
}

export function buildFederkielGuildHierarchy() {
  return hierarchy({
    id: 'gildenleitung',
    title: 'Die Gwynthorer Gildenleitung',
    subtitle: 'Verantwortung für die Poststellen der Stadt',
    description: '<p>Die Gwynthorer Gildenleitung legt fest, wann die Zentralpost annimmt, welche Abgänge Vorrang haben und wie die fünf Betriebsstellen zusammenarbeiten. Sie vereinbart mit Nachbarstationen die Übergaben der Fernpost und setzt den günstigen Grundtarif für gewöhnliche Briefe vor Ort um.</p>',
    details: [['Geltungsbereich', 'Gwynthors Federkiel-Betrieb'], ['Anschlüsse', 'Poststationen in Cenyr und jenseits des Königreichs'], ['Grundauftrag', 'Bezahlbare Briefe und Zugang zu Schreib- und Lesediensten']],
    chartIntro: 'Die Gildenleitung verantwortet den Standort. Die Stellvertretung koordiniert in ihrem Auftrag die fünf gleichrangigen Betriebsleitungen. Diese führen ihre eigenen Arbeitsbereiche.',
    trees: [tree('gildenleitung', 'Gwynthorer Leitung', [
      leadLevel('Gildenleitung', 'Gildenmeisteramt', 'Verantwortet den Standort, setzt die örtliche Dienstordnung fest und schließt Übergabevereinbarungen mit anderen Poststellen.'),
      leadLevel('Stellvertretung', 'Stellvertretende Gildenleitung', 'Koordiniert die Leitungen im Tagesgeschäft, klärt Engpässe zwischen den Betriebsstellen und vertritt das Gildenmeisteramt.'),
      { label: 'Fünf gleichrangige Betriebsleitungen', columns: 3, nodes: FEDERKIEL_PLACES.map(({ lead }) => role(lead.title, lead.text)) }
    ])]
  });
}

function postzentrale(lead) {
  return [
    tree('schalterdienst', 'Postleitung und Schalter', [lead,
      leadLevel('Schalteraufsicht', 'Schaltervorsteher', 'Teilt die Schalter ein, prüft die Portobelege und übernimmt Rückfragen, die am Schalter offenbleiben.'),
      crew('Vier gleichwertige Schalter', 4, 'Schalterkraft', 'Nimmt Briefe an, ermittelt Porto und nächsten Abgang und gibt hinterlegte Post an die berechtigte Person aus.', 'schreibdienst')
    ]),
    tree('sortierdienst', 'Sortierung', [
      leadLevel('Aufsicht der Sortierung', 'Sortiervorsteher', 'Ordnet die Abgangsfächer, prüft Begleitlisten und legt ungeklärte Adressen der Postleitung vor.'),
      crew('Sortierdienst', 4, 'Sortierkraft', 'Verteilt Briefe auf die richtigen Abgänge, gleicht die Anzahl ab und versiegelt die gefüllten Postsäcke zur Übergabe.', 'schreibdienst')
    ], 'schalterdienst')
  ];
}

function schreibstube(lead) {
  return [tree('schreibdienst', 'Leitung und Schreibdienst', [lead,
    leadLevel('Dienstaufsicht', 'Schreibdienstvorsteher', 'Teilt die Schreibplätze und stillen Nischen ein. Hilft bei schwierigen Anschriften und sorgt dafür, dass Schreibmaterial bereitliegt.'),
    crew('Schreiben und Vorlesen', 4, 'Schreibkraft', 'Hilft am Schreibplatz, setzt diktierte Briefe auf und liest Nachrichten vertraulich vor. Liest einen Entwurf auf Wunsch zur Freigabe zurück.', 'schreibdienst')
  ])];
}

function druckerei(lead) {
  return [
    tree('satz', 'Druckereileitung und Satz', [lead,
      leadLevel('Aufsicht im Satz', 'Satzmeister', 'Verteilt die Vorlagen, prüft den Korrekturabzug und übergibt den freigegebenen Satz für die Presse.'),
      crew('Satzdienst', 4, 'Setzer', 'Setzt die Lettern nach Vorlage, zieht einen Abzug und bessert beanstandete Stellen aus.', 'werkdienst')
    ]),
    tree('pressen', 'Pressen und Druckbögen', [
      leadLevel('Aufsicht an den Pressen', 'Druckmeister', 'Teilt die Pressen ein, prüft die Druckqualität und zählt die fertigen Auflagen für die Verteilung.'),
      crew('Pressendienst', 4, 'Druckkraft', 'Färbt den Satz ein, führt Papier und Presse und legt fertige Bögen zum Trocknen aus.', 'werkdienst')
    ], 'satz')
  ];
}

function kurierstation(lead) {
  const staffeln = [
    { label: 'Staffel I', route: 'Stadtwege und Stadttore' },
    { label: 'Staffel II', route: 'Orte im Bannkreis', occupants: FEDERKIEL_BANNKREIS_COURIERS },
    { label: 'Staffel III', route: 'Anschluss zur Fernpost' }
  ];
  const staffelLevels = staffeln.flatMap(({ label, route, occupants }, index) => [
    {
      ...leadLevel(`${label} · ${route}`, 'Staffelführung',
        'Teilt die vier Postkuriere der Staffel ein, bestätigt die Übernahmen und meldet Ausfälle oder Verspätungen der Stationsleitung.'),
      startsGroup: index > 0
    },
    crew(`Postkuriere · ${label}`, 4, 'Postkurier',
      'Übernimmt versiegelte Sendungen, stellt sie auf dem zugewiesenen Weg zu oder übergibt sie an die nächste Station. Vermerkt die Übergabe und meldet Hindernisse an die Staffelführung.', 'postkurier', occupants)
  ]);
  return [
    tree('staffeln', 'Stationsleitung und Staffeln', [lead, ...staffelLevels]),
    tree('gestuet', 'Gestüt', [
      leadLevel('Stallaufsicht', 'Stallmeister', 'Bestimmt den Wechsel und die Ruhe der Pferde, prüft die Einsatzfähigkeit und meldet freie Tiere an die Stationsleitung.'),
      crew('Stalldienst', 4, 'Stallkraft', 'Füttert, tränkt und striegelt die Pferde, richtet das Sattelzeug und nimmt Rückkehrer am Hof an.', 'werkdienst')
    ], 'staffeln')
  ];
}

function lager(lead) {
  return [
    tree('umschlag', 'Lagerleitung und Umschlag', [lead,
      leadLevel('Aufsicht am Wagenportal', 'Umschlagvorsteher', 'Überwacht Annahme und Ausgabe am Tor, prüft Übergabebelege und meldet beschädigte Siegel der Lagerleitung.'),
      crew('Postsäcke und Abgänge', 4, 'Lagerkraft', 'Übernimmt Postsäcke nach Liste, stellt sie in die Abgangsfächer und reicht sie gegen Eintrag an die zuständige Staffel weiter.', 'werkdienst')
    ]),
    tree('verwahrung', 'Verwahrung und Vorräte', [
      leadLevel('Aufsicht im Innenlager', 'Bestandsvorsteher', 'Verwaltet Vorratsbuch und Schließfächer. Gibt Rückläufer nach Entscheidung der Postleitung für den nächsten Weg frei.'),
      crew('Innenlager', 4, 'Lagerkraft', 'Lagert Rückläufer in zugewiesenen Fächern, zählt Vorräte und gibt Papier, Postsäcke und Siegelmaterial an die Betriebsstellen aus.', 'werkdienst')
    ], 'umschlag')
  ];
}

const workplaces = {
  postzentrale: [postzentrale, 'Schaltervorsteher und Sortiervorsteher berichten an die Postleitung. Jede Aufsicht führt vier gleichrangige Dienstplätze.'],
  schreibstube: [schreibstube, 'Die Leitung verantwortet die Stube. Der Schreibdienstvorsteher koordiniert vier gleichrangige Schreibkräfte.'],
  druckerei: [druckerei, 'Satzmeister und Druckmeister leiten ihre Arbeitsbereiche unter der gemeinsamen Druckereileitung.'],
  kurierstation: [kurierstation, 'Alle drei Staffelführungen und der Stallmeister berichten direkt an die Stationsleitung. Jede Staffelführung führt die vier Postkuriere ihrer eigenen Staffel.'],
  lager: [lager, 'Umschlag und Innenlager haben je eine Aufsicht mit vier Lagerkräften. Beide Aufsichten melden an die Lagerleitung.']
};

export function buildFederkielPlaceHierarchy(place) {
  const [buildTrees, chartIntro] = workplaces[place.id];
  const model = hierarchy({
    ...place, description: `<p>${place.description}</p>`, chartIntro,
    trees: buildTrees(leadLevel('Betriebsleitung', place.lead.title, place.lead.text))
  });
  return { ...model, chartScale: 75, portraitScale: 96, cardFontScale: 118 };
}
