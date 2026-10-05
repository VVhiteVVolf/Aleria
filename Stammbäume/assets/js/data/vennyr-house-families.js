import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { VENNYR_TERRITORIAL_HOUSES } from './vennyr-territorial-catalog.js';
import { getVennyrHouseProfile } from './vennyr-house-profiles.js';
import { HOUSE_BLODEUWEDD_FAMILY } from './house-blodeuwedd-family.js';
import { HOUSE_MORGANT_FAMILY } from './house-morgant-family.js';
import { HOUSE_SERENOC_FAMILY } from './house-serenoc-family.js';
import { HOUSE_MORLAIS_FAMILY } from './house-morlais-family.js';

import { HOUSE_CAERDYN_FAMILY } from './house-caerdyn-family.js';
import { HOUSE_DREWI_FAMILY } from './house-drewi-family.js';
import { HOUSE_GWANRHYD_FAMILY } from './house-gwanrhyd-family.js';
import { HOUSE_BOCHDEW_FAMILY } from './house-bochdew-family.js';
import { HOUSE_UDGORN_FAMILY } from './house-udgorn-family.js';
import { HOUSE_BALAURIC_FAMILY } from './house-balauric-family.js';
import { HOUSE_MORGRYN_FAMILY } from './house-morgryn-family.js';
import { HOUSE_GWENYEN_FAMILY } from './house-gwenyen-family.js';
import { HOUSE_CRWYNOG_FAMILY } from './house-crwynog-family.js';

const COMPLETED_FAMILIES = new Map([HOUSE_BLODEUWEDD_FAMILY, HOUSE_MORGANT_FAMILY, HOUSE_SERENOC_FAMILY, HOUSE_MORLAIS_FAMILY, HOUSE_CAERDYN_FAMILY, HOUSE_DREWI_FAMILY, HOUSE_GWANRHYD_FAMILY, HOUSE_BOCHDEW_FAMILY, HOUSE_UDGORN_FAMILY, HOUSE_BALAURIC_FAMILY, HOUSE_MORGRYN_FAMILY, HOUSE_GWENYEN_FAMILY, HOUSE_CRWYNOG_FAMILY]
  .map(family => [family.document.id, family]));

function createTerritorialHouseFamily(house) {
  const completed = COMPLETED_FAMILIES.get(house.familyId);
  if (completed) return completed;
  const houseProfile = getVennyrHouseProfile(house.familyId);
  const family = createBlankHouseFamily({
    id: house.familyId,
    title: `Haus ${house.name}`,
    emblem: house.emblemPath,
    houseProfile,
    description: `Haus ${house.name} mit Sitz in ${house.seat}, ${house.region}, Vennyr. Die Familiengeschichte wird gesondert ergänzt.`
  });
  return Object.freeze({
    ...family,
    extensions: Object.freeze({
      ...family.extensions,
      sourceRevision: 1,
      territorialSource: Object.freeze({
        attachmentId: house.attachmentId,
        row: house.sourceRow,
        column: house.sourceColumn
      }),
      sourceNote: 'Territoriale Hausakte nach der Vennyr-Oberherrschaftstabelle. Sitz, Oberherrschaft und Wappen sind belegt. Der Hausrang ist nicht vermerkt; Personen und Abstammungen folgen erst mit der gesonderten Stammbaumquelle.'
    })
  });
}

export const VENNYR_NEW_HOUSE_FAMILIES = Object.freeze(
  VENNYR_TERRITORIAL_HOUSES.filter(house => !house.existing).map(createTerritorialHouseFamily)
);
