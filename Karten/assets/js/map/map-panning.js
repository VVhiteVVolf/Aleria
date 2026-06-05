(function(){
  const runtime = window.KartoRuntime;
  let active = false;
  let last = {x:0, y:0};

  function start(clientX, clientY){
    active = true;
    last = {x:clientX, y:clientY};
  }

  function move(clientX, clientY){
    if(!active) return;
    runtime.translateMap(clientX - last.x, clientY - last.y);
    last = {x:clientX, y:clientY};
  }

  function stop(){
    active = false;
  }

  function isActive(){
    return active;
  }

  window.KartoPanning = {
    start,
    move,
    stop,
    isActive,
  };
})();
