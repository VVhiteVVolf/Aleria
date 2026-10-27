import { initializeNoticeRewards } from '../rewards/notice-rewards.js?v=20261021-reward-purse-v1';
import { initializeNoticeTypography } from '../typography/notice-typography.js?v=20261021-notice-links-v1';
import { initializeNoticeSeals } from '../seals/notice-seals.js?v=20261021-default-seals-v1';
import { initializeNoticeModuleLinks } from '../links/notice-module-links.js?v=20261021-notice-links-v1';
import { initializeBoardComposition } from '../composition/board-composition.js?v=20261027-posters-v1';

initializeNoticeRewards();
initializeNoticeTypography();
initializeNoticeSeals();
initializeNoticeModuleLinks();
await initializeBoardComposition();
(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.TafelInit);
  } else {
    window.TafelInit();
  }
})();
