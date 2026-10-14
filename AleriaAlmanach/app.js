(function () {
// Startup publishes readiness only after the local archive has rendered.
async function startAlmanachPage() {
  try {
    await initPage();
    window.dispatchEvent(new CustomEvent('almanach:app-ready'));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('almanach:startup-error'));
    console.error('Almanach startup failed:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAlmanachPage, { once: true });
} else {
  startAlmanachPage();
}
window.addEventListener('pageshow', clearTransientSearchInputsAfterBrowserRestore);
}());






