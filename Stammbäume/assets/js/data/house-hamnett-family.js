import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson } from './family-record-builders.js';
import { HAMNETT_EMBLEM, HAMNETT_HOUSE_PROFILE } from './hamnett-house-profile.js';
import { getPatrickBiographySource, getPatrickBiographyPersonFields, buildPatrickBiographyModule } from '../../../../AleriaAlmanach/modules/patrick-biographies/biography-source.mjs';

const source=getPatrickBiographySource('unknown-cadogan-spouse');
const base=createBlankHouseFamily({id:'haus-hamnett',title:'Haus Hamnett',emblem:HAMNETT_EMBLEM,houseProfile:HAMNETT_HOUSE_PROFILE,
  description:'Bürgerliches Künstlerhaus von der Silberinsel. Gwen Hamnett ist als geborene Angehörige belegt und lebt mit ihrer Familie in Gwynthor. Ein genauer Haussitz und frühere Generationen sind nicht überliefert.'});

export const HOUSE_HAMNETT_FAMILY=Object.freeze({...base,
  persons:[createFamilyPerson({id:source.personId,worldPersonId:source.worldPersonId,...getPatrickBiographyPersonFields(source.key),
    houseId:'house-hamnett',familyRole:'core',lineageRole:'branch',
    notes:'Malerin von den Silberinseln; lebt in Gwynthor. Ihre Ehe mit Cadogan und die beiden Töchter werden in der bestehenden Sgrechiwr-Akte geführt.',
    extensions:{biographyModule:buildPatrickBiographyModule(source.key)}})],
  // No founder, parents, additional people or second marriage are inferred.
  partnerships:[],parentages:[],cadetBranches:[],timeJumps:[],
  lineage:{...base.lineage,crestFrame:'iron'},view:{...base.view,focusPersonId:source.personId},
  extensions:{...base.extensions,blankFamily:false,sourceRevision:1,
    sourceNote:'Hausanlage nach ausdrücklicher Nutzeranweisung vom 3. November 2026. Nur die vorhandene Gwen-Weltperson wird als geborene Angehörige projiziert. Aktueller Wohnsitz Gwynthor und Sgrechiwr-Ehe/Kindschaften bleiben dort erhalten. Geschäftsbeziehungen mit Neidr begründen keine erfundene Lehnsherrschaft.'}
});
