import { getFirebaseClientContext } from '../auth/firebase-client-context.js';
import { createQuestRepository } from './quest-firebase.js';
let connection, catalog;
export function getQuestClient() {
  return connection ||= getFirebaseClientContext().then(createQuestRepository).catch(error => { connection = null; throw error; });
}
export function getQuestCatalog() {
  return catalog ||= fetch(new URL('./quest-catalog.json', import.meta.url)).then(response => {
    if (!response.ok) throw Error('Der öffentliche Questkatalog konnte nicht geladen werden.');
    return response.json();
  }).catch(error => { catalog = null; throw error; });
}
