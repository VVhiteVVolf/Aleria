// Shared accepted source; each country keeps its own page boundary.
import { createAcceptedTerritory } from '../accepted-realms/territory-page.mjs?v=accepted-realms-20261029a';
export const createTerritory = (id, data) => createAcceptedTerritory('deitheach', id, data);
