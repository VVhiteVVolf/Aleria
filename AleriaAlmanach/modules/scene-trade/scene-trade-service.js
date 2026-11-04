import { getFirebaseClientContext } from '../auth/firebase-client-context.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { connectItemDefinitionClient } from '../item-definitions/item-definition-client.js';
import { registerStore } from '../item-register/item-register-store.js?v=20261020-arkaneum-v1';
import { createItemRegisterFirebase } from '../item-register/item-register-firebase.js';
import { registerLists } from '../item-register/item-register-providers.js?v=20261014-aldrimar-brewers-v1';
import { upgradeEntry } from '../group-adventures/group-adventures-classic-api.mjs';
import { resolveGroupRoster, groupMemberRecordId } from '../landing/group-landing-roster.js';
import { availableTradeProduct } from './scene-trade-state.js';

function readySnapshot(store, timeout = 15000) {
  const current = store.snapshot();
  if (current.status === 'live') return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    let stop = () => {};
    const timer = setTimeout(() => { stop(); reject(Error('Das Handelsregister ist noch nicht live verbunden. Bitte erneut öffnen.')); }, timeout);
    stop = store.subscribe(snapshot => {
      if (!['live', 'error'].includes(snapshot.status)) return;
      clearTimeout(timer); queueMicrotask(() => stop());
      snapshot.status === 'live' ? resolve(snapshot) : reject(Error(snapshot.error || 'Das Handelsregister ist gerade nicht erreichbar.'));
    });
  });
}
export function createSceneTradeService() {
  let context, registerApi, loadedUid;
  return {
    async load() {
      context ||= await getFirebaseClientContext();
      const user = await context.requireUser(), token = await user.getIdTokenResult();
      loadedUid = user.uid;
      await connectItemDefinitionClient();
      registerApi ||= globalThis._fb?.itemRegister || createItemRegisterFirebase({ ...context, ...context.sdk });
      registerStore.connect(registerApi, globalThis._fb);
      const publicModules = globalThis.itemDbGetModuleEntries?.() || [];
      registerStore.setModules(publicModules);
      const [snapshot, groupSnapshot] = await Promise.all([readySnapshot(registerStore),
        context.sdk.getDocs(context.sdk.collection(context.db, 'group_quest_accounts'))]);
      const groups = groupSnapshot.docs.map(doc => {
        const account = { ...doc.data(), id: doc.id };
        const source = publicModules.find(entry => entry.id === doc.id && !entry.hidden && !entry.archived && !entry.isTemplate);
        const entry = source ? upgradeEntry(source) : null, group = entry?.pages?.find(page => page.landing?.group)?.landing.group;
        if (group) account.tradeContext = { moduleId: entry.id, sceneThreads: [group.threadId, ...(group.sceneThreads || [])].filter(Boolean),
          memberCharacterIds: resolveGroupRoster(entry, group, snapshot.characters).filter(member => member.kind === 'character').map(groupMemberRecordId).filter(Boolean) };
        return account;
      });
      await itemDefinitionStore.ensureVersions(groups);
      const offers = snapshot.offers.filter(offer => !offer.archived && !offer.legacy);
      return { characters: snapshot.characters, groups, offers,
        providers: registerLists(offers.filter(offer => offer.moduleId || availableTradeProduct(offer)), snapshot.providers), access: { uid: user.uid, role: token.claims.aleriaRole || 'player' } };
    },
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
