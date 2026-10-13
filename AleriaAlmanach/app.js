(function () {
// Startup publishes readiness only after the local archive has rendered.
function startAlmanachPage() {
  try {
    initPage();
    window.dispatchEvent(new CustomEvent('almanach:app-ready'));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('almanach:startup-error'));
    throw error;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAlmanachPage, { once: true });
} else {
  startAlmanachPage();
}
window.addEventListener('pageshow', clearTransientSearchInputsAfterBrowserRestore);
}());






