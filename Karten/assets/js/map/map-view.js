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
    document.getElementById('lr').style.opacity = layer === 'regions' ? '1' : '0';
    document.getElementById('lm').style.opacity = layer === 'pins' ? '1' : '0';
    document.getElementById('pl').style.display = layer === 'pins' ? 'block' : 'none';
  }

  window.onImgLoad = onImgLoad;
  window.onImgErr = onImgErr;
  window.setLayer = setLayer;
})();
