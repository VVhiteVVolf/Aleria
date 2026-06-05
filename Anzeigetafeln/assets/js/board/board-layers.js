(function(){
  'use strict';

  function apply(layer, options){
    const editMode = !!options?.editMode;
    document.querySelectorAll('.lbtn').forEach(button => button.classList.remove('on'));
    const activeButton = document.getElementById('lb-' + layer);
    if(activeButton) activeButton.classList.add('on');

    const regions = document.getElementById('lr');
    const markers = document.getElementById('lm');
    const pinLayer = window.TafelRuntime.pinLayer();
    const zettelLayer = document.getElementById('zettel-layer');
    if(regions) regions.style.opacity = '0';
    if(markers) markers.style.opacity = layer === 'pins' ? '1' : '0';
    if(pinLayer) pinLayer.style.display = layer === 'pins' ? 'block' : 'none';
    if(zettelLayer) zettelLayer.style.display = layer === 'normal' ? 'block' : 'none';

    const addZettel = document.getElementById('btn-add-zettel');
    const addOrt = document.getElementById('btn-add-ort');
    if(editMode && addZettel) addZettel.style.display = layer === 'normal' ? 'block' : 'none';
    if(editMode && addOrt) addOrt.style.display = layer === 'pins' ? 'block' : 'none';
  }

  window.TafelBoardLayers = { apply };
})();
