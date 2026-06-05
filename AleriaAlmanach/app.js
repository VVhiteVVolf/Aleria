// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage, { once: true });
} else {
  initPage();
}
window.addEventListener('pageshow', clearTransientSearchInputsAfterBrowserRestore);






