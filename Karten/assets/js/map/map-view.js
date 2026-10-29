(function(){
  const runtime = window.KartoRuntime;

  function onImgLoad(img){
    const width=Number(img.dataset.mapWidth)||img.naturalWidth;
    const height=Number(img.dataset.mapHeight)||img.naturalHeight;
    const source=img.dataset.mapSource||img.getAttribute('src');
    const current=runtime.mapImageSize();
    // Resolution upgrades must preserve the current viewport and marker DOM.
    if(current.width===width && current.height===height && img.dataset.loadedMapSource===source) return;
    img.dataset.loadedMapSource=source;
    runtime.setMapImageSize(width, height);
    runtime.fitMapView();
    runtime.renderMapContent();
  }

  function onImgErr(img){
    const layer = img?.dataset?.mapLayer || 'normal';
    if(runtime.recoverConfiguredMapImage?.(layer, img)){
      runtime.toast(`⚠ ${layer === 'normal' ? 'Kartenbild' : 'Kartenebene'} aus der Registry wiederhergestellt`);
      return;
    }
    if(layer !== 'normal'){
      runtime.toast('⚠ Kartenebene nicht gefunden — Pfad prüfen');
      return;
    }
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
    if(img) window.KartoMapRasterImages?.activate(img,active);
    if(img) img.style.opacity = active ? '1' : '0';
    if(layer === 'pins') updatePinLayerVisibility();
  }

  // Lettering can remain above the base map without enabling its raster
  // marker overlay or the ordinary pins' invisible hit areas.
  function updatePinLayerVisibility(){
    const layer = document.getElementById('pl');
    if(!layer) return;
    const active = document.getElementById('lb-pins')?.classList.contains('on') === true;
    const lettering = runtime.state?.().alwaysShowLettering === true;
    layer.classList?.toggle('marker-layer-active', active);
    layer.style.display = active || lettering ? 'block' : 'none';
    if(!active) layer.style.opacity = '1';
  }

  function activeLayerButtons(){
    return [...document.querySelectorAll('#layer-btns .lbtn.on:not([data-layer="normal"])')];
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
    window.dispatchEvent(new CustomEvent('aleria:karto:layers-changed'));
  }

  function resetLayers(){
    const state = runtime.state?.() || {};
    const symbols = state.markerPresentation === 'symbols' && state.showMarkers === true && state.pins?.length > 0;
    document.querySelectorAll('#layer-btns .lbtn:not([data-layer="normal"])').forEach(button => {
      setLayerActive(button.dataset.layer, button.dataset.layer === 'pins' && symbols);
    });
    document.getElementById('lb-normal')?.classList.add('on');
    applyLayerOpacities();
  }

  // The base map is always visible. "Karte" restores its normal presentation,
  // retaining editor symbols only on maps that explicitly use them.
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
  window.updatePinLayerVisibility = updatePinLayerVisibility;
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
