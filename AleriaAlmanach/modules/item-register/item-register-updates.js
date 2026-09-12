// A small uncached manifest checks repository releases without downloading the
// whole catalog repeatedly. Firebase owns the live offers and possession data.
export function watchStandardReleases(store) {
  const directory = new URL('./modules/item-register/', document.baseURI);
  let loading = false;
  async function refresh() {
    if (loading || document.hidden || navigator.onLine === false) return;
    loading = true;
    try {
      const response = await fetch(new URL('item-register-version.json', directory), { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (!/^[a-f0-9]{16}$/.test(version) || version === store.snapshot().version) return;
      const source = new URL('item-register-standard.js', directory);
      source.searchParams.set('v', version);
      const next = await import(/* @vite-ignore */ source.href);
      if (next.STANDARD_VERSION === version) store.replaceStandards(next.STANDARD_ITEMS, version);
    } catch (error) { console.info('Standardgüter: Der vorhandene Registerstand wird weiterverwendet.', error); }
    finally { loading = false; }
  }
  const timer = window.setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('online', refresh);
  refresh();
  return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); };
}
