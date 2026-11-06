/** Optional measured cartouches cover retired baked labels without editing map pixels. */
export function renderMapLabelReplacements({ replacements = [], settlements, showNames, escape }) {
  if (!replacements.length) return '';
  const labels = replacements.map(({ settlementId, annotationId, label, rect, tone }) => {
    const settlement = settlementId && settlements.find(place => place.id === settlementId);
    const identity = settlementId || annotationId;
    const text = settlement?.name || (!settlementId && annotationId && label);
    if (typeof identity !== 'string' || !identity || typeof text !== 'string' || !text.trim()
      || !Array.isArray(rect) || rect.length !== 4
      || rect.some(value => !Number.isFinite(value))
      || rect[0] < 0 || rect[1] < 0 || rect[2] <= 0 || rect[3] <= 0
      || rect[0] + rect[2] > 100 || rect[1] + rect[3] > 100) {
      throw new Error('Invalid measured map-label replacement.');
    }
    const [left, top, width, height] = rect;
    return `<span class="map-label-replacement${tone === 'stone' ? ' map-label-stone' : ''}" data-label-replacement="${escape(identity)}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><span${showNames ? '' : ' hidden'}>${escape(text)}</span></span>`;
  }).join('');
  return `<div class="map-label-replacements">${labels}</div>`;
}
