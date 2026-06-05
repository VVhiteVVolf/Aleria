(function(){
  const config = window.KartoLsbConfig;

  function getTravelMode(id){
    return config.travelModes.find(mode => mode.id === id) || config.travelModes[0];
  }

  function formatHours(hours){
    if(hours <= 0) return '0 Min.';
    if(hours < 0.017) return 'wenige Min.';
    if(hours < 1) return Math.round(hours * 60) + ' Min.';
    const days = Math.floor(hours / 10);
    const remainder = hours % 10;
    const wholeHours = Math.floor(remainder);
    const minutes = Math.round((remainder - wholeHours) * 60);
    let text = '';
    if(days) text += days + 'T ';
    if(wholeHours) text += wholeHours + 'h ';
    if(minutes) text += minutes + 'min';
    return text.trim();
  }

  function colorWithOpacity(hex, percent){
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${(percent / 100).toFixed(2)})`;
  }

  function pathKm(points, scale){
    let total = 0;
    for(let index = 1; index < points.length; index++){
      const dx = points[index].x - points[index - 1].x;
      const dy = points[index].y - points[index - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total * (scale || 0);
  }

  function groupKm(group, scale){
    return pathKm(group.route || [], scale);
  }

  function routeMid(points){
    let total = 0;
    const segments = [];
    for(let index = 1; index < points.length; index++){
      const dx = points[index].x - points[index - 1].x;
      const dy = points[index].y - points[index - 1].y;
      segments.push(Math.sqrt(dx * dx + dy * dy));
      total += segments[segments.length - 1];
    }
    let accumulated = 0;
    const half = total / 2;
    for(let index = 0; index < segments.length; index++){
      if(accumulated + segments[index] >= half){
        const ratio = (half - accumulated) / segments[index];
        return {
          x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
          y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
        };
      }
      accumulated += segments[index];
    }
    return points[Math.floor(points.length / 2)];
  }

  function applyEvent(event, activeTravelMode){
    const info = config.eventInfo[event.type] || config.eventInfo.custom;
    let delayHours = 0;
    let travelMode = null;
    let speedMultiplier;
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
        const multiplier = {light:.7, medium:.5, severe:.3, heal:1}[event.injSev] || .5;
        speedMultiplier = multiplier;
        note = `${info.ic} Tempo ×${multiplier}`;
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
        note = `🔄 ${getTravelMode(travelMode).l}`;
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

  function calcRoute(group, scale){
    if(!group.route || group.route.length < 2 || !scale) return null;
    let totalKm = 0;
    let travelH = 0;
    let delayH = 0;
    const breakdown = [];
    let activeTravelMode = group.travelMode || 'foot_e';
    let speedMultiplier = 1;

    for(let index = 0; index < group.route.length - 1; index++){
      const from = group.route[index];
      const to = group.route[index + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const segmentKm = Math.sqrt(dx * dx + dy * dy) * scale;
      totalKm += segmentKm;
      const event = from.event;
      if(event && event.type !== 'none'){
        const result = applyEvent(event, activeTravelMode);
        delayH += result.dh;
        if(result.tm) activeTravelMode = result.tm;
        if(result.sm !== undefined) speedMultiplier = result.sm;
        if(result.note) breakdown.push(result.note);
      }
      travelH += segmentKm / (getTravelMode(activeTravelMode).kmh * speedMultiplier);
    }

    const lastEvent = group.route[group.route.length - 1]?.event;
    if(lastEvent && lastEvent.type !== 'none'){
      const result = applyEvent(lastEvent, activeTravelMode);
      delayH += result.dh;
      if(result.note) breakdown.push(result.note);
    }

    return {totalKm, travelH, delayH, totalH:travelH + delayH, breakdown};
  }

  window.KartoLsbCalculations = {
    getTravelMode,
    formatHours,
    colorWithOpacity,
    pathKm,
    groupKm,
    routeMid,
    applyEvent,
    calcRoute,
  };
})();
