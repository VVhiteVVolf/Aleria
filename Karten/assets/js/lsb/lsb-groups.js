(function(){
  function runtime(){
    return window.KartoRuntime;
  }

  function lsbState(){
    return runtime().lsbState();
  }

  function groups(){
    return lsbState().groups || [];
  }

  function selectedGroupId(){
    return runtime().selectedTravelGroup();
  }

  function renderGroups(){
    const list = document.getElementById('lsb-groups');
    if(!list) return;
    list.innerHTML = '';
    if(!groups().length){
      list.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);color:var(--gold);opacity:.55;text-align:center;padding:.55rem;">Noch keine Gruppen — ＋ drücken</div>';
      return;
    }

    const iconSize = Math.max(24, runtime().travelIconSize() || 22);
    groups().forEach(group => {
      const isSelected = selectedGroupId() === group.id;
      const calc = runtime().travelScale() && group.route?.length > 1 ? runtime().calcTravelRoute(group) : null;
      const eventCount = group.route?.filter(point => point.event && point.event.type !== 'none').length || 0;
      const iconHtml = group.iconIsImg && group.icon
        ? `<img src="${group.icon}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.textContent='📍'"/>`
        : (group.icon || '📍');

      const card = document.createElement('div');
      card.className = 'lg' + (isSelected ? ' sel' : '');
      card.dataset.action = 'select-travel-group';
      card.dataset.groupId = group.id;
      card.innerHTML = `<div class="lg1">
        <div class="lg-icon" style="width:${iconSize}px;height:${iconSize}px;font-size:${Math.round(iconSize * .65)}px;background:${group.color};border-color:${group.color};" data-action="edit-travel-group" data-group-id="${group.id}">${iconHtml}</div>
        <input class="lg-name" value="${runtime().esc(group.name)}" maxlength="40" data-blur-action="rename-travel-group" data-keydown-action="travel-group-name" data-group-id="${group.id}"/>
        <button class="lg-del" data-action="delete-travel-group" data-group-id="${group.id}">✕</button>
      </div>
      <div class="lg-info">${group.route?.length > 1 ? group.route.length + ' Punkte' : group.route?.length === 1 ? '1 Marker gesetzt' : '⬚ Kein Marker'}${calc ? ' · ' + calc.totalKm.toFixed(1) + ' km · ' + runtime().formatTravelHours(calc.totalH) : ''}${eventCount ? ' · ' + eventCount + ' Ereignis' + (eventCount > 1 ? 'se' : '') : ''}</div>
      <select class="lg-tm" data-input-action="set-travel-group-mode" data-group-id="${group.id}">${window.KartoLsbConfig.travelModes.map(mode => `<option value="${mode.id}"${mode.id === group.travelMode ? ' selected' : ''}>${mode.l}</option>`).join('')}</select>
      <div class="lg-btns">
        <button class="lgb" data-action="place-travel-group" data-group-id="${group.id}">📍</button>
        <button class="lgb" data-action="start-travel-route" data-group-id="${group.id}">✏ Route</button>
        <button class="lgb" data-action="continue-travel-route" data-group-id="${group.id}">➕</button>
        <button class="lgb red" data-action="clear-travel-route" data-group-id="${group.id}">✕ Route</button>
      </div>
      ${group.route?.length > 1 ? `<div class="wpl2" id="wpl-${group.id}"></div>` : ''}`;
      list.appendChild(card);

      if(group.route?.length > 1) renderWaypointList(group);
    });
  }

  function renderWaypointList(group){
    const waypointList = document.getElementById('wpl-' + group.id);
    if(!waypointList) return;
    const eventInfo = runtime().travelEventInfo();
    group.route.forEach((point, index) => {
      const hasEvent = point.event && point.event.type !== 'none';
      const info = hasEvent ? eventInfo[point.event.type] : null;
      const item = document.createElement('div');
      item.className = 'wpi2' + (hasEvent ? ' has-ev' : '');
      item.dataset.action = 'open-travel-waypoint';
      item.dataset.groupId = group.id;
      item.dataset.waypointIndex = String(index);
      item.innerHTML = `<span class="wpi2-ic">${index === 0 ? '🚩' : index === group.route.length - 1 ? '🏁' : hasEvent ? info.ic : '·'}</span><span class="wpi2-n">${point.event?.name || (index === 0 ? 'Start' : index === group.route.length - 1 ? 'Ziel' : 'Punkt ' + (index + 1))}</span>${hasEvent ? `<span class="wpi2-ev">${info.label}</span>` : ''}<button class="wpi2-del" data-action="delete-travel-waypoint" data-group-id="${group.id}" data-waypoint-index="${index}">✕</button>`;
      waypointList.appendChild(item);
    });
  }

  function selectGroup(groupId){
    runtime().setSelectedTravelGroup(groupId);
    renderGroups();
    runtime().updateTravelResult();
  }

  function renameGroup(groupId, value){
    const group = groups().find(item => item.id === groupId);
    if(group && value.trim()){
      group.name = value.trim();
      renderGroups();
      runtime().saveTravel();
    }
  }

  function deleteGroup(groupId){
    if(!confirm('Gruppe löschen?')) return;
    const state = lsbState();
    state.groups = groups().filter(item => item.id !== groupId);
    if(selectedGroupId() === groupId){
      runtime().setSelectedTravelGroup(null);
      runtime().setRouteDrawing(false);
    }
    renderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
  }

  function setTravelMode(groupId, value){
    const group = groups().find(item => item.id === groupId);
    if(group) group.travelMode = value;
    renderGroups();
    runtime().updateTravelResult();
    runtime().saveTravel();
  }

  function placeGroup(groupId){
    runtime().setSelectedTravelGroup(groupId);
    runtime().setTravelMode('place');
    runtime().toast('📍 Startmarker setzen');
  }

  function startRoute(groupId){
    const group = groups().find(item => item.id === groupId);
    if(!group) return;
    if(!group.route?.length){
      runtime().toast('Zuerst Startmarker setzen (📍)');
      return;
    }
    runtime().setSelectedTravelGroup(groupId);
    group.route = [{x:group.route[0].x, y:group.route[0].y}];
    runtime().setRouteDrawing(true);
    runtime().setTravelMode('route');
    renderGroups();
    runtime().startTravelRaf();
    runtime().toast('✏ Klicken=Wegpunkt · Doppelklick=fertig');
  }

  function continueRoute(groupId){
    const group = groups().find(item => item.id === groupId);
    if(!group) return;
    if(!group.route?.length){
      placeGroup(groupId);
      return;
    }
    runtime().setSelectedTravelGroup(groupId);
    runtime().setRouteDrawing(true);
    runtime().setTravelMode('route');
    runtime().startTravelRaf();
    runtime().toast('Fortsetzen — Doppelklick zum Beenden');
  }

  function clearRoute(groupId){
    const group = groups().find(item => item.id === groupId);
    if(group) group.route = [];
    runtime().setRouteDrawing(false);
    runtime().setLiveTravelMouse(null);
    renderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
  }

  function deleteWaypoint(groupId, waypointIndex){
    const group = groups().find(item => item.id === groupId);
    if(!group) return;
    group.route.splice(waypointIndex, 1);
    renderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
  }

  function finishRoute(){
    runtime().setRouteDrawing(false);
    runtime().setLiveTravelMouse(null);
    const group = groups().find(item => item.id === selectedGroupId());
    if(group && group.route.length < 2){
      group.route = group.route.slice(0, 1);
      runtime().toast('Route zu kurz');
    } else if(group) {
      runtime().toast('✓ Route fertig');
    }
    runtime().setTravelMode('pan');
    renderGroups();
    runtime().updateTravelResult();
    runtime().saveTravel();
  }

  window.KartoLsbGroups = {
    renderGroups,
    selectGroup,
    renameGroup,
    deleteGroup,
    setTravelMode,
    placeGroup,
    startRoute,
    continueRoute,
    clearRoute,
    deleteWaypoint,
    finishRoute,
  };

  window.lsbRenderGroups = renderGroups;
  window.lsbRenGrp = renameGroup;
  window.lsbDelGrp = deleteGroup;
  window.lsbSetTM = setTravelMode;
  window.lsbDoPlace = placeGroup;
  window.lsbStartRoute = startRoute;
  window.lsbContRoute = continueRoute;
  window.lsbClrRoute = clearRoute;
  window.lsbDelWp = deleteWaypoint;
  window.lsbFinRoute = finishRoute;
})();
