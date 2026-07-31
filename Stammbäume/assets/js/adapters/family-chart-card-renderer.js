export const FAMILY_CHART_CARD_LAYOUT = Object.freeze({
  width: 320,
  height: 213,
  horizontalSpacing: 430,
  verticalSpacing: 326
});

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function marker(data) {
  const role = escapeHtml(data.role || 'core');
  const nodeKind = escapeHtml(data.nodeKind || 'person');
  return `<span class="family-card-marker family-card-marker--${role} family-node-marker--${nodeKind}"></span>`;
}

function optionalImage(source, className) {
  return source
    ? `<img class="${className}" src="${escapeHtml(source)}" alt="" draggable="false">`
    : '';
}

function personCrest(data) {
  if (!data.crest) return '';
  const houseName = String(data.house || '').trim();
  const label = houseName
    ? `Zum Stammbaum von ${houseName}`
    : 'Zum zugehörigen Haus';
  return `
    <button class="aleria-person-card__crest-link" type="button" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
      ${optionalImage(data.crest, 'aleria-person-card__crest')}
    </button>`;
}

function crestPositionStyle(position = {}) {
  const declarations = [
    ['--card-crest-left', position.left],
    ['--card-crest-top', position.top],
    ['--card-crest-width', position.width],
    ['--card-crest-height', position.height]
  ].filter(([, value]) => value);
  return declarations.length
    ? ` style="${declarations.map(([name, value]) => `${name}:${escapeHtml(value)}`).join(';')}"`
    : '';
}

function crestScaleStyle(data = {}) {
  const emblemScale = Number.isFinite(Number(data.emblemScale)) ? Number(data.emblemScale) : 0.86;
  const frameScale = Number.isFinite(Number(data.frameScale)) ? Number(data.frameScale) : 1;
  return ` style="--crest-emblem-scale:${escapeHtml(emblemScale)};--crest-frame-scale:${escapeHtml(frameScale)}"`;
}

function personCard(data) {
  const role = escapeHtml(data.role || 'core');
  const lineageRole = escapeHtml(data.lineageRole || 'branch');
  const frameVariant = escapeHtml(data.frameVariant || 'standard');
  return `
    <div class="card-inner aleria-chart-card aleria-person-card role-${role} lineage-${lineageRole} frame-${frameVariant}" data-lineage-role="${lineageRole}"${crestPositionStyle(data.crestPosition)}>
      ${marker(data)}
      <div class="aleria-person-card__fill" aria-hidden="true"></div>
      <div class="aleria-person-card__portrait-backdrop" aria-hidden="true"></div>
      ${optionalImage(data.portrait, 'aleria-person-card__portrait')}
      <div class="aleria-person-card__text">
        <span class="family-card-name">${escapeHtml(data.name)}</span>
        ${data.title ? `<span class="family-card-title">${escapeHtml(data.title)}</span>` : ''}
        ${data.house ? `<span class="family-card-house">${escapeHtml(data.house)}</span>` : ''}
        ${data.life ? `<span class="family-card-life">${escapeHtml(data.life)}</span>` : ''}
      </div>
      ${optionalImage(data.frameAsset, 'aleria-person-card__frame')}
      ${personCrest(data)}
    </div>`;
}

function crestNode(data) {
  const isLinkedHouse = data.nodeKind === 'cadet-house';
  return `
    <div class="card-inner aleria-chart-card aleria-crest-node${isLinkedHouse ? ' aleria-crest-node--linked' : ''}">
      ${marker(data)}
      <div class="aleria-crest-node__seal"${crestScaleStyle(data)}>
        <div class="aleria-crest-node__emblem-clip">
          ${optionalImage(data.portrait, 'aleria-crest-node__emblem')}
        </div>
        ${optionalImage(data.crestFrameAsset, 'aleria-crest-node__frame')}
      </div>
      <div class="aleria-crest-node__caption">
        <span class="family-card-name">${escapeHtml(data.name)}</span>
        ${data.title ? `<span class="family-card-title">${escapeHtml(data.title)}</span>` : ''}
      </div>
    </div>`;
}

function lineEndNode(data) {
  return `
    <div class="card-inner aleria-chart-card aleria-line-end">
      ${marker(data)}
      ${optionalImage(data.frameAsset, 'aleria-line-end__medallion')}
      <div class="aleria-line-end__caption">
        <span class="family-card-name">${escapeHtml(data.name)}</span>
        ${data.title ? `<span class="family-card-title">${escapeHtml(data.title)}</span>` : ''}
      </div>
    </div>`;
}

function timeNode(data) {
  const fromYear = data.fromYear || '????';
  const toYear = data.toYear || '????';
  return `
    <div class="card-inner aleria-chart-card aleria-time-node aleria-time-node--interactive">
      ${marker(data)}
      ${optionalImage(data.frameAsset, 'aleria-time-node__frame')}
      <div class="aleria-time-node__text">
        <span class="aleria-time-node__year aleria-time-node__year--from">${escapeHtml(fromYear)}</span>
        <span class="aleria-time-node__year aleria-time-node__year--to">${escapeHtml(toYear)}</span>
      </div>
    </div>`;
}

export function createFamilyChartCardHtml(hierarchyDatum) {
  const data = hierarchyDatum?.data?.data || hierarchyDatum?.data || {};
  if (data.nodeKind === 'time-jump-stage') {
    return '<div class="card-inner aleria-chart-card aleria-time-jump-stage" aria-hidden="true"></div>';
  }
  if (['house-crest', 'cadet-house', 'house-origin'].includes(data.nodeKind)) return crestNode(data);
  if (data.nodeKind === 'line-end') return lineEndNode(data);
  if (data.nodeKind === 'time-gap' || data.nodeKind === 'time-jump') return timeNode(data);
  return personCard(data);
}
