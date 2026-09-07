const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function point(cx, cy, radius, index, total) {
  const angle = -Math.PI / 2 + index * (Math.PI * 2 / total);
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function pointsForRadius(radius, total) {
  return Array.from({ length: total }, (_, index) => point(220, 160, radius, index, total).map(value => value.toFixed(1)).join(',')).join(' ');
}

function labelPositions(total) {
  return Array.from({ length: total }, (_, index) => {
    const [x, y] = point(220, 160, 142, index, total);
    const anchor = Math.abs(x - 220) < 8 ? 'middle' : x < 220 ? 'end' : 'start';
    return [x.toFixed(1), (y + (index === 0 ? 3 : index === total / 2 ? 7 : 4)).toFixed(1), anchor];
  });
}

function normalizeMetrics(metrics) {
  if (!metrics) return null;
  if (!Array.isArray(metrics.labels) || !Array.isArray(metrics.values) || metrics.labels.length !== metrics.values.length || metrics.labels.length < 3) {
    throw new TypeError('Profile metrics require matching label and value arrays with at least three entries.');
  }
  const values = metrics.values.map(Number);
  if (values.some(value => !Number.isFinite(value) || value < 1 || value > 10)) {
    throw new RangeError('Profile metric values must be numbers from 1 to 10.');
  }
  return { labels: metrics.labels.map(String), values };
}

export function renderProfileMetrics(metrics, options = {}) {
  const normalized = normalizeMetrics(metrics);
  const emptyTitle = options.emptyTitle || 'Keine gesicherten Messwerte';
  const emptyText = options.emptyText || 'Für dieses Dossier liegt bislang kein vollständiges Leistungsblatt vor.';
  if (!normalized) {
    return `<div class="profile-metrics-missing"><span aria-hidden="true">◇</span><p><strong>${escape(emptyTitle)}</strong>${escape(emptyText)}</p></div>`;
  }

  const { labels, values } = normalized;
  const total = labels.length;
  const chartTitle = options.chartTitle || 'Merkmalsdiagramm';
  const description = labels.map((label, index) => `${label} ${values[index]} von 10`).join(', ');
  const plot = values.map((value, index) => point(220, 160, value / 10 * 98, index, total).map(number => number.toFixed(1)).join(',')).join(' ');
  const positions = labelPositions(total);

  return `<div class="profile-metrics-wrap">
    <svg class="profile-metrics-radar" viewBox="0 0 440 330" role="img" aria-label="${escape(chartTitle)}: ${escape(description)}">
      <g class="profile-metrics-grid">${[19.6, 39.2, 58.8, 78.4, 98].map(radius => `<polygon points="${pointsForRadius(radius, total)}"></polygon>`).join('')}${Array.from({ length: total }, (_, index) => { const [x, y] = point(220, 160, 98, index, total); return `<line x1="220" y1="160" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`; }).join('')}</g>
      <polygon class="profile-metrics-value" points="${plot}"></polygon>
      <g class="profile-metrics-points">${values.map((value, index) => { const [x, y] = point(220, 160, value / 10 * 98, index, total); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"></circle>`; }).join('')}</g>
      <g class="profile-metrics-labels">${labels.map((label, index) => { const [x, y, anchor] = positions[index]; return `<text x="${x}" y="${y}" text-anchor="${anchor}">${escape(label)}</text>`; }).join('')}</g>
    </svg>
    <dl class="profile-metrics-score-list">${labels.map((label, index) => `<div><dt>${escape(label)}</dt><dd><span style="--score:${values[index]}"><i></i></span><strong><span class="profile-metrics-value-number">${values[index]}</span><small>/10</small></strong></dd></div>`).join('\n')}</dl>
  </div>`;
}
