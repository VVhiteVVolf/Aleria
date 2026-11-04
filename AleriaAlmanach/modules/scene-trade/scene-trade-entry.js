import { isSceneTradeComment, renderSceneTradeNotification } from './scene-trade-notification.js';

// The classic scene renderer has one feature bridge; cart state and persistence
// stay inside the lazily loaded trade controller.
window.AleriaSceneTrade = Object.freeze({
  isComment: isSceneTradeComment,
  renderComment: comment => renderSceneTradeNotification(comment, { lockMarkup: window.renderCommentTransactionLock?.(comment) || '' })
});

if (document.querySelector('[data-scene-trade-pending]')) {
  const threadId = window.getCurrentCommentThreadId?.();
  if (threadId && window.loadCommentsIntoPage) {
    Promise.resolve(window.loadCommentsIntoPage(threadId, true)).catch(error => console.warn('Handelsbeleg konnte nicht aufgefrischt werden.', error));
  }
}
