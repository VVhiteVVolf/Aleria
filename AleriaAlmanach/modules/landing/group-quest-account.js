import { mountGroupAccount } from './group-account-controller.js';

export function mountGroupQuestAccount(root, groupId, options = {}) {
  const host = root.querySelector('[data-group-quest-account]');
  if (!host) return () => {};
  return mountGroupAccount(host,groupId,options);
}
