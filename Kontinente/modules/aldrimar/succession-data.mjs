import source from './succession.source.json' with { type:'json' };
import { personReference } from './royal-references.mjs';

export const succession={...source,
  monarchs:source.monarchs.map(monarch=>({...monarch,...personReference(monarch.familyId,monarch.id)})),
  earlyMonarchs:source.earlyMonarchs.map(monarch=>monarch.personId?{...monarch,...personReference('haus-vaeren',monarch.personId)}:monarch),
};
