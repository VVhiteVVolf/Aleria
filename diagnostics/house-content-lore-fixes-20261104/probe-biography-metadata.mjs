import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {withHouseBiographyDefault} from '../../Stammbäume/assets/js/modules/house-biography/house-biography-registry-default.js';
import {normalizeFamily} from '../../Stammbäume/assets/js/domain/family-schema.js';
import {resolveRegisteredFamilyUpgrade} from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
for(const id of ['haus-varulv','haus-feuerherz']) {
  const family=FAMILY_REGISTRY.find(row=>row.id===id).family;
  const current=family.extensions.houseBiographyModule;
  const registered=withHouseBiographyDefault(family,{[id]:{sourceRevision:family.extensions.sourceRevision+1,biography:current,replacedDefaultFingerprints:[]}});
  const local=normalizeFamily(family);
  local.document.houseProfile.seat='Mein lokaler Hofentwurf';
  const upgraded=resolveRegisteredFamilyUpgrade(registered,local);
  console.log(JSON.stringify({id,seatPreserved:upgraded.document.houseProfile.seat==='Mein lokaler Hofentwurf',beforeRevision:family.extensions.sourceRevision,afterRevision:registered.extensions.sourceRevision}));
}
