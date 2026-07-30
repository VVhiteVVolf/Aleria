import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

// Die bereitgestellte Ua-Fhàire-Quelle zeigt ausschließlich veraltete
// Portraitfassungen. Sie werden nicht importiert. Nur Personen, die bereits in
// ausgearbeiteten Gegenakten ein kanonisches Bild besitzen, übernehmen dieses
// bestehende lokale Asset; alle übrigen Karten verwenden den Systemplatzhalter.
export const HOUSE_FHAIRE_LOCAL_PORTRAIT_IDS = Object.freeze([]);

export const HOUSE_FHAIRE_PORTRAITS = Object.freeze({
  'breandan-wylan': HOUSE_WYLAN_PORTRAITS['breandan-wylan'],
  'owain-hwyaden': HOUSE_HWYADEN_PORTRAITS['owain-hwyaden'],
  'meara-fhaire': HOUSE_HWYADEN_PORTRAITS['meara-fhaire'],
  'oweta-hwyaden': HOUSE_HWYADEN_PORTRAITS['oweta-hwyaden'],
  'aonghus-fhaire': HOUSE_HWYADEN_PORTRAITS['aonghus-fhaire'],
  'beynon-tarw-dinefwr': HOUSE_DINEFWR_PORTRAITS['beynon-tarw-dinefwr'],
  'bedelia-ua-fhaire': HOUSE_DINEFWR_PORTRAITS['bedelia-ua-fhaire'],
  'eynon-tarw-dinefwr': HOUSE_DINEFWR_PORTRAITS['eynon-tarw-dinefwr'],
  'aithne-ua-fhaire': HOUSE_DINEFWR_PORTRAITS['aithne-ua-fhaire']
});
