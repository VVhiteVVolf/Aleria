import { getFirebaseClientContext } from '../auth/firebase-client-context.js';
import { createItemDefinitionsFirebase } from './item-definition-firebase.js';
import { itemDefinitionStore } from './item-definition-store.js';

let connecting = null;
export function connectItemDefinitionClient() {
  if (globalThis._fb?.itemDefinitions) {
    itemDefinitionStore.connect(globalThis._fb.itemDefinitions);
    return Promise.resolve();
  }
  return connecting ||= (async () => {
    const context = await getFirebaseClientContext();
    itemDefinitionStore.connect(createItemDefinitionsFirebase({ ...context, ...context.sdk }));
  })().catch(failure => { connecting = null; throw failure; });
}
