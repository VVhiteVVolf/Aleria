import { geographicKey } from '../world-directory/geographic-key.mjs';

const offices = {
  gerichtsbarkeit: {
    id: 'landrichter', title: 'Landrichter', heading: 'Landrichter der Orte', icon: 'justice',
    summary: 'Jeder Ort hat einen Landrichter. Die örtlichen Gerichtsdienste arbeiten unter seiner Leitung.',
    duty: 'Leitet das örtliche Gericht und teilt die Gerichtsdienste des Ortes ein.',
  },
  finanzen: {
    id: 'rentmeister', title: 'Rentmeister', heading: 'Rentmeister der Orte', icon: 'money',
    summary: 'Jeder Ort hat einen Rentmeister. Eintreiber, Zöllner und Schreiber unterstehen dem jeweiligen Rentamt.',
    duty: 'Führt die örtliche Kasse und Abgabenrechnung und koordiniert die Bediensteten seines Rentamts.',
  },
  spionage: {
    id: 'zelle', title: 'Zellenführer', heading: 'Örtliche Zellen und Meldestellen', icon: 'scouting',
    summary: 'Jeder Ort hat eine Zellenleitung. Agenten, Spione und Kuriere unterstützen die zuständigen Stellen.',
    duty: 'Leitet die Meldestelle des Ortes und berichtet an den zuständigen Netzmeister.',
  },
};

export function localOfficeSection(area, places) {
  const office = offices[area];
  const { id, heading: title, icon, summary: description } = office;
  return {
    id, title, icon, description,
    slots: places.map(({ name }) => ({
      id: `${id}-${geographicKey(name)}`, title: `${office.title} von ${name}`, description: office.duty, place: name,
    })),
  };
}

const settlementType = /siedlung$|stadt$|^(?:Dorf|Weiler|Flecken)$/iu;
export const isSettlement = place => settlementType.test(place.type);

export function deaconSection(places, description = '') {
  return {
    title: 'Diakone der Siedlungen', icon: 'faith', description,
    slots: places.filter(isSettlement).map(({ name }) => ({
      id: `diakon-${geographicKey(name)}`, title: `Diakon von ${name}`, place: name,
      description: `Leitet die Ortskirche in ${name} und berichtet an die zuständige kirchliche Leitung.`,
    })),
  };
}

export function suitableLocalities(plan, template) {
  return plan.localities.filter(place => !place.placements || place.placements.includes(template?.placement));
}
