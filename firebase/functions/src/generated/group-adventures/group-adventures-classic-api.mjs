import { withGroupAdventureContent } from './group-adventure-content.mjs';
import { withGawainDuncanContent } from '../gawain-duncan/gawain-duncan-module.mjs';
export { GROUP_ADVENTURE_MODULES, GROUP_ADVENTURE_CONTENT_VERSION } from './group-adventure-content.mjs';
export function upgradeEntry(entry) {
  return withGroupAdventureContent(withGawainDuncanContent(entry));
}
