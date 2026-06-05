(function(){
  'use strict';

  function distance(points, scale){
    let total = 0;
    for(let i = 1; i < points.length; i++){
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total * (scale || 0);
  }

  function routeMid(points){
    let total = 0;
    const segments = [];
    for(let i = 1; i < points.length; i++){
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      segments.push(Math.sqrt(dx * dx + dy * dy));
      total += segments[segments.length - 1];
    }
    let acc = 0;
    const half = total / 2;
    for(let i = 0; i < segments.length; i++){
      if(acc + segments[i] >= half){
        const t = (half - acc) / segments[i];
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * t,
          y: points[i].y + (points[i + 1].y - points[i].y) * t
        };
      }
      acc += segments[i];
    }
    return points[Math.floor(points.length / 2)];
  }

  function applyEvent(event, activeTravelMode, formatHours){
    const info = window.TafelLsbConfig.EVENT_INFO[event.type] || window.TafelLsbConfig.EVENT_INFO.custom;
    let delayHours = 0;
    let travelMode = null;
    let speedMultiplier = undefined;
    let note = '';
    switch(event.type){
      case 'stop':
        delayHours = parseFloat(event.stopH) || 10;
        note = `${info.ic} ${event.name || 'Stop'}: +${formatHours(delayHours)}`;
        break;
      case 'camp':
        delayHours = parseFloat(event.campH) || 7;
        note = `${info.ic} ${event.name || 'Lager'}: +${formatHours(delayHours)}`;
        break;
      case 'horse':
        delayHours = parseFloat(event.horseH) || 1;
        travelMode = event.horseTM || activeTravelMode;
        speedMultiplier = 1;
        note = `${info.ic} +${formatHours(delayHours)}`;
        break;
      case 'injury': {
        delayHours = parseFloat(event.injH) || 0;
        const multipliers = {light:.7, medium:.5, severe:.3, heal:1};
        speedMultiplier = multipliers[event.injSev] || .5;
        note = `${info.ic} Tempo ×${speedMultiplier}`;
        break;
      }
      case 'encounter':
        delayHours = parseFloat(event.encH) || 2;
        note = `${info.ic} +${formatHours(delayHours)}`;
        break;
      case 'obstacle':
        delayHours = parseFloat(event.obsH) || 2;
        note = `${info.ic} +${formatHours(delayHours)}`;
        break;
      case 'travelchange':
        travelMode = event.tcTM || activeTravelMode;
        note = `🔄 ${window.TafelLsbConfig.getTravelMode(travelMode).l}`;
        break;
      case 'custom': {
        delayHours = parseFloat(event.custH) || 0;
        const speed = parseFloat(event.custSp) || 1;
        if(speed !== 1) speedMultiplier = speed;
        note = `📜 ${event.name || ''}${delayHours ? ': +' + formatHours(delayHours) : ''}`;
        break;
      }
    }
    return {dh:delayHours, tm:travelMode, sm:speedMultiplier, note};
  }

  function calcRoute(group, scale, formatHours){
    if(!group.route || group.route.length < 2 || !scale) return null;
    let totalKm = 0;
    let travelH = 0;
    let delayH = 0;
    const breakdown = [];
    let activeTravelMode = group.travelMode || 'foot_e';
    let speedMultiplier = 1;
    for(let i = 0; i < group.route.length - 1; i++){
      const p0 = group.route[i];
      const p1 = group.route[i + 1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segmentKm = Math.sqrt(dx * dx + dy * dy) * scale;
      totalKm += segmentKm;
      const event = p0.event;
      if(event && event.type !== 'none'){
        const result = applyEvent(event, activeTravelMode, formatHours);
        delayH += result.dh;
        if(result.tm) activeTravelMode = result.tm;
        if(result.sm !== undefined) speedMultiplier = result.sm;
        if(result.note) breakdown.push(result.note);
      }
      travelH += segmentKm / (window.TafelLsbConfig.getTravelMode(activeTravelMode).kmh * speedMultiplier);
    }
    const lastEvent = group.route[group.route.length - 1]?.event;
    if(lastEvent && lastEvent.type !== 'none'){
      const result = applyEvent(lastEvent, activeTravelMode, formatHours);
      delayH += result.dh;
      if(result.note) breakdown.push(result.note);
    }
    return {totalKm, travelH, delayH, totalH:travelH + delayH, breakdown};
  }

  window.TafelLsbCalculations = {
    distance,
    routeMid,
    applyEvent,
    calcRoute
  };
})();
