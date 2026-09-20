// Map-owned visibility preference; editing always reveals placement handles.
(function () {
  const checkbox = document.querySelector('[data-role="show-view-markers"]');
  const layer = window.KartoRuntime?.pinLayer();
  if (!checkbox || !layer) return;
  function render() {
    checkbox.checked = window.KartoRuntime.state().showMarkers === true;
    layer.classList.toggle('show-view-markers', checkbox.checked);
  }
  checkbox.addEventListener('change', () => {
    if (!window.KartoRuntime.isEditMode()) return;
    window.KartoRuntime.state().showMarkers = checkbox.checked;
    render();
    window.KartoRuntime.save();
  });
  window.addEventListener('aleria:karto:state-changed', render);
  render();
})();
