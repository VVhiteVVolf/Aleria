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

  function setLayer(layer){
    document.querySelectorAll('.lbtn').forEach(button => button.classList.remove('on'));
    document.getElementById('lb-' + layer)?.classList.add('on');
    // Generic over any number of overlay images (the 2 built-in ones,
    // Regionen/Markierungen, plus however many custom layers were added -
    // see karto-app.js's applyExtraLayerImages()/renderLayerButtons()).
    // Each overlay <img> just needs data-overlay="<layer id>" to participate.
    document.querySelectorAll('.ml[data-overlay]').forEach(img => {
      img.style.opacity = img.dataset.overlay === layer ? '1' : '0';
    });
    document.getElementById('pl').style.display = layer === 'pins' ? 'block' : 'none';
  }

  window.onImgLoad = onImgLoad;
  window.onImgErr = onImgErr;
  window.setLayer = setLayer;
})();
