(function(){
  'use strict';

  function rt(){ return window.TafelRuntime; }

  function fitView(){
    const size = rt().imageSize();
    if(!size.w) return;
    const wrap = rt().mapWrap();
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const scale = Math.min(width / size.w, height / size.h) * .97;
    rt().setMapTransform((width - size.w * scale) / 2, (height - size.h * scale) / 2, scale);
  }

  function zoomWheel(event){
    event.preventDefault();
    const wrap = rt().mapWrap();
    const rect = wrap.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.1 : .91;
    const transform = rt().mapTransform();
    const nextZ = Math.max(.05, Math.min(transform.z * factor, 15));
    const nextX = sx - (sx - transform.x) * factor;
    const nextY = sy - (sy - transform.y) * factor;
    rt().setMapTransform(nextX, nextY, nextZ);
  }

  window.TafelBoardViewport = {
    fitView,
    zoomWheel
  };
})();
