(function () {
  'use strict';
  const records = new Map();
  let resolutionTimer;
  let lastResolutionKey;
  const absolute = source => new URL(window.KartoMapImageSources?.toPublicUrl(source) || source, document.baseURI).href;

  function descriptorFor(source) {
    return Object.values(window.KARTO_CONFIG?.rasterImages || {}).find(item => absolute(item.source) === absolute(source));
  }

  function chooseLevel(descriptor, scale, pixelRatio = 1) {
    const required = descriptor.width * scale * pixelRatio;
    return descriptor.levels.find(level => level.width >= required) || descriptor.levels.at(-1);
  }

  function request(record) {
    if (!record.element.isConnected) { records.delete(record.element); return; }
    if (!record.active) return;
    const runtime = window.KartoRuntime;
    const size = runtime?.mapImageSize();
    const viewport = runtime?.mapViewportSize();
    const scale = size?.width ? runtime.mapTransform().z
      : Math.min((viewport?.width || 1600) / (record.descriptor?.width || 1600), (viewport?.height || 1000) / (record.descriptor?.height || 1000));
    const level = record.descriptor && chooseLevel(record.descriptor, scale, window.devicePixelRatio || 1);
    const source = level && !record.failed.has(level.src) ? level.src : record.source;
    if (record.element.getAttribute('src') === source) return;
    record.requested = source;
    record.element.decoding = 'async';
    record.element.src = source;
  }

  function setSource(element, source) {
    if (!element) return;
    let record = records.get(element);
    if (record?.source === source) { request(record); return; }
    const descriptor = descriptorFor(source);
    const overlay = element.dataset.overlay;
    const active = !overlay || document.getElementById('lb-' + overlay)?.classList.contains('on') === true;
    record = { element, source, descriptor, active, failed: new Set() };
    records.set(element, record);
    element.dataset.mapSource = source;
    delete element.dataset.registryFallback;
    if (descriptor) {
      element.dataset.mapWidth = String(descriptor.width);
      element.dataset.mapHeight = String(descriptor.height);
      element.style.width = descriptor.width + 'px'; element.style.height = descriptor.height + 'px';
    } else {
      delete element.dataset.mapWidth; delete element.dataset.mapHeight;
      element.style.width = ''; element.style.height = '';
    }
    if (!element.dataset.rasterErrorBound) {
      element.dataset.rasterErrorBound = 'true';
      element.addEventListener('error', () => {
        const current = records.get(element);
        if (current) current.failed.add(current.requested);
      });
    }
    // An inactive overlay must not allocate or decode its full raster at boot.
    element.style.display = active ? '' : 'none';
    if (!active) element.removeAttribute('src');
    else request(record);
  }

  function activate(element, active) {
    const record = records.get(element);
    if (!record) return;
    record.active = active;
    element.style.display = active ? '' : 'none';
    request(record);
  }

  window.addEventListener('aleria:karto:view-changed', () => {
    const key = `${window.KartoRuntime?.mapTransform().z}:${window.devicePixelRatio || 1}`;
    if (key === lastResolutionKey) return;
    lastResolutionKey = key;
    clearTimeout(resolutionTimer);
    resolutionTimer = setTimeout(() => records.forEach(request), 140);
  });
  window.KartoMapRasterImages = Object.freeze({ setSource, activate, chooseLevel });
})();
