#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

/**
 * Read-only browser audit for rendered family trees.
 *
 * The unit tests validate source data and layout plans. This script closes the
 * remaining gap by checking the DOM and SVG geometry produced by Family Chart.
 * It deliberately owns no application state and can be run against any local
 * server plus an already running Chromium debugging endpoint.
 */

const argumentsByName = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!argument.startsWith('--')) continue;
  const [name, inlineValue] = argument.slice(2).split('=', 2);
  const value = inlineValue ?? process.argv[index + 1];
  argumentsByName.set(name, value);
  if (inlineValue === undefined) index += 1;
}

const baseUrl = argumentsByName.get('base') || 'http://127.0.0.1:4173/Stammbaum.html';
const debuggingUrl = argumentsByName.get('debug') || 'http://127.0.0.1:9224';
let familyIds = String(argumentsByName.get('families') || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const auditWholeRegistry = String(argumentsByName.get('all') || '').toLowerCase() === 'true';
const registryStart = Math.max(0, Number.parseInt(argumentsByName.get('start') || '0', 10) || 0);
const registryLimit = Math.max(0, Number.parseInt(argumentsByName.get('limit') || '0', 10) || 0);
const summaryOnly = String(argumentsByName.get('summary') || '').toLowerCase() === 'true';
const summaryDetails = String(argumentsByName.get('details') || '').toLowerCase() === 'true';
const debugShapes = String(argumentsByName.get('debug-shapes') || '').toLowerCase() === 'true';
const failuresOnly = String(argumentsByName.get('failures-only') || '').toLowerCase() === 'true';
const screenshotPath = String(argumentsByName.get('screenshot') || '').trim();
const fitBeforeAudit = String(argumentsByName.get('fit') || '').toLowerCase() === 'true';
const centeredCardId = String(argumentsByName.get('center-card') || '').trim();
const centerFirstLineCrossing = String(
  argumentsByName.get('center-crossing') || ''
).toLowerCase() === 'true';
const settleMilliseconds = Math.max(0, Number.parseInt(argumentsByName.get('settle-ms') || '650', 10) || 0);
const pollMilliseconds = Math.max(50, Number.parseInt(argumentsByName.get('poll-ms') || '500', 10) || 500);
const viewportWidth = Math.max(320, Number.parseInt(argumentsByName.get('viewport-width') || '0', 10) || 0);
const viewportHeight = Math.max(240, Number.parseInt(argumentsByName.get('viewport-height') || '0', 10) || 0);

if (auditWholeRegistry) {
  const { FAMILY_REGISTRY } = await import('../assets/js/data/families.registry.js');
  const registeredFamilyIds = FAMILY_REGISTRY.map(record => record.id).filter(Boolean);
  familyIds = registryLimit > 0
    ? registeredFamilyIds.slice(registryStart, registryStart + registryLimit)
    : registeredFamilyIds.slice(registryStart);
}

if (!familyIds.length) {
  throw new Error('Mindestens eine Familie muss über --families angegeben werden.');
}

async function wait(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function chromiumTarget() {
  const response = await fetch(`${debuggingUrl}/json/list`);
  if (!response.ok) throw new Error(`Chromium-Ziel nicht erreichbar (${response.status}).`);
  const targets = await response.json();
  return targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl)
    || targets.find(target => target.webSocketDebuggerUrl)
    || null;
}

class DevToolsSession {
  constructor(socketUrl) {
    this.socket = new WebSocket(socketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
    });
  }

  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

const auditExpression = String.raw`(async () => {
  await document.fonts?.ready;
  await new Promise(resolve => setTimeout(resolve, ${settleMilliseconds}));

  const chartContainer = document.querySelector('[data-layout-collision-count]')
    || document.querySelector('.f3');
  const canvas = document.querySelector('#f3Canvas');
  const cardElements = [...document.querySelectorAll('.card_cont')];
  const cards = cardElements.map((element, index) => {
    const hierarchyNode = element.__data__;
    const id = hierarchyNode?.data?.data?.id
      || hierarchyNode?.data?.id
      || element.querySelector('[data-id]')?.dataset.id
      || 'card-' + index;
    const visibleCard = element.querySelector('.aleria-chart-card');
    const rectangle = visibleCard?.getBoundingClientRect() || element.getBoundingClientRect();
    return {
      id,
      left: rectangle.left,
      right: rectangle.right,
      top: rectangle.top,
      bottom: rectangle.bottom,
      width: rectangle.width,
      height: rectangle.height,
      chartX: Number(hierarchyNode?.x),
      chartY: Number(hierarchyNode?.y),
      transform: element.style.transform || '',
      parents: Array.isArray(hierarchyNode?.data?.rels?.parents)
        ? hierarchyNode.data.rels.parents.filter(Boolean)
        : [],
      spouses: Array.isArray(hierarchyNode?.data?.rels?.spouses)
        ? hierarchyNode.data.rels.spouses.filter(Boolean)
        : []
    };
  }).filter(card => card.width > 0 && card.height > 0);

  const overlapPairs = [];
  const cardById = new Map(cards.map(card => [card.id, card]));
  const cardBounds = cards.reduce((bounds, card) => ({
    left: Math.min(bounds.left, card.left),
    right: Math.max(bounds.right, card.right),
    top: Math.min(bounds.top, card.top),
    bottom: Math.max(bounds.bottom, card.bottom)
  }), {
    left: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY
  });
  const chartCoordinates = cards.filter(card => (
    Number.isFinite(card.chartX) && Number.isFinite(card.chartY)
  ));
  const intrinsicBounds = chartCoordinates.reduce((bounds, card) => ({
    left: Math.min(bounds.left, card.chartX),
    right: Math.max(bounds.right, card.chartX),
    top: Math.min(bounds.top, card.chartY),
    bottom: Math.max(bounds.bottom, card.chartY)
  }), {
    left: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY
  });
  for (let firstIndex = 0; firstIndex < cards.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < cards.length; secondIndex += 1) {
      const first = cards[firstIndex];
      const second = cards[secondIndex];
      const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
      const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
      if (overlapWidth > 1 && overlapHeight > 1) {
        overlapPairs.push({ firstId: first.id, secondId: second.id, overlapWidth, overlapHeight });
      }
    }
  }

  function hierarchyId(value) {
    return value?.data?.data?.id || value?.data?.id || value?.id || '';
  }

  function hierarchyIds(value) {
    return (Array.isArray(value) ? value : [value])
      .map(hierarchyId)
      .filter(Boolean);
  }

  function relatedCardIds(path) {
    const datum = path.__data__;
    const ids = new Set([
      ...hierarchyIds(datum?.source),
      ...hierarchyIds(datum?.target),
      ...(path.dataset.relatedCardIds || '').split(',')
    ].filter(Boolean));
    return ids;
  }

  function nodeShape(value) {
    if (Array.isArray(value)) {
      return {
        array: true,
        length: value.length,
        items: value.slice(0, 3).map(nodeShape)
      };
    }
    if (!value || typeof value !== 'object') return { type: typeof value };
    return {
      keys: Object.keys(value).slice(0, 20),
      id: value.id || '',
      dataId: value.data?.id || '',
      nestedDataId: value.data?.data?.id || '',
      dataKeys: value.data && typeof value.data === 'object'
        ? Object.keys(value.data).slice(0, 20)
        : []
    };
  }

  function screenPoint(path, point) {
    const matrix = path.getScreenCTM();
    if (!matrix) return null;
    const svgPoint = path.ownerSVGElement.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const transformed = svgPoint.matrixTransform(matrix);
    return { x: transformed.x, y: transformed.y };
  }

  const pathReports = [];
  const lineCardIntersections = [];
  const pathElements = [...document.querySelectorAll('.links_view path.link')]
    .filter(path => (
      path.style.display !== 'none'
      && !path.classList.contains('aleria-line-crossing-overlay')
    ));
  const averageCardWidth = cards.length
    ? cards.reduce((sum, card) => sum + card.width, 0) / cards.length
    : 1;

  pathElements.forEach((path, pathIndex) => {
    let length = 0;
    try { length = path.getTotalLength(); } catch { return; }
    if (!Number.isFinite(length) || length < 1) return;

    const relatedIds = relatedCardIds(path);
    const sampleCount = Math.min(320, Math.max(24, Math.ceil(length / 5)));
    const hitCardIds = new Set();
    const hitSamplePoints = new Map();
    const sampledPoints = [];
    for (let sampleIndex = 1; sampleIndex < sampleCount; sampleIndex += 1) {
      const ratio = sampleIndex / sampleCount;
      if (ratio < 0.04 || ratio > 0.96) continue;
      const point = screenPoint(path, path.getPointAtLength(length * ratio));
      if (!point) continue;
      sampledPoints.push(point);
      cards.forEach(card => {
        if (relatedIds.has(card.id) || hitCardIds.has(card.id)) return;
        const inset = Math.max(1, Math.min(card.width, card.height) * 0.04);
        if (
          point.x > card.left + inset
          && point.x < card.right - inset
          && point.y > card.top + inset
          && point.y < card.bottom - inset
        ) {
          hitCardIds.add(card.id);
          if (!hitSamplePoints.has(card.id)) hitSamplePoints.set(card.id, point);
        }
      });
    }

    const xs = sampledPoints.map(point => point.x);
    const ys = sampledPoints.map(point => point.y);
    const width = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
    const height = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
    const localStart = path.getPointAtLength(0);
    const localEnd = path.getPointAtLength(length);
    const report = {
      pathIndex,
      kind: path.dataset.extraLinkKind || path.dataset.relationshipType || 'native',
      isExtraLink: path.classList.contains('aleria-extra-link'),
      relatedCardIds: [...relatedIds],
      length,
      width,
      height,
      widthInCards: averageCardWidth ? width / averageCardWidth : 0,
      localStart: { x: localStart.x, y: localStart.y },
      localEnd: { x: localEnd.x, y: localEnd.y },
      hitCardIds: [...hitCardIds],
      hitSamplePoints: Object.fromEntries(hitSamplePoints),
      relatedCardPositions: [...relatedIds].map(id => {
        const card = cardById.get(id);
        return card ? {
          id,
          left: card.left,
          top: card.top,
          width: card.width,
          height: card.height,
          chartX: card.chartX,
          chartY: card.chartY,
          transform: card.transform,
          parents: card.parents,
          spouses: card.spouses
        } : { id };
      }),
      hitCardPositions: [...hitCardIds].map(id => {
        const card = cardById.get(id);
        return card ? {
          id,
          left: card.left,
          top: card.top,
          width: card.width,
          height: card.height,
          chartX: card.chartX,
          chartY: card.chartY,
          transform: card.transform,
          parents: card.parents,
          spouses: card.spouses
        } : { id };
      }),
      datumShape: {
        keys: Object.keys(path.__data__ || {}).slice(0, 20),
        source: nodeShape(path.__data__?.source),
        target: nodeShape(path.__data__?.target)
      },
      pathData: path.getAttribute('d') || ''
    };
    pathReports.push(report);
    if (hitCardIds.size) lineCardIntersections.push(report);
  });

  const excessiveRoutes = pathReports
    .filter(report => report.widthInCards > 8 && report.length > innerWidth * 0.55)
    .sort((first, second) => second.widthInCards - first.widthInCards)
    .slice(0, 20);
  const partnershipKinds = new Set(['marriage', 'engagement', 'affair', 'forced']);
  const longPartnershipRoutes = pathReports
    .filter(report => partnershipKinds.has(report.kind) && report.widthInCards > 4)
    .sort((first, second) => second.widthInCards - first.widthInCards)
    .slice(0, 20);
  const crestAnchorMisalignments = pathReports.filter(report => {
    if (!report.isExtraLink || report.kind !== 'parentage') return false;
    const child = report.relatedCardPositions.find(card => card.id?.startsWith('__cadet-'));
    const parents = report.relatedCardPositions.filter(card => (
      card !== child && Number.isFinite(card.chartX) && Number.isFinite(card.chartY)
    ));
    if (!child || parents.length === 0 || !Number.isFinite(child.chartX) || !Number.isFinite(child.chartY)) {
      return false;
    }
    const parentX = parents.reduce((sum, card) => sum + card.chartX, 0) / parents.length;
    const parentY = parents.reduce((sum, card) => sum + card.chartY, 0) / parents.length;
    const vertical = Math.abs(child.chartY - parentY) >= Math.abs(child.chartX - parentX);
    const startError = vertical
      ? Math.abs(report.localStart.x - parentX)
      : Math.abs(report.localStart.y - parentY);
    const endError = vertical
      ? Math.abs(report.localEnd.x - child.chartX)
      : Math.abs(report.localEnd.y - child.chartY);
    return startError > 0.75 || endError > 0.75;
  });
  const visibleText = document.body?.innerText || '';
  const lineCrossingOverlayCount = document.querySelectorAll(
    '.aleria-line-crossing-overlay'
  ).length;
  const declaredLineCrossingCount = Number(
    chartContainer?.dataset.layoutLineCrossingCount || 0
  );

  function parsedPairs(value) {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return {
    title: document.title,
    url: location.href,
    readyState: document.readyState,
    bodyExcerpt: cards.length ? '' : visibleText.replace(/\s+/g, ' ').trim().slice(0, 500),
    cardCount: cards.length,
    viewport: { width: innerWidth, height: innerHeight },
    zoomScale: Number(canvas?.__zoom?.k || 0),
    renderedBounds: cards.length ? {
      left: cardBounds.left,
      top: cardBounds.top,
      width: cardBounds.right - cardBounds.left,
      height: cardBounds.bottom - cardBounds.top
    } : null,
    intrinsicBounds: chartCoordinates.length ? {
      left: intrinsicBounds.left,
      top: intrinsicBounds.top,
      width: intrinsicBounds.right - intrinsicBounds.left,
      height: intrinsicBounds.bottom - intrinsicBounds.top
    } : null,
    medianRenderedCardWidth: cards.length
      ? [...cards].sort((first, second) => first.width - second.width)[Math.floor(cards.length / 2)].width
      : 0,
    overlapPairs,
    lineCardIntersections,
    excessiveRoutes,
    longPartnershipRoutes,
    extraLinkReports: pathReports
      .filter(report => report.isExtraLink)
      .slice(0, 40),
    crestAnchorMisalignments,
    declaredLineCrossingCount,
    lineCrossingOverlayCount,
    declaredCollisionCount: Number(chartContainer?.dataset.layoutCollisionCount || 0),
    initialCollisionPairs: parsedPairs(chartContainer?.dataset.layoutInitialCollisionPairs),
    remainingCollisionPairs: parsedPairs(chartContainer?.dataset.layoutRemainingCollisionPairs),
    fosterPlacements: (() => {
      try {
        const parsed = JSON.parse(chartContainer?.dataset.layoutFosterPlacements || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    spacingScale: Number(chartContainer?.dataset.layoutSpacingScale || 1),
    runtimeError: visibleText.includes('Cannot read properties of undefined')
      ? 'Cannot read properties of undefined'
      : ''
  };
})()`;

const target = await chromiumTarget();
if (!target) throw new Error('Kein Chromium-Seitenziel gefunden.');
const session = new DevToolsSession(target.webSocketDebuggerUrl);
await session.ready();
await session.send('Page.enable');
await session.send('Network.enable');
await session.send('Network.setCacheDisabled', { cacheDisabled: true });
await session.send('Runtime.enable');
if (viewportWidth && viewportHeight) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 1,
    mobile: false
  });
}

const results = [];
for (const familyId of familyIds) {
  const eventStartIndex = session.events.length;
  const url = `${baseUrl}?family=${encodeURIComponent(familyId)}&mode=view`;
  await session.send('Page.navigate', { url });
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await wait(pollMilliseconds);
    const readiness = await session.send('Runtime.evaluate', {
      expression: `({ cards: document.querySelectorAll('.card_cont').length, ready: document.readyState })`,
      returnByValue: true
    });
    if (readiness.result?.value?.cards > 0) break;
  }
  if (fitBeforeAudit) {
    await session.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-action="fit-chart"]')?.click()`
    });
    await wait(700);
  }
  if (centeredCardId) {
    await session.send('Runtime.evaluate', {
      expression: `(() => {
        const card = [...document.querySelectorAll('.card_cont')].find(element => (
          (element.__data__?.data?.data?.id || element.__data__?.data?.id) === ${JSON.stringify(centeredCardId)}
        ));
        const canvas = document.querySelector('#f3Canvas');
        const point = card?.__data__;
        if (!card || !canvas?.__zoomObj || !globalThis.d3 || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return false;
        const scale = 0.9;
        const rectangle = canvas.getBoundingClientRect();
        const transform = d3.zoomIdentity
          .translate((rectangle.width / 2) - (point.x * scale), (rectangle.height / 2) - (point.y * scale))
          .scale(scale);
        d3.select(canvas).call(canvas.__zoomObj.transform, transform);
        return true;
      })()`
    });
    await wait(350);
  }
  if (centerFirstLineCrossing) {
    await session.send('Runtime.evaluate', {
      expression: `(() => {
        const marker = document.querySelector('.aleria-line-crossing-overlay--foreground');
        const canvas = document.querySelector('#f3Canvas');
        const x = Number(marker?.dataset.crossingX);
        const y = Number(marker?.dataset.crossingY);
        if (!marker || !canvas?.__zoomObj || !globalThis.d3 || !Number.isFinite(x) || !Number.isFinite(y)) return false;
        const scale = 0.95;
        const rectangle = canvas.getBoundingClientRect();
        const transform = d3.zoomIdentity
          .translate((rectangle.width / 2) - (x * scale), (rectangle.height / 2) - (y * scale))
          .scale(scale);
        d3.select(canvas).call(canvas.__zoomObj.transform, transform);
        return true;
      })()`
    });
    await wait(350);
  }
  const evaluation = await session.send('Runtime.evaluate', {
    expression: auditExpression,
    awaitPromise: true,
    returnByValue: true
  });
  if (evaluation.exceptionDetails) {
    results.push({ familyId, evaluationError: evaluation.exceptionDetails.text || 'Unbekannter Fehler' });
    continue;
  }
  const browserExceptions = session.events
    .slice(eventStartIndex)
    .filter(event => event.method === 'Runtime.exceptionThrown')
    .map(event => (
      event.params?.exceptionDetails?.exception?.description
      || event.params?.exceptionDetails?.text
      || 'Unbekannter Browserfehler'
    ));
  results.push({ familyId, ...evaluation.result.value, browserExceptions });
}

if (screenshotPath && familyIds.length === 1) {
  const screenshot = await session.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
}

session.close();
let output = summaryOnly
  ? results.map(result => {
      const confirmedIntersections = (result.lineCardIntersections || [])
        .filter(report => report.relatedCardIds?.length);
      const unattributedIntersections = (result.lineCardIntersections || [])
        .filter(report => !report.relatedCardIds?.length);
      const summary = {
        familyId: result.familyId,
        cardCount: result.cardCount || 0,
        viewport: result.viewport || null,
        zoomScale: result.zoomScale || 0,
        renderedBounds: result.renderedBounds || null,
        intrinsicBounds: result.intrinsicBounds || null,
        medianRenderedCardWidth: result.medianRenderedCardWidth || 0,
        overlaps: result.overlapPairs?.length || 0,
        confirmedLineCardIntersections: confirmedIntersections.length,
        unattributedLineCardIntersections: unattributedIntersections.length,
        excessiveRoutes: result.excessiveRoutes?.length || 0,
        longPartnershipRoutes: result.longPartnershipRoutes?.length || 0,
        misalignedCrestLinks: result.crestAnchorMisalignments?.length || 0,
        declaredLineCrossings: result.declaredLineCrossingCount || 0,
        lineCrossingOverlays: result.lineCrossingOverlayCount || 0,
        maximumRouteWidthInCards: Math.max(
          0,
          ...(result.excessiveRoutes || []).map(report => Number(report.widthInCards.toFixed(2)))
        ),
        declaredCollisionCount: result.declaredCollisionCount || 0,
        initialCollisionPairs: result.initialCollisionPairs || [],
        remainingCollisionPairs: result.remainingCollisionPairs || [],
        fosterPlacements: result.fosterPlacements || [],
        spacingScale: result.spacingScale || 1,
        runtimeError: result.runtimeError || '',
        browserExceptions: result.browserExceptions || [],
        evaluationError: result.evaluationError || ''
      };
      if (summaryDetails) {
        summary.confirmedIntersectionSamples = confirmedIntersections.slice(0, 12).map(report => ({
          kind: report.kind,
          relatedCardIds: report.relatedCardIds,
          hitCardIds: report.hitCardIds,
          widthInCards: Number(report.widthInCards.toFixed(2)),
          ...(debugShapes ? {
            relatedCardPositions: report.relatedCardPositions,
            hitCardPositions: report.hitCardPositions,
            hitSamplePoints: report.hitSamplePoints,
            datumShape: report.datumShape,
            pathData: report.pathData
          } : {})
        }));
        summary.excessiveRouteSamples = (result.excessiveRoutes || []).slice(0, 8).map(report => ({
          kind: report.kind,
          relatedCardIds: report.relatedCardIds,
          hitCardIds: report.hitCardIds,
          widthInCards: Number(report.widthInCards.toFixed(2)),
          ...(debugShapes ? {
            relatedCardPositions: report.relatedCardPositions,
            hitCardPositions: report.hitCardPositions,
            hitSamplePoints: report.hitSamplePoints,
            datumShape: report.datumShape,
            pathData: report.pathData
          } : {})
        }));
        summary.longPartnershipRouteSamples = (result.longPartnershipRoutes || []).slice(0, 8).map(report => ({
          kind: report.kind,
          relatedCardIds: report.relatedCardIds,
          hitCardIds: report.hitCardIds,
          widthInCards: Number(report.widthInCards.toFixed(2)),
          ...(debugShapes ? {
            relatedCardPositions: report.relatedCardPositions,
            hitCardPositions: report.hitCardPositions,
            hitSamplePoints: report.hitSamplePoints,
            datumShape: report.datumShape,
            pathData: report.pathData
          } : {})
        }));
        summary.extraLinkSamples = (result.extraLinkReports || []).slice(0, 20).map(report => ({
          kind: report.kind,
          relatedCardIds: report.relatedCardIds,
          relatedCardPositions: report.relatedCardPositions,
          pathData: report.pathData
        }));
      }
      return summary;
    })
  : results;
if (failuresOnly && summaryOnly) {
  const summarizedResults = output;
  const failedResults = summarizedResults.filter(result => (
    result.cardCount === 0
    || result.overlaps > 0
    || result.confirmedLineCardIntersections > 0
    || result.unattributedLineCardIntersections > 0
    || result.remainingCollisionPairs.length > 0
    || Boolean(result.runtimeError)
    || result.browserExceptions.length > 0
    || Boolean(result.evaluationError)
  ));
  output = {
    audited: summarizedResults.length,
    failed: failedResults.length,
    broadRouteWarnings: summarizedResults.filter(result => result.excessiveRoutes > 0).length,
    longPartnershipRouteWarnings: summarizedResults.filter(result => result.longPartnershipRoutes > 0).length,
    results: failedResults
  };
}
console.log(JSON.stringify(output, null, 2));
