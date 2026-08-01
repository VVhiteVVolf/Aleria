(function(){
  const runtime = window.KartoRuntime;

  function onImgLoad(img){
    runtime.setMapImageSize(img.naturalWidth, img.naturalHeight);
    runtime.fitMapView();
    runtime.renderMapContent();
  }

  function onImgErr(){
    runtime.setMapImageSize(1400, 1000);
    runtime.fitMapView();
    runtime.renderMapContent();
    runtime.toast('⚠ Kartenbilder nicht gefunden — Pfade prüfen');
  }

  // Layers are independently toggleable overlays (not a radio group): any
  // combination of Regionen/Markierungen/custom layers can be active at
  // once, stacked on top of the always-visible base map. With 2+ active at
  // the same time, a shared "Deckkraft" slider fades all of them so they
  // blend instead of the topmost one fully hiding what's underneath; with
  // 0-1 active, layers stay fully opaque (unchanged from before).
  function setLayerActive(layer, active){
    const button = document.getElementById('lb-' + layer);
    if(!button) return;
    button.classList.toggle('on', active);
    const img = document.querySelector(`.ml[data-overlay="${layer}"]`);
    if(img) img.style.opacity = active ? '1' : '0';
    if(layer === 'pins') document.getElementById('pl').style.display = active ? 'block' : 'none';
  }

  function activeLayerButtons(){
    return [...document.querySelectorAll('#layer-btns .lbtn.on')];
  }

  function applyLayerOpacities(){
    const active = activeLayerButtons();
    const blend = active.length >= 2;
    const slider = document.getElementById('layer-opacity-sl');
    const value = blend ? (Number(slider?.value ?? 70) / 100) : 1;
    active.forEach(button => {
      const layer = button.dataset.layer;
      const img = document.querySelector(`.ml[data-overlay="${layer}"]`);
      if(img) img.style.opacity = String(value);
      if(layer === 'pins') document.getElementById('pl').style.opacity = String(value);
    });
    const wrap = document.getElementById('layer-opacity-wrap');
    if(wrap) wrap.style.display = blend ? 'flex' : 'none';
  }

  function resetLayers(){
    activeLayerButtons().forEach(button => setLayerActive(button.dataset.layer, false));
    applyLayerOpacities();
  }

  // "Karte" isn't really a 4th toggleable overlay (the base map is always
  // visible) - clicking it just clears every active overlay back to the
  // plain base map, same as before.
  function toggleLayer(layer){
    if(layer === 'normal'){ resetLayers(); return; }
    const button = document.getElementById('lb-' + layer);
    setLayerActive(layer, !button?.classList.contains('on'));
    applyLayerOpacities();
  }

  function activateLayer(layer){
    const button = document.getElementById('lb-' + layer);
    if(button && !button.classList.contains('on')) setLayerActive(layer, true);
    applyLayerOpacities();
  }

  function deactivateLayer(layer){
    const button = document.getElementById('lb-' + layer);
    if(button?.classList.contains('on')) setLayerActive(layer, false);
    applyLayerOpacities();
  }

  window.onImgLoad = onImgLoad;
  window.onImgErr = onImgErr;
  window.toggleLayer = toggleLayer;
  window.activateLayer = activateLayer;
  window.deactivateLayer = deactivateLayer;
  window.resetLayers = resetLayers;
  window.applyLayerOpacities = applyLayerOpacities;
  // Legacy alias: some older call sites still say "setLayer('normal'/'pins')"
  // meaning "make sure this one is showing" - map that onto activate, except
  // 'normal' which keeps its reset meaning.
  window.setLayer = layer => layer === 'normal' ? resetLayers() : activateLayer(layer);
})();
