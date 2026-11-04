import { initializeNoticeRewards } from '../rewards/notice-rewards.js?v=20261021-reward-purse-v1';
import { initializeNoticeTypography } from '../typography/notice-typography.js?v=20261103-tlapanui-ishtaran';
import '../../../../AleriaAlmanach/modules/quests/quest-context-bridge.js';
import { initializeNoticeSeals } from '../seals/notice-seals.js?v=20261021-default-seals-v1';
import { initializeNoticeModuleLinks } from '../links/notice-module-links.js?v=20261021-notice-links-v1';
import { initializeBoardComposition } from '../composition/board-composition.js?v=20261031-paper-calendar-v1';
import { initializeNoticeTimeline } from '../timeline/notice-timeline.mjs?v=20261031-a38-calendar-v2';
import { initializeNoticeArchive } from '../archive/notice-archive.mjs?v=20261031-paper-calendar-v1';

initializeNoticeRewards();
initializeNoticeTypography();
initializeNoticeSeals();
initializeNoticeModuleLinks();
initializeNoticeTimeline();
initializeNoticeArchive();
window._fb?.preload().catch(() => {});
await initializeBoardComposition();
(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.TafelInit);
  } else {
    window.TafelInit();
  }
})();
