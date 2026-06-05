(function(){
  const calculations = window.KartoLsbCalculations;

  let canvas = null;
  let context = null;

  function runtime(){
    return window.KartoRuntime;
  }

  function state(){
    return runtime().lsbState();
  }

  function transformPoint(point){
    const transform = runtime().mapTransform();
    return {
      x: point.x * transform.z + transform.x,
      y: point.y * transform.z + transform.y,
    };
  }

  function isMapReady(){
    const size = runtime().mapImageSize();
    return canvas && context && size.width;
  }

  function drawLabel(x, y, text, color){
    context.save();
    context.font = 'bold 11px "Cinzel",serif';
    const textWidth = context.measureText(text).width;
    const rx = x - textWidth / 2 - 4;
    const ry = y - 8;
    const rw = textWidth + 8;
    const rh = 16;
    const radius = 3;
    context.fillStyle = 'rgba(240,228,180,.9)';
    context.beginPath();
    context.moveTo(rx + radius, ry);
    context.lineTo(rx + rw - radius, ry);
    context.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
    context.lineTo(rx + rw, ry + rh - radius);
    context.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
    context.lineTo(rx + radius, ry + rh);
    context.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
    context.lineTo(rx, ry + radius);
    context.quadraticCurveTo(rx, ry, rx + radius, ry);
    context.closePath();
    context.fill();
    context.fillStyle = color || '#9a7520';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.restore();
  }

  function drawCalibration(){
    window.KartoLsbTools.calibrationPoints().forEach((point, index) => {
      const screen = transformPoint(point);
      context.save();
      context.beginPath();
      context.arc(screen.x, screen.y, 7, 0, Math.PI * 2);
      context.fillStyle = 'rgba(60,200,80,.9)';
      context.fill();
      context.strokeStyle = '#fff';
      context.lineWidth = 1.5;
      context.stroke();
      context.font = 'bold 9px sans-serif';
      context.fillStyle = '#fff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(index + 1, screen.x, screen.y);
      context.restore();
    });
  }

  function drawMeasure(){
    const points = window.KartoLsbTools.measurePoints();
    if(points.length > 1){
      context.save();
      context.strokeStyle = 'rgba(154,117,32,.9)';
      context.lineWidth = 2;
      context.setLineDash([6, 4]);
      context.beginPath();
      points.forEach((point, index) => {
        const screen = transformPoint(point);
        if(index === 0) context.moveTo(screen.x, screen.y);
        else context.lineTo(screen.x, screen.y);
      });
      context.stroke();
      context.restore();
    }

    points.forEach(point => {
      const screen = transformPoint(point);
      context.save();
      context.beginPath();
      context.arc(screen.x, screen.y, 5, 0, Math.PI * 2);
      context.fillStyle = 'rgba(154,117,32,.9)';
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,.5)';
      context.lineWidth = 1;
      context.stroke();
      context.restore();
    });

    if(points.length > 1 && runtime().travelScale()){
      const last = points[points.length - 1];
      const screen = transformPoint(last);
      drawLabel(screen.x, screen.y - 16, window.KartoLsbTools.pathKm(points).toFixed(2) + ' km', '#9a7520');
    }
  }

  function drawGroup(group){
    if(!group.route?.length) return;
    const selected = runtime().selectedTravelGroup() === group.id;
    const drag = runtime().travelDragState();
    const dragging = drag.ready && drag.groupId === group.id;
    if(group.route.length > 1){
      context.save();
      context.strokeStyle = group.color + (selected ? '' : '88');
      context.lineWidth = selected ? 3.5 : 2.5;
      context.setLineDash([]);
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.beginPath();
      group.route.forEach((point, index) => {
        const screen = transformPoint(point);
        if(index === 0) context.moveTo(screen.x, screen.y);
        else context.lineTo(screen.x, screen.y);
      });
      context.stroke();
      context.restore();
      if(runtime().travelScale()){
        const km = calculations.groupKm(group, runtime().travelScale());
        const middle = calculations.routeMid(group.route);
        const screen = transformPoint(middle);
        drawLabel(screen.x, screen.y, km.toFixed(1) + ' km', group.color);
      }
    }

    const radius = Math.max(8, runtime().travelIconSize() || 22);
    const eventInfo = runtime().travelEventInfo();
    group.route.forEach((point, index) => {
      const screen = transformPoint(point);
      const isFirst = index === 0;
      const isLast = index === group.route.length - 1 && group.route.length > 1;
      const hasEvent = point.event && point.event.type !== 'none';
      const info = hasEvent ? eventInfo[point.event.type] : null;
      const beingDragged = dragging && drag.waypointIndex === index;
      if(isFirst){
        const pinRadius = selected ? radius * 1.2 : radius;
        context.save();
        if(beingDragged){
          const time = Date.now() * .005;
          const pulse = (Math.sin(time) + 1) * .5;
          context.beginPath();
          context.arc(screen.x, screen.y - pinRadius, pinRadius + 6 + pulse * 5, 0, Math.PI * 2);
          context.strokeStyle = group.color;
          context.lineWidth = 2.5;
          context.globalAlpha = .25 + pulse * .35;
          context.stroke();
          context.globalAlpha = 1;
        }
        context.beginPath();
        context.arc(screen.x, screen.y - pinRadius, pinRadius, 0, Math.PI * 2);
        context.fillStyle = group.color;
        context.fill();
        context.strokeStyle = 'rgba(255,255,255,.85)';
        context.lineWidth = beingDragged ? 3 : 2;
        context.stroke();
        context.beginPath();
        context.moveTo(screen.x - pinRadius * .42, screen.y - pinRadius * .5);
        context.lineTo(screen.x, screen.y + 3);
        context.lineTo(screen.x + pinRadius * .42, screen.y - pinRadius * .5);
        context.fillStyle = group.color;
        context.fill();
        if(group.iconIsImg && group._imgEl){
          context.save();
          context.beginPath();
          context.arc(screen.x, screen.y - pinRadius, pinRadius * .75, 0, Math.PI * 2);
          context.clip();
          context.drawImage(group._imgEl, screen.x - pinRadius * .75, screen.y - pinRadius * 1.75, pinRadius * 1.5, pinRadius * 1.5);
          context.restore();
        } else {
          context.font = `${pinRadius}px serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(group.icon || '📍', screen.x, screen.y - pinRadius);
        }
        context.restore();
        drawLabel(screen.x, screen.y - pinRadius * 2 - 10, point.event?.name || group.name, group.color);
      } else if(isLast){
        context.save();
        context.beginPath();
        context.arc(screen.x, screen.y, radius * .7, 0, Math.PI * 2);
        context.fillStyle = 'rgba(240,228,180,.95)';
        context.fill();
        context.strokeStyle = beingDragged ? 'rgba(255,255,255,.9)' : group.color;
        context.lineWidth = beingDragged ? 3 : 2;
        context.stroke();
        context.font = `${radius * .9}px serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('🏁', screen.x, screen.y);
        context.restore();
        drawLabel(screen.x, screen.y - radius - 12, point.event?.name || (group.name + ' → Ziel'), group.color);
      } else {
        const hitRadius = hasEvent ? radius * .7 : radius * .35;
        context.save();
        context.beginPath();
        context.arc(screen.x, screen.y, hitRadius, 0, Math.PI * 2);
        context.fillStyle = hasEvent ? 'rgba(240,228,180,.95)' : group.color + '55';
        context.fill();
        context.strokeStyle = hasEvent ? info.col : group.color + '88';
        context.lineWidth = hasEvent ? 2 : 1.5;
        context.stroke();
        if(hasEvent){
          context.font = `${hitRadius * 1.2}px serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(info.ic, screen.x, screen.y);
          if(point.event.name || info.label) drawLabel(screen.x, screen.y - hitRadius - 10, point.event.name || info.label, info.col);
        }
        context.restore();
      }
    });
  }

  function drawLiveRoutePreview(){
    if(runtime().travelMode() !== 'route' || !runtime().isRouteDrawing() || !runtime().liveTravelMouse()) return;
    const group = runtime().travelGroups().find(item => item.id === runtime().selectedTravelGroup());
    if(!group?.route?.length) return;
    const last = group.route[group.route.length - 1];
    const a = transformPoint(last);
    const b = transformPoint(runtime().liveTravelMouse());
    context.save();
    context.strokeStyle = group.color + '55';
    context.lineWidth = 1.5;
    context.setLineDash([3, 4]);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
    context.restore();
  }

  function draw(){
    if(!isMapReady()) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCalibration();
    drawMeasure();
    runtime().travelGroups().forEach(drawGroup);
    drawLiveRoutePreview();
  }

  function hitWaypoint(mx, my){
    const threshold = 16 / runtime().mapTransform().z;
    for(const group of [...runtime().travelGroups()].reverse()){
      if(!group.route?.length) continue;
      for(let index = 0; index < group.route.length; index++){
        const point = group.route[index];
        const dx = mx - point.x;
        const dy = my - point.y;
        if(Math.sqrt(dx * dx + dy * dy) < threshold) return {g:group, i:index};
      }
    }
    return null;
  }

  function init(){
    canvas = document.getElementById('measure-canvas');
    context = canvas.getContext('2d');
    const resize = () => {
      const size = runtime().mapViewportSize();
      if(canvas.width !== size.width || canvas.height !== size.height){
        canvas.width = size.width;
        canvas.height = size.height;
      }
    };
    resize();
    new ResizeObserver(resize).observe(document.getElementById('map-wrap'));
    (function loop(){
      requestAnimationFrame(loop);
      draw();
    })();
  }

  window.KartoLsbCanvas = {
    init,
    draw,
    hitWaypoint,
  };
})();
