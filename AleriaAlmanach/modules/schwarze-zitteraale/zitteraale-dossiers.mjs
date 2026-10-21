import { ZITTERAALE_ART, ZITTERAALE_EMBLEM, ZITTERAALE_LEADERS } from './zitteraale-people.mjs';
export const ZITTERAALE_KNIGHT_ICON = '/IconOrdner/Fazit%20Icons/Ritter.png';
export const ZITTERAALE_GOLD_ICON = '/AleriaAlmanach/public/assets/inventory/coins/goldtaler.png';
const threatLabels = ['Kampfkraft', 'Planung', 'Tarnung', 'Gefolgschaft', 'Fluchtgefahr'];

export function buildZitteraaleDossier(person) {
  const chief = person === ZITTERAALE_LEADERS[0];
  return { schemaVersion: 1, commentThreadKey: `zitteraale-akte-${person.id}`, pageTitle: `Krimi-Bio · ${person.name}`, bountyFilePage: true,
    image: person.sketch, description: `<p>${person.background}</p><p><strong>Persönlichkeit:</strong> ${person.character}</p><p><strong>Vorgehen:</strong> ${person.method}</p>`,
    bountyFile: { archiveTitle: person.name, archiveSubtitle: 'Marschallamt · Grafschaft Celtigerns Wacht', targetName: person.name,
      aliases: 'Bandenbeiname · wirklicher Name unbekannt', regionalBanner: '/IconOrdner/Fazit%20Icons/Krone.png', portraitImage: person.sketch, portraitScale: 100, portraitX: 50, portraitY: 30,
      status: 'Gesucht', statusNote: person.status, threatLevel: chief ? 5 : Math.max(3, 5 - ZITTERAALE_LEADERS.indexOf(person) % 3), threatText: 'Bewaffnet · nicht allein stellen',
      bountyAmount: person.bountyGold.toLocaleString('de-DE'), bountyCurrency: 'Goldtaler', coinImage: ZITTERAALE_GOLD_ICON,
      descriptionTitle: 'Personenbeschreibung', descriptionRows: [{ label: 'Alter', value: `Etwa ${person.age} Jahre` }, { label: 'Größe', value: person.height }, { label: 'Erkennungszeichen', value: person.appearance }],
      descriptionNote: 'Zeichnung nach Personenbeschreibungen. Kleidung und Auftreten können abweichen.',
      chargesTitle: 'Tatvorwürfe', charges: person.charges.map(title => ({ title, icon: '/IconOrdner/Fazit%20Icons/Schwert.png', text: '' })),
      traitsTitle: 'Verhalten', traits: person.traits.map(title => ({ title, icon: '', text: '' })),
      companionsTitle: chief ? 'Erkennbare Gefährten und Ausrüstung' : 'Weitere gesuchte Köpfe',
      companions: chief ? [{ title: 'Zunder', subtitle: 'Rhyfel-Hengst', image: `${ZITTERAALE_ART}/zunder.png`, text: 'Breitschultriger dunkelbrauner Hengst mit schwarzer Mähne und dichtem Fesselbehang.' },
        { title: 'Donnergrollen', subtitle: 'Starrer Morgenstern', image: `${ZITTERAALE_ART}/items/donnergrollen.png`, text: 'Dunkler Stachelkopf auf langem starren Schaft; kein Kettenflegel. Berichte über Funken sind unbestätigt.' }]
        : [{ title: ZITTERAALE_LEADERS[0].name, subtitle: 'Bandenhaupt', image: ZITTERAALE_LEADERS[0].sketch, text: 'Die übrigen Köpfe sind in eigenen Akten verzeichnet.' }],
      sightingsTitle: 'Bekannter Fahndungsraum', sightings: chief ? [{ place: 'Lysfaen', date: '1739 · letzter überlieferter Stand', observer: 'Ältere Fahndungsakte' }]
        : [{ place: 'Celtigerns Wacht', date: 'Gegenwärtiger Aufenthaltsort unbekannt', observer: 'Marschallamt' }],
      connectionsTitle: 'Verbindungen und Zugehörigkeit', factionTitle: 'Bande', factionBanner: ZITTERAALE_EMBLEM, factionName: 'Die Schwarzen Zitteraale', factionText: person.role,
      alliesTitle: 'Gesuchte Mitbeschuldigte', allies: ZITTERAALE_LEADERS.filter(other => other.id !== person.id).map(other => ({ title: other.name, subtitle: other.role, image: other.sketch, text: '' })),
      enemiesTitle: 'Verfolgende Obrigkeit', enemies: [{ title: 'Sir Egon Gafyr', subtitle: 'Marschall der Grafschaft', image: '/IconOrdner/Fazit%20Icons/Ritter.png', text: 'Entgegennahme und Prüfung beim Marschallamt.' }],
      supportersTitle: 'Ermittlungsstand', supporters: [{ title: 'Verdacht ist kein Nachweis', image: '/IconOrdner/ReiterIcons/Weltpfade/kriminalitaet.png', text: 'Die Anhörung zum Bradrhith-Hof berührt Kontakte zur Familie Gwregysdu. Daraus folgt keine festgestellte Beteiligung aller Familienangehörigen.' }],
      dangerTitle: 'Gefährdungsprofil', dangerProfiles: person.danger.map((value, i) => ({ label: threatLabels[i], value, icon: '' })),
      handoverNote: chief ? '35 Goldtaler nach bestätigter Ergreifung oder zweifelsfreiem Todesnachweis. Als weitere Belohnung ist ein Ritterschlag ausgeschrieben; Verleihung durch die zuständige Herrschaft.' : 'Lebendige Übergabe an die zuständige Obrigkeit bevorzugt. Identität und Tatbeteiligung werden vor Auszahlung geprüft.',
      footer: 'Marschallamt · Fahndungsakten · Kein bestätigter Aufenthaltsort' } };
}
