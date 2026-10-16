import { getCombatStyle } from './combat-style-registry.js';
import { getSirenentanzBasicTechniques } from './sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from './sirenentanz/sirenentanz-expert-techniques.js';
import { getHuskarlBasicTechniques } from './huskarl/huskarl-basic-techniques.js';
import { getHuskarlExpertTechniques } from './huskarl/huskarl-expert-techniques.js';

// Whole authored pool, including currently locked drafts. Does not grant access.
export function listCombatTechniqueCatalog() {
  return [...getCombatStyle('drachentanz').forms.flatMap(form => form.techniques),
    ...['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr']
      .flatMap(id => [...getSirenentanzBasicTechniques(id), ...getSirenentanzExpertTechniques(id)]),
    ...['hird-maid', 'skjoldr', 'skytte', 'thegnar', 'skeidr', 'skjaldr', 'skalde']
      .flatMap(id => [...getHuskarlBasicTechniques(id), ...getHuskarlExpertTechniques(id)])];
}
