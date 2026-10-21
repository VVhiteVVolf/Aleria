import { initializeNoticeRewards } from '../rewards/notice-rewards.js?v=20261021-wanted-v1';
import { initializeNoticeTypography } from '../typography/notice-typography.js?v=20261020-notice-fonts-v1';

initializeNoticeRewards();
initializeNoticeTypography();
(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.TafelInit);
  } else {
    window.TafelInit();
  }
})();
