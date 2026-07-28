import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { collectFamilyChartCardPositions } from './family-chart-layout-dom.js';
import { createRoundedOrthogonalPath } from './family-chart-link-renderer.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT = Object.freeze({
  width: 96,
  height: 116,
  gap: 16
});

function rectanglesOverlap(first, second, padding = 4) {
  return !(
    first.right + padding <= second.left
    || second.right + padding <= first.left
    || first.bottom + padding <= second.top
    || second.bottom + padding <= first.top
  );
}

function centeredRectangle(point, width, height) {
  return {
    left: point.x - (width / 2),
    right: point.x + (width / 2),
    top: point.y - (height / 2),
    bottom: point.y + (height / 2)
  };
}

function collisionCount(point, cardPositions, anchorPersonId) {
  const offshootRectangle = centeredRectangle(
    point,
    FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.width,
    FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.height
  );
  const cardWidth = FAMILY_CHART_CARD_LAYOUT.width;
  const cardHeight = FAMILY_CHART_CARD_LAYOUT.height;

  let collisions = 0;
  cardPositions.forEach((cardPoint, cardId) => {
    if (cardId === anchorPersonId) return;
    if (rectanglesOverlap(offshootRectangle, centeredRectangle(cardPoint, cardWidth, cardHeight))) {
      collisions += 1;
    }
  });
  return collisions;
}

function candidateLayouts(anchorPoint, orientation) {
  const { width, height, gap } = FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT;
  if (orientation === 'horizontal') {
    const offset = (FAMILY_CHART_CARD_LAYOUT.height / 2) + gap + (height / 2);
    return [
      { side: 'before', point: { x: anchorPoint.x, y: anchorPoint.y - offset } },
      { side: 'after', point: { x: anchorPoint.x, y: anchorPoint.y + offset } }
    ];
  }

  const offset = (FAMILY_CHART_CARD_LAYOUT.width / 2) + gap + (width / 2);
  return [
    { side: 'before', point: { x: anchorPoint.x - offset, y: anchorPoint.y } },
    { side: 'after', point: { x: anchorPoint.x + offset, y: anchorPoint.y } }
  ];
}

function connectionRoute(anchorPoint, offshootPoint, side, orientation) {
  if (orientation === 'horizontal') {
    const anchorEdgeY = side === 'before'
      ? anchorPoint.y - (FAMILY_CHART_CARD_LAYOUT.height / 2)
      : anchorPoint.y + (FAMILY_CHART_CARD_LAYOUT.height / 2);
    const offshootEdgeY = side === 'before'
      ? offshootPoint.y + (FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.height / 2)
      : offshootPoint.y - (FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.height / 2);
    return [
      { x: anchorPoint.x, y: anchorEdgeY },
      { x: offshootPoint.x, y: offshootEdgeY }
    ];
  }

  const anchorEdgeX = side === 'before'
    ? anchorPoint.x - (FAMILY_CHART_CARD_LAYOUT.width / 2)
    : anchorPoint.x + (FAMILY_CHART_CARD_LAYOUT.width / 2);
  const offshootEdgeX = side === 'before'
    ? offshootPoint.x + (FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.width / 2)
    : offshootPoint.x - (FAMILY_CHART_HOUSE_OFFSHOOT_LAYOUT.width / 2);
  return [
    { x: anchorEdgeX, y: anchorPoint.y },
    { x: offshootEdgeX, y: offshootPoint.y }
  ];
}

export function createFamilyChartHouseOffshootLayout(
  offshoot,
  cardPositions,
  orientation = 'vertical'
) {
  const anchorPoint = cardPositions.get(offshoot.anchorPersonId);
  if (!anchorPoint) return null;

  const preferredSide = offshoot.preferredSide === 'after' ? 'after' : 'before';
  const candidates = candidateLayouts(anchorPoint, orientation)
    .sort((first, second) => (
      (first.side === preferredSide ? -1 : 1)
      - (second.side === preferredSide ? -1 : 1)
    ));
  const selected = candidates
    .map(candidate => ({
      ...candidate,
      collisions: collisionCount(
        candidate.point,
        cardPositions,
        offshoot.anchorPersonId
      )
    }))
    .sort((first, second) => first.collisions - second.collisions)[0];

  return Object.freeze({
    x: selected.point.x,
    y: selected.point.y,
    side: selected.side,
    route: Object.freeze(connectionRoute(anchorPoint, selected.point, selected.side, orientation))
  });
}

function appendImage(documentRef, parent, source, className) {
  if (!source) return;
  const image = documentRef.createElement('img');
  image.className = className;
  image.src = source;
  image.alt = '';
  image.draggable = false;
  parent.appendChild(image);
}

function createOffshootCard(documentRef, offshoot, layout) {
  const cardContainer = documentRef.createElement('div');
  cardContainer.className = 'aleria-house-offshoot-cont';
  cardContainer.dataset.houseOffshootId = offshoot.id;
  cardContainer.style.transform = `translate(${layout.x}px, ${layout.y}px) translate(-50%, -50%)`;

  const button = documentRef.createElement('button');
  button.type = 'button';
  button.className = 'aleria-house-offshoot';
  button.dataset.action = 'open-house-offshoot';
  button.dataset.familyId = offshoot.targetFamilyId;
  button.dataset.branchId = offshoot.branchId;
  button.setAttribute('aria-label', `${offshoot.name} öffnen`);
  button.title = offshoot.subtitle ? `${offshoot.name} – ${offshoot.subtitle}` : offshoot.name;
  button.style.setProperty('--offshoot-emblem-scale', String(offshoot.emblemScale || 0.86));
  button.style.setProperty('--offshoot-frame-scale', String(offshoot.frameScale || 1));

  const seal = documentRef.createElement('span');
  seal.className = 'aleria-house-offshoot__seal';
  const emblemClip = documentRef.createElement('span');
  emblemClip.className = 'aleria-house-offshoot__emblem-clip';
  appendImage(documentRef, emblemClip, offshoot.emblem, 'aleria-house-offshoot__emblem');
  seal.appendChild(emblemClip);
  appendImage(documentRef, seal, offshoot.crestFrameAsset, 'aleria-house-offshoot__frame');

  const label = documentRef.createElement('span');
  label.className = 'aleria-house-offshoot__label';
  label.textContent = offshoot.name;
  button.append(seal, label);
  cardContainer.appendChild(button);
  return cardContainer;
}

export function createFamilyChartHouseOffshootRenderer({
  container,
  resolveOffshoots,
  resolveOrientation,
  onActivate,
  schedule = globalThis.setTimeout?.bind(globalThis),
  cancel = globalThis.clearTimeout?.bind(globalThis)
}) {
  if (!container) throw new Error('Für die Auswanderungszweige fehlt der Chart-Container.');
  if (typeof resolveOffshoots !== 'function') {
    throw new Error('Für die Auswanderungszweige fehlt die Datenauflösung.');
  }

  let pendingRender = null;
  let destroyed = false;

  function clear() {
    container.querySelectorAll('.aleria-house-offshoot-cont').forEach(element => element.remove());
    container.querySelectorAll('.aleria-house-offshoot-link').forEach(element => element.remove());
  }

  function render() {
    if (destroyed) return;
    clear();
    const offshoots = resolveOffshoots() || [];
    if (!offshoots.length) return;

    const cardsView = container.querySelector('#htmlSvg .cards_view');
    const linksView = container.querySelector('svg.main_svg .links_view');
    if (!cardsView || !linksView) return;

    const cardPositions = collectFamilyChartCardPositions(container);
    const orientation = typeof resolveOrientation === 'function'
      ? resolveOrientation()
      : 'vertical';

    offshoots.forEach(offshoot => {
      const layout = createFamilyChartHouseOffshootLayout(offshoot, cardPositions, orientation);
      if (!layout) return;

      const path = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
      path.setAttribute('class', 'aleria-house-offshoot-link');
      path.setAttribute('fill', 'none');
      path.setAttribute('d', createRoundedOrthogonalPath(layout.route, 10));
      path.dataset.branchId = offshoot.branchId;
      linksView.appendChild(path);
      cardsView.appendChild(createOffshootCard(container.ownerDocument, offshoot, layout));
    });
  }

  function refresh(transitionTime = 0) {
    if (destroyed) return;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
    render();

    const delay = Math.max(0, Number(transitionTime) || 0);
    if (delay && schedule) {
      pendingRender = schedule(() => {
        pendingRender = null;
        render();
      }, delay + 20);
    }
  }

  function handleClick(event) {
    const trigger = event.target?.closest?.('[data-action="open-house-offshoot"]');
    if (!trigger || !container.contains(trigger)) return;
    event.stopPropagation();
    onActivate?.({
      familyId: trigger.dataset.familyId || '',
      branchId: trigger.dataset.branchId || '',
      event
    });
  }

  function handlePointerDown(event) {
    const trigger = event.target?.closest?.('[data-action="open-house-offshoot"]');
    if (trigger && container.contains(trigger)) event.stopPropagation();
  }

  container.addEventListener('click', handleClick);
  container.addEventListener('pointerdown', handlePointerDown);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
    container.removeEventListener('click', handleClick);
    container.removeEventListener('pointerdown', handlePointerDown);
    clear();
  }

  return Object.freeze({ refresh, destroy });
}
