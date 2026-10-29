// House-specific authoring boundary; accepted facts remain shared with the territorial register.
import { realmsById } from '../../../../shared/accepted-realms/catalog.mjs';
import { createAcceptedHouseContent } from '../../../../shared/accepted-realms/house-content.mjs';
const realm = realmsById.get('triarchie');
export const HOUSE_CONTENT = createAcceptedHouseContent(realm, realm.housesById.get('stahlwart'));
