import { prepareOfficePlan } from './office-plan-assembly.mjs';

export const CAMRUISGE_SCOPE = 'camruisge';
export const ABERLLAN_LEAD = 'aberllan/leitung';
export const ABERLLAN_COUNTY_POST = 'lehenswarte/lehenswart-aberllan';

const cooperation = [
  ['militaer', 'Militär', 'command', 'Stimmt Fragen der Inselsicherheit mit der jeweils zuständigen Seite ab.'],
  ['klerus', 'Klerus', 'faith', 'Hält Verbindung zwischen den geistlichen Stellen beider Inselhälften.'],
  ['gerichtsbarkeit', 'Gerichtsbarkeit', 'justice', 'Leitet Angelegenheiten an die für den jeweiligen Inselteil zuständigen Stellen.'],
  ['finanzen', 'Finanzen', 'money', 'Stimmt gemeinsame Aufwendungen und Beiträge mit beiden Verwaltungen ab.'],
  ['spionage', 'Nachrichtenwesen', 'secrecy', 'Übermittelt freigegebene Meldungen zwischen den beiden Verwaltungen.'],
  ['diplomatie', 'Diplomatie', 'diplomacy', 'Bereitet Absprachen über gemeinsame Angelegenheiten der Insel vor.'],
  ['magie', 'Magie', 'arcane', 'Vermittelt bei arkanen Angelegenheiten an die zuständigen Stellen.'],
];

function recurring(id, title, count, kind, description) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index + 1}`, title, kind, description, templateId: `r-${id}`,
  }));
}

function localAdministration(branch) {
  return {
    id: 'ortsverwaltung', title: 'Örtliche Verwaltung', icon: 'records', repeatableHere: true,
    slots: [
      ...recurring('amtstraeger', 'Amtsträger', 4, 'other', 'Die genaue Amtsbezeichnung kann im Entwurf eingetragen werden.'),
      ...recurring('hofherr', 'Hofherr', 2, 'other', `Vertritt den zugeordneten Hof im Zuständigkeitsbereich von ${branch.name}.`),
    ],
  };
}

const northernForces = [
  { id: 'hausaufgebot', title: 'Hausaufgebot · Ritter und Gefolge', icon: 'arms', repeatableHere: true, slots: [
    { id: 'kommandant-hausmacht', title: 'Kommandant der Hausmacht', description: 'Führt das Aufgebot des Hauses Garrael.' },
    ...recurring('hausritter', 'Hausritter', 3, 'other', 'Dient im Aufgebot des Hauses Garrael.'),
    ...recurring('waffenknecht', 'Waffenknecht der Hausmacht', 2, 'service', 'Versieht den Dienst im eigenen Aufgebot des Hauses.'),
    ...recurring('knappe', 'Knappe', 1, 'service', 'Lernt im Gefolge eines Hausritters.'),
    ...recurring('page', 'Page', 1, 'service', 'Lernt den Hausdienst und unterstützt das Gefolge.'),
  ] },
  { id: 'stadtwache', title: 'Stadtwache von Aberllan', icon: 'watch', repeatableHere: true, slots: [
    { id: 'wachhauptmann', title: 'Hauptmann der Stadtwache', description: 'Leitet die Ortswache der Stadt Aberllan.' },
    ...recurring('stadtwache', 'Stadtwache', 3, 'service', 'Versieht den örtlichen Wachdienst in Aberllan.'),
  ] },
];

export function buildCamruisgePlans(house) {
  const definitions = house.branches.map(branch => [branch.id, {
    head: {
      title: branch.title, place: branch.name, description: branch.description, holder: branch.holder,
      reportsTo: branch.authority, ...(branch.titleVariants ? { titleVariants: branch.titleVariants } : {}),
    },
    sections: [localAdministration(branch), ...(branch.id === 'aberllan' ? northernForces : [])],
  }]);
  definitions.push(['inselabstimmung', {
    sections: [{ title: 'Abstimmung der beiden Verwaltungen', icon: 'coordination', slots: cooperation
      .map(([id, title, icon, description]) => ({ id, title: `Verbindung · ${title}`, icon, description })) }],
  }]);
  return Object.fromEntries(definitions.map(([id, definition]) => [id, prepareOfficePlan(house, id, definition, new Map())]));
}
