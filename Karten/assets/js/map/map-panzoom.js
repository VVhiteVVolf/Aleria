(function(){
  const runtime = window.KartoRuntime;
  const mapWrap = document.getElementById('map-wrap');

  function fitView(){
    const image = runtime.mapImageSize();
    if(!image.width) return;
    const viewport = runtime.mapViewportSize();
    const scale = Math.min(viewport.width / image.width, viewport.height / image.height) * .97;
    runtime.setMapTransform(
      (viewport.width - image.width * scale) / 2,
      (viewport.height - image.height * scale) / 2,
      scale
    );
  }

  function zoomWheel(event){
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : .91;
    const point = runtime.viewportPointFromClient(event.clientX, event.clientY);
    runtime.zoomMapAt(point.x, point.y, factor);
  }

  function onKeydown(event){
    const inField = ['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName);
    if(inField) return;
    if(event.key === 'f') fitView();
    if(event.key === '+' || event.key === '=') runtime.zoomMapAtCenter(1.12);
    if(event.key === '-') runtime.zoomMapAtCenter(.89);
  }

  mapWrap.addEventListener('wheel', zoomWheel, {passive:false});
  new ResizeObserver(() => {
    if(runtime.mapImageSize().width) fitView();
  }).observe(mapWrap);
  document.addEventListener('keydown', onKeydown);

  window.fitView = fitView;
})();
