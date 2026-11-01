import { HttpsError } from 'firebase-functions/v2/https';
import { upgradeEntry } from '../generated/group-adventures/group-adventures-classic-api.mjs';

// Group rewards have their own authoritative inventory. The editorial module's
// manual stock list and manual ledger are never overwritten by a payout.
export async function readQuestGroupAccount(database, transaction, groupId) {
  const moduleRef = database.doc(`module_store_entries/${encodeURIComponent(groupId).replace(/\./g, '%2E')}`);
  const module = (await transaction.get(moduleRef)).data();
  const savedEntry = module?.entryJson ? JSON.parse(module.entryJson) : module?.entry;
  if (savedEntry?.id !== groupId || savedEntry.hidden || savedEntry.archived || savedEntry.isTemplate) {
    throw new HttpsError('failed-precondition', 'Die verknüpfte Gruppen-Landingpage ist nicht mehr verfügbar. Bitte die Zuteilung korrigieren.');
  }
  // Use the browser's reviewed, versioned content projection before deriving
  // membership. This is a read only view; the stored module is never rewritten.
  const entry = upgradeEntry(savedEntry);
  if (!entry.pages?.some(page => page.landing?.group)) {
    throw new HttpsError('failed-precondition', 'Die verknüpfte Gruppen-Landingpage ist nicht mehr verfügbar. Bitte die Zuteilung korrigieren.');
  }
  const reference = database.doc(`group_quest_accounts/${groupId}`), snapshot = await transaction.get(reference);
  return { reference, exists: snapshot.exists, entry,
    group: entry.pages.find(page => page.landing?.group).landing.group,
    record: { name: entry.title || groupId, inventory: { items: [] }, ...(snapshot.data() || {}), id: groupId } };
}
