(function(){
  let dragGroupId = null;
  let dragWaypointIndex = -1;
  let dragMoved = false;
  let dragReady = false;
  let holdTimer = null;

  function runtime(){
    return window.KartoRuntime;
  }

  function mapWrap(){
    return document.getElementById('map-wrap');
  }

  function state(){
    return runtime().lsbState();
  }

  function selectedGroup(){
    const id = runtime().selectedTravelGroup() || state().groups?.[0]?.id;
    return id ? state().groups.find(group => group.id === id) : null;
  }

  function clearHold(){
    clearTimeout(holdTimer);
    holdTimer = null;
  }

  function resetDrag(){
    dragGroupId = null;
    dragWaypointIndex = -1;
    dragReady = false;
    dragMoved = false;
  }

  function onMouseMove(event){
    if(runtime().travelMode() === 'route' && runtime().isRouteDrawing()){
      runtime().setLiveTravelMouse(runtime().mapPointFromClient(event.clientX, event.clientY));
    }
    if(dragGroupId && dragReady){
      dragMoved = true;
      const point = runtime().mapPointFromClient(event.clientX, event.clientY);
      const group = state().groups.find(item => item.id === dragGroupId);
      if(group && dragWaypointIndex >= 0){
        group.route[dragWaypointIndex] = {...group.route[dragWaypointIndex], x:point.x, y:point.y};
        runtime().drawTravelLayer();
      }
      mapWrap().style.cursor = 'grabbing';
    } else if(!dragGroupId && runtime().travelMode() === 'pan'){
      const point = runtime().mapPointFromClient(event.clientX, event.clientY);
      mapWrap().style.cursor = window.KartoLsbCanvas.hitWaypoint(point.x, point.y) ? 'grab' : '';
    }
  }

  function onMouseDown(event){
    if(event.button !== 0) return;
    const point = runtime().mapPointFromClient(event.clientX, event.clientY);
    dragMoved = false;
    dragReady = false;
    if(runtime().travelMode() !== 'pan') return;
    const hit = window.KartoLsbCanvas.hitWaypoint(point.x, point.y);
    if(!hit) return;
    dragGroupId = hit.g.id;
    dragWaypointIndex = hit.i;
    holdTimer = setTimeout(() => {
      dragReady = true;
      mapWrap().style.cursor = 'grabbing';
      runtime().toast('🖐 Ziehen…');
      runtime().startTravelRaf();
    }, 320);
    event.stopImmediatePropagation();
  }

  function onMouseUp(){
    clearHold();
    if(!dragGroupId) return;
    if(dragMoved && dragReady){
      runtime().saveTravel();
      runtime().toast('✓ Marker verschoben');
    } else if(!dragReady && !dragMoved){
      runtime().openWaypointModal(dragGroupId, dragWaypointIndex);
    }
    resetDrag();
    mapWrap().style.cursor = 'grab';
  }

  function onMouseLeave(){
    if(dragGroupId && !dragReady){
      clearHold();
      resetDrag();
    }
  }

  function onClick(event){
    if(dragMoved) return;
    const point = runtime().mapPointFromClient(event.clientX, event.clientY);
    if(runtime().travelMode() === 'calib'){
      window.KartoLsbTools.addCalibrationPoint(point);
      event.stopImmediatePropagation();
      return;
    }
    if(runtime().travelMode() === 'measure'){
      window.KartoLsbTools.addMeasurePoint(point);
      event.stopImmediatePropagation();
      return;
    }
    if(runtime().travelMode() === 'place'){
      const group = selectedGroup();
      if(!group){
        runtime().toast('Zuerst eine Gruppe anlegen!');
        return;
      }
      if(!group.route?.length) group.route = [{x:point.x, y:point.y}];
      else group.route[0] = {...group.route[0], x:point.x, y:point.y};
      window.lsbRenderGroups();
      runtime().setTravelMode('pan');
      runtime().saveTravel();
      runtime().toast('✓ Marker gesetzt');
      event.stopImmediatePropagation();
      return;
    }
    if(runtime().travelMode() === 'route' && runtime().isRouteDrawing()){
      const group = selectedGroup();
      if(!group) return;
      if(!group.route) group.route = [];
      group.route.push({x:point.x, y:point.y});
      runtime().updateTravelResult();
      event.stopImmediatePropagation();
    }
  }

  function onDblClick(){
    window.KartoLsbTools.finishMeasure();
    if(runtime().travelMode() === 'route' && runtime().isRouteDrawing()) window.lsbFinRoute();
  }

  function onKeyDown(event){
    if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)) return;
    if(event.key === 'Backspace' && runtime().travelMode() === 'route' && runtime().isRouteDrawing()){
      const group = selectedGroup();
      if(group?.route?.length > 1){
        group.route.pop();
        runtime().updateTravelResult();
      }
    }
    if(event.key === 'Enter' && runtime().travelMode() === 'route' && runtime().isRouteDrawing()) window.lsbFinRoute();
    if(event.key === 'Escape' && runtime().travelMode() !== 'pan'){
      runtime().setTravelMode('pan');
      runtime().setRouteDrawing(false);
      runtime().setLiveTravelMouse(null);
      window.KartoLsbTools.cancelTransientTools();
    }
  }

  function init(){
    const wrap = mapWrap();
    wrap.addEventListener('mousemove', onMouseMove);
    wrap.addEventListener('mousedown', onMouseDown);
    wrap.addEventListener('mouseup', onMouseUp);
    wrap.addEventListener('mouseleave', onMouseLeave);
    wrap.addEventListener('click', onClick);
    wrap.addEventListener('dblclick', onDblClick);
    document.addEventListener('keydown', onKeyDown);
  }

  window.KartoLsbInteraction = {
    init,
    dragState(){
      return {
        groupId: dragGroupId,
        waypointIndex: dragWaypointIndex,
        ready: dragReady,
        moved: dragMoved,
      };
    },
  };
})();
