import { getCombatStyle } from '../../modules/combat-styles/combat-style-registry.js';
import { getSirenentanzBasicTechniques } from '../../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../../modules/combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { getHuskarlBasicTechniques } from '../../modules/combat-styles/huskarl/huskarl-basic-techniques.js';
import { getHuskarlExpertTechniques } from '../../modules/combat-styles/huskarl/huskarl-expert-techniques.js';

export function getBalanceCatalog() {
  return [...getCombatStyle('drachentanz').forms.flatMap(form => form.techniques),
    ...['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr']
      .flatMap(id => [...getSirenentanzBasicTechniques(id), ...getSirenentanzExpertTechniques(id)]),
    ...['hird-maid', 'skjoldr', 'skytte', 'thegnar', 'skeidr', 'skjaldr']
      .flatMap(id => [...getHuskarlBasicTechniques(id), ...getHuskarlExpertTechniques(id)])];
}
