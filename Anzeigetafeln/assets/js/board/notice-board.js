(function () {
  'use strict';

  const config = window.TAFEL_CONFIG || {};
  let width = 0;
  let height = 0;
  let translateX = 0;
  let translateY = 0;
  let zoom = 1;
  let panning = false;
  let panOrigin = { x: 0, y: 0 };
  let placementHandler = null;

  const viewport = () => document.getElementById('board-viewport');
  const stage = () => document.getElementById('board-stage');
  const image = () => document.getElementById('ln');
  const cursor = () => document.getElementById('notice-placement-cursor');

  function placeholder(title) {
    const safeTitle = String(title || 'Anzeigetafel').replace(/[&<>"']/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000">
      <defs><pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 28 28 0" stroke="#9b6b2d" stroke-opacity=".09"/></pattern></defs>
      <rect width="1400" height="1000" fill="#6f451e"/>
      <rect x="46" y="46" width="1308" height="908" rx="18" fill="#c99a55" stroke="#3f240f" stroke-width="18"/>
      <rect x="76" y="76" width="1248" height="848" fill="url(#grain)" stroke="#e5c786" stroke-width="4"/>
      <text x="700" y="475" text-anchor="middle" font-family="serif" font-size="64" fill="#3f240f">${safeTitle}</text>
      <text x="700" y="555" text-anchor="middle" font-family="serif" font-size="30" fill="#5f3818">Tafelbild noch nicht hinterlegt</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function source() {
    const stateImage = window.TafelState.get().boardImages?.board;
    return stateImage || config.images?.board || placeholder(window.TafelState.get().regionTitle);
  }

  function applyTransform() {
    const element = stage();
    if (element) element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  }

  function fit() {
    if (!width || !height) return;
    const wrap = viewport();
    const scale = Math.min(wrap.clientWidth / width, wrap.clientHeight / height) * 0.96;
    zoom = Math.max(0.05, scale);
    translateX = (wrap.clientWidth - width * zoom) / 2;
    translateY = (wrap.clientHeight - height * zoom) / 2;
    applyTransform();
  }

  function applyImage(options = {}) {
    const boardImage = image();
    if (!boardImage) return;
    const nextSource = source();
    if (boardImage.src !== new URL(nextSource, document.baseURI).href) boardImage.src = nextSource;
    else if (options.fit) fit();
  }

  function pointFromClient(clientX, clientY) {
    const rect = viewport().getBoundingClientRect();
    return {
      x: (clientX - rect.left - translateX) / zoom,
      y: (clientY - rect.top - translateY) / zoom,
    };
  }

  function normalizedPointFromClient(clientX, clientY) {
    const point = pointFromClient(clientX, clientY);
    return {
      x: Math.max(0, Math.min(1, point.x / width)),
      y: Math.max(0, Math.min(1, point.y / height)),
    };
  }

  function startPlacement(handler) {
    placementHandler = typeof handler === 'function' ? handler : null;
    viewport().classList.toggle('is-placing', Boolean(placementHandler));
    cursor().hidden = !placementHandler;
  }

  function cancelPlacement() {
    placementHandler = null;
    viewport().classList.remove('is-placing');
    cursor().hidden = true;
  }

  function focusNotice(notice) {
    if (!notice || !width || !height) return;
    const wrap = viewport();
    zoom = Math.max(zoom, Math.min(1.2, wrap.clientWidth / width));
    translateX = wrap.clientWidth / 2 - notice.x * width * zoom;
    translateY = wrap.clientHeight / 2 - notice.y * height * zoom;
    applyTransform();
    const marker = document.querySelector(`[data-notice-id="${CSS.escape(notice.id)}"]`);
    marker?.classList.add('is-highlighted');
    window.setTimeout(() => marker?.classList.remove('is-highlighted'), 900);
  }

  function bindPointerEvents() {
    const wrap = viewport();
    wrap.addEventListener('wheel', event => {
      event.preventDefault();
      const rect = wrap.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? 1.1 : 0.91;
      const nextZoom = Math.max(0.05, Math.min(8, zoom * factor));
      const actualFactor = nextZoom / zoom;
      translateX = screenX - (screenX - translateX) * actualFactor;
      translateY = screenY - (screenY - translateY) * actualFactor;
      zoom = nextZoom;
      applyTransform();
    }, { passive: false });

    wrap.addEventListener('pointerdown', event => {
      if (event.button !== 0 || placementHandler || event.target.closest('[data-notice-id]')) return;
      panning = true;
      panOrigin = { x: event.clientX, y: event.clientY };
      wrap.setPointerCapture?.(event.pointerId);
      wrap.classList.add('is-panning');
    });
    wrap.addEventListener('pointermove', event => {
      const placementCursor = cursor();
      if (placementHandler) {
        placementCursor.style.left = `${event.clientX}px`;
        placementCursor.style.top = `${event.clientY}px`;
      }
      if (!panning) return;
      translateX += event.clientX - panOrigin.x;
      translateY += event.clientY - panOrigin.y;
      panOrigin = { x: event.clientX, y: event.clientY };
      applyTransform();
    });
    wrap.addEventListener('pointerup', event => {
      if (panning) {
        panning = false;
        wrap.releasePointerCapture?.(event.pointerId);
        wrap.classList.remove('is-panning');
        return;
      }
      if (!placementHandler || event.target.closest('[data-notice-id]')) return;
      const handler = placementHandler;
      const position = normalizedPointFromClient(event.clientX, event.clientY);
      cancelPlacement();
      handler(position);
    });
    wrap.addEventListener('pointerleave', () => {
      if (panning) wrap.classList.remove('is-panning');
      panning = false;
    });
    wrap.addEventListener('contextmenu', event => event.preventDefault());
  }

  function init() {
    const boardImage = image();
    boardImage.addEventListener('load', () => {
      width = boardImage.naturalWidth || 1400;
      height = boardImage.naturalHeight || 1000;
      stage().style.width = `${width}px`;
      stage().style.height = `${height}px`;
      window.TafelRuntime?.renderZettel();
      fit();
    });
    boardImage.addEventListener('error', () => {
      boardImage.src = placeholder(window.TafelState.get().regionTitle);
      window.TafelRuntime?.toast('Tafelbild konnte nicht geladen werden');
    });
    bindPointerEvents();
    applyImage({ fit: true });
    new ResizeObserver(fit).observe(viewport());
  }

  window.TafelBoard = Object.freeze({
    init,
    fit,
    applyImage,
    startPlacement,
    cancelPlacement,
    focusNotice,
    pointFromClient,
    imageSize: () => ({ w: width, h: height }),
    viewport,
  });
})();
