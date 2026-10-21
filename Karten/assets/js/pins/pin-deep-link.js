// A territory register can open one public pin through the regular map shell.
(function () {
  const id = new URL(window.location.href).searchParams.get('pin');
  if (!id) return;
  const image = document.getElementById('ln');
  function openRequestedPin() {
    const runtime = window.KartoRuntime;
    if (!runtime?.mapImageSize().width) return;
    const pin = runtime.state().pins.find(item => item.id === id);
    if (!pin || pin.secret) return;
    if (!window.KartoPinNavigation.focus(id)) return;
    window.KartoPinDetailView.open(id);
    window.removeEventListener('aleria:karto:state-changed', openRequestedPin);
    image?.removeEventListener('load', openRequestedPin);
  }
  window.addEventListener('aleria:karto:state-changed', openRequestedPin);
  image?.addEventListener('load', openRequestedPin);
  openRequestedPin();
})();
