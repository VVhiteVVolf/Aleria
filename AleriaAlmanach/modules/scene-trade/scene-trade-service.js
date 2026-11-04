import { getFirebaseClientContext } from '../auth/firebase-client-context.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { connectItemDefinitionClient } from '../item-definitions/item-definition-client.js';
import { registerStore } from '../item-register/item-register-store.js?v=20261020-arkaneum-v1';
import { createItemRegisterFirebase } from '../item-register/item-register-firebase.js';
import { registerLists } from '../item-register/item-register-providers.js?v=20261014-aldrimar-brewers-v1';
import { upgradeEntry } from '../group-adventures/group-adventures-classic-api.mjs';
import { resolveGroupRoster, groupMemberRecordId } from '../landing/group-landing-roster.js';
import { availableTradeProduct } from './scene-trade-state.js';
import { readSceneTradeModules, resolveSceneTradeContext } from './scene-trade-context.js';

// Multiple exact-thread drafts share the repository connection; opening another
// scene must not replace the backend and restart all register subscriptions.
let sharedRegisterApi;

function readySnapshot(store, timeout = 15000) {
  const current = store.tradeSnapshot();
  if (current.status === 'live') return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    let stop = () => {};
    const timer = setTimeout(() => { stop(); reject(Error('Das Handelsregister ist noch nicht live verbunden. Bitte erneut öffnen.')); }, timeout);
    stop = store.subscribe(snapshot => {
      if (!['live', 'error'].includes(snapshot.status)) return;
      clearTimeout(timer); queueMicrotask(() => stop());
      snapshot.status === 'live' ? resolve(snapshot) : reject(Error(snapshot.error || 'Das Handelsregister ist gerade nicht erreichbar.'));
    }, { projection: 'trade' });
  });
}
export function createSceneTradeService() {
  let context, loadedUid;
  return {
    async load(options = {}) {
      context ||= await getFirebaseClientContext();
      const user = await context.requireUser(), token = await user.getIdTokenResult();
      loadedUid = user.uid;
      await connectItemDefinitionClient();
      sharedRegisterApi ||= globalThis._fb?.itemRegister || createItemRegisterFirebase({ ...context, ...context.sdk });
      registerStore.connect(sharedRegisterApi, null, { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false });
      const sources = readSceneTradeModules(), publicModules = sources.entries;
      registerStore.setModules(publicModules, { hydrateVersions: false, reuseSnapshot: true });
      const [snapshot, groupSnapshot] = await Promise.all([readySnapshot(registerStore),
        context.sdk.getDocs(context.sdk.collection(context.db, 'group_quest_accounts'))]);
      const modulesById = new Map(publicModules.map(entry => [entry.id, entry]));
      const groups = groupSnapshot.docs.map(doc => {
        const account = { ...doc.data(), id: doc.id };
        const source = modulesById.get(doc.id);
        const entry = source ? upgradeEntry(source) : null, group = entry?.pages?.find(page => page.landing?.group)?.landing.group;
        if (group) account.tradeContext = { moduleId: entry.id, sceneThreads: [group.threadId, ...(group.sceneThreads || [])].filter(Boolean),
          memberCharacterIds: resolveGroupRoster(entry, group, snapshot.characters).filter(member => member.kind === 'character').map(groupMemberRecordId).filter(Boolean) };
        return account;
      });
      const offers = snapshot.offers.filter(offer => !offer.archived && !offer.legacy);
      const providers = registerLists(offers.filter(offer => offer.moduleId || availableTradeProduct(offer)), snapshot.providers);
      const tradeContext = resolveSceneTradeContext({ ...options, entries: publicModules, sections: sources.sections, providers });
      return { characters: snapshot.characters, groups, offers,
        providers, context: tradeContext, proposedMerchantId: tradeContext.merchantId,
        access: { uid: user.uid, role: token.claims.aleriaRole || 'player' } };
    },
    async ensureAccountsVersions(records = []) { await connectItemDefinitionClient(); await itemDefinitionStore.ensureVersions(records); },
    async checkout(input) {
      context ||= await getFirebaseClientContext();
      const user = await context.requireUser();
      if (user.uid !== loadedUid) { const error = Error('Die Anmeldung hat gewechselt. Bitte mit der Anmeldung des offenen Handels erneut öffnen.'); error.code = 'scene-trade/identity-changed'; throw error; }
      await connectItemDefinitionClient(); return itemDefinitionStore.trade(input);
    },
    async availability(merchantId) { await connectItemDefinitionClient(); const response = await itemDefinitionStore.trade({ action: 'availability', merchantId }); return response.products || []; },
    async sold(merchantId, cursor = null) {
      await connectItemDefinitionClient(); const response = await itemDefinitionStore.trade({ action: 'sold', merchantId, ...(cursor ? { cursor } : {}) });
      const items = response.items || []; await itemDefinitionStore.ensureVersions([{ items: items.map(record => record.item).filter(Boolean) }]);
      return { ...response, items };
    }
  };
}
