// Page curl canvas and gesture engine for modal page turns.
let _curlCanvas = null;
let _curlCtx = null;
let _curlActive = false;
let _curlProgress = 0;
let _curlDir = 1;
let _curlDragging = false;
let _curlDragStartX = 0;
let _curlAnimId = null;

function cancelCurlInteraction() {
  if (_curlAnimId) {
    cancelAnimationFrame(_curlAnimId);
    _curlAnimId = null;
  }
  _curlActive = false;
  _curlDragging = false;
  _curlProgress = 0;
  drawCurlFrame(0, _curlDir);
}

function bindCurlCorner(corner, dir) {
  if (!corner || corner.dataset.curlCornerBound === 'true') return;
  corner.dataset.curlCornerBound = 'true';
  corner.addEventListener('mousedown', event => curlDragStart(event, dir));
  corner.addEventListener('touchstart', event => curlDragStart(event, dir), { passive: false });
  corner.addEventListener('click', () => {
    if (_curlProgress < 0.05) curlFlip(dir);
  });
}

function initCurlCanvas() {
  const card = document.querySelector('.modal-card');
  if (!card) return;
  if (document.getElementById('curl-canvas')) {
    _curlCanvas = document.getElementById('curl-canvas');
    _curlCtx = _curlCanvas.getContext('2d');
    sizeCurlCanvas();
    return;
  }
  _curlCanvas = document.createElement('canvas');
  _curlCanvas.id = 'curl-canvas';
  card.appendChild(_curlCanvas);
  _curlCtx = _curlCanvas.getContext('2d');
  sizeCurlCanvas();

  let cr = document.getElementById('curl-corner-right');
  let cl = document.getElementById('curl-corner-left');
  if (!cr) {
    cr = document.createElement('div');
    cr.id = 'curl-corner-right';
    cr.className = 'curl-corner-right';
    card.appendChild(cr);
  }
  if (!cl) {
    cl = document.createElement('div');
    cl.id = 'curl-corner-left';
    cl.className = 'curl-corner-left';
    card.appendChild(cl);
  }

  bindCurlCorner(cr, 1);
  bindCurlCorner(cl, -1);
}

function sizeCurlCanvas() {
  if (!_curlCanvas) return;
  const card = document.querySelector('.modal-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  _curlCanvas.width = rect.width;
  _curlCanvas.height = rect.height;
}

function showCurlCorners(show) {
  const cr = document.getElementById('curl-corner-right');
  const cl = document.getElementById('curl-corner-left');
  if (cr) cr.style.display = show ? 'block' : 'none';
  if (cl) cl.style.display = show ? 'block' : 'none';
}

function clearCurlCanvas() {
  if (_curlCanvas && _curlCtx) {
    _curlCtx.clearRect(0, 0, _curlCanvas.width, _curlCanvas.height);
  }
}

function drawCurlFrame(progress, dir) {
  if (!_curlCtx || !_curlCanvas) return;
  const ctx = _curlCtx;
  const w = _curlCanvas.width;
  const h = _curlCanvas.height;
  ctx.clearRect(0, 0, w, h);
  if (progress <= 0.001) return;

  const foldX = dir === 1
    ? w * (1 - progress)
    : w * progress;

  const squeeze = 0.07 * progress;
  const topY = h * squeeze;
  const botY = h * (1 - squeeze);

  if (dir === 1) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(foldX, topY);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(foldX, botY);
    ctx.closePath();
    const bg = ctx.createLinearGradient(foldX, 0, w, 0);
    bg.addColorStop(0, 'rgba(185,145,85,0.96)');
    bg.addColorStop(0.4, 'rgba(205,165,105,0.92)');
    bg.addColorStop(1, 'rgba(165,125,65,0.88)');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.restore();

    ctx.save();
    const sw = Math.min(90, w * 0.12);
    const sh = ctx.createLinearGradient(Math.max(0, foldX - sw), 0, foldX + 8, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = sh;
    ctx.fillRect(Math.max(0, foldX - sw), 0, sw + 8, h);
    ctx.restore();

    ctx.save();
    const cg = ctx.createLinearGradient(foldX - 5, 0, foldX + 5, 0);
    cg.addColorStop(0, 'rgba(255,240,195,0)');
    cg.addColorStop(0.5, 'rgba(255,245,210,0.75)');
    cg.addColorStop(1, 'rgba(255,240,195,0)');
    ctx.strokeStyle = cg;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(foldX, topY);
    ctx.lineTo(foldX, botY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    const fs = ctx.createLinearGradient(foldX, 0, Math.max(0, foldX - 50), 0);
    fs.addColorStop(0, 'rgba(0,0,0,0.16)');
    fs.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fs;
    ctx.fillRect(Math.max(0, foldX - 50), 0, 50, h);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(foldX, topY);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, h);
  ctx.lineTo(foldX, botY);
  ctx.closePath();
  const bg = ctx.createLinearGradient(0, 0, foldX, 0);
  bg.addColorStop(0, 'rgba(165,125,65,0.88)');
  bg.addColorStop(0.6, 'rgba(205,165,105,0.92)');
  bg.addColorStop(1, 'rgba(185,145,85,0.96)');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  const sw = Math.min(90, w * 0.12);
  const sh = ctx.createLinearGradient(foldX - 8, 0, Math.min(w, foldX + sw), 0);
  sh.addColorStop(0, 'rgba(0,0,0,0.2)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(foldX - 8, 0, sw + 8, h);
  ctx.restore();

  ctx.save();
  const cg = ctx.createLinearGradient(foldX - 5, 0, foldX + 5, 0);
  cg.addColorStop(0, 'rgba(255,240,195,0)');
  cg.addColorStop(0.5, 'rgba(255,245,210,0.75)');
  cg.addColorStop(1, 'rgba(255,240,195,0)');
  ctx.strokeStyle = cg;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(foldX, topY);
  ctx.lineTo(foldX, botY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  const fs = ctx.createLinearGradient(foldX, 0, Math.min(w, foldX + 50), 0);
  fs.addColorStop(0, 'rgba(0,0,0,0.16)');
  fs.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fs;
  ctx.fillRect(foldX, 0, 50, h);
  ctx.restore();
}

function curlAnimateTo(target, onDone) {
  if (_curlAnimId) cancelAnimationFrame(_curlAnimId);
  function step() {
    const diff = target - _curlProgress;
    if (Math.abs(diff) < 0.004) {
      _curlProgress = target;
      drawCurlFrame(_curlProgress, _curlDir);
      _curlAnimId = null;
      if (onDone) onDone();
      return;
    }
    _curlProgress += diff * 0.14;
    drawCurlFrame(_curlProgress, _curlDir);
    _curlAnimId = requestAnimationFrame(step);
  }
  step();
}

function restoreCurlAfterPageRender() {
  setTimeout(() => { initCurlCanvas(); showCurlCorners(true); sizeCurlCanvas(); }, 20);
}

function curlFlip(dir) {
  if (_curlActive) return;
  const pages = getPages(currentEntry);
  const total = pages.length;
  if (dir === 1 && currentPage >= total - 1) return;
  if (dir === -1 && currentPage <= 0) return;
  _curlActive = true;
  _curlDir = dir;
  _curlProgress = 0;
  curlAnimateTo(1, () => {
    if (!currentEntry) return;
    currentPage += dir;
    renderPage(currentPage, 0);
    _curlProgress = 0;
    drawCurlFrame(0, _curlDir);
    _curlActive = false;
    restoreCurlAfterPageRender();
  });
}

function curlDragStart(event, dir) {
  if (_curlActive) return;
  const pages = getPages(currentEntry);
  const total = pages.length;
  if (dir === 1 && currentPage >= total - 1) return;
  if (dir === -1 && currentPage <= 0) return;
  _curlDragging = true;
  _curlDir = dir;
  _curlProgress = 0;
  _curlDragStartX = event.touches ? event.touches[0].clientX : event.clientX;
  if (_curlAnimId) cancelAnimationFrame(_curlAnimId);
  event.preventDefault();
}

document.addEventListener('mousemove', event => {
  if (!_curlDragging || !_curlCanvas) return;
  const width = _curlCanvas.width;
  const dx = event.clientX - _curlDragStartX;
  const raw = _curlDir === 1 ? -dx / width : dx / width;
  _curlProgress = Math.max(0, Math.min(1, raw));
  drawCurlFrame(_curlProgress, _curlDir);
});

document.addEventListener('mouseup', () => {
  if (!_curlDragging) return;
  _curlDragging = false;
  if (_curlProgress >= 0.32) {
    _curlActive = true;
    curlAnimateTo(1, () => {
      if (!currentEntry) return;
      currentPage += _curlDir;
      renderPage(currentPage, 0);
      _curlProgress = 0;
      drawCurlFrame(0, _curlDir);
      _curlActive = false;
      restoreCurlAfterPageRender();
    });
    return;
  }
  curlAnimateTo(0, () => { _curlProgress = 0; });
});

document.addEventListener('touchmove', event => {
  if (!_curlDragging || !_curlCanvas) return;
  const width = _curlCanvas.width;
  const dx = event.touches[0].clientX - _curlDragStartX;
  const raw = _curlDir === 1 ? -dx / width : dx / width;
  _curlProgress = Math.max(0, Math.min(1, raw));
  drawCurlFrame(_curlProgress, _curlDir);
}, { passive: true });

document.addEventListener('touchend', () => {
  if (_curlDragging) document.dispatchEvent(new Event('mouseup'));
});
