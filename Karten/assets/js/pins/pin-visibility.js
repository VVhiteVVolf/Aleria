// Map-owned preferences are saved with the draft and published with the map.
(function () {
  const runtime = window.KartoRuntime;
  const layer = runtime?.pinLayer();
  if (!layer) return;
  const controls = [
    { field: 'showMarkers', role: 'show-view-markers', className: 'show-view-markers' },
    { field: 'showPinLabels', role: 'show-pin-labels', className: 'show-pin-labels' },
    { field: 'alwaysShowLettering', role: 'always-show-lettering' },
  ].map(control => ({ ...control, input: document.querySelector(`[data-role="${control.role}"]`) }));

  function render() {
    for (const control of controls) {
      const enabled = runtime.state()[control.field] === true;
      if (control.input) control.input.checked = enabled;
      if (control.className) layer.classList.toggle(control.className, enabled);
    }
    window.updatePinLayerVisibility?.();
  }
  for (const { input, field } of controls) {
    input?.addEventListener('change', () => {
      if (!runtime.isEditMode()) { render(); return; }
      runtime.state()[field] = input.checked;
      render();
      runtime.save();
    });
  }
  window.addEventListener('aleria:karto:state-changed', render);
  render();
})();
