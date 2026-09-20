(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let sequence = 0;
  const fields = [
    ['width', 'Breite', 120, 2400, 600],
    ['fontSize', 'Schriftgröße', 12, 200, 40],
    ['rotation', 'Drehung (Grad)', -180, 180, 0],
    ['spacing', 'Zeichenabstand', 0, 30, 2],
    ['x1', 'Kurvenpunkt 1 – horizontal (%)', 0, 100, 33],
    ['y1', 'Kurvenpunkt 1 – Höhe', -500, 500, 0],
    ['x2', 'Kurvenpunkt 2 – horizontal (%)', 0, 100, 67],
    ['y2', 'Kurvenpunkt 2 – Höhe', -500, 500, 0]
  ];

  function normalize(raw = {}) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const result = {};
    fields.forEach(([key, , min, max, fallback]) => {
      const value = input[key] === '' || input[key] == null ? fallback : Number(input[key]);
      result[key] = Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
    });
    result.color = /^#[0-9a-f]{6}$/i.test(input.color || '') ? input.color : '#382714';
    return result;
  }

  function geometry(raw) {
    const s = normalize(raw);
    const pad = s.fontSize * 1.5;
    const top = Math.min(0, s.y1, s.y2) - pad;
    const bottom = Math.max(0, s.y1, s.y2) + pad;
    return {
      style: s, width: s.width + pad * 2, height: bottom - top,
      viewBox: `${-pad} ${top} ${s.width + pad * 2} ${bottom - top}`,
      path: `M 0 0 C ${s.width * s.x1 / 100} ${s.y1} ${s.width * s.x2 / 100} ${s.y2} ${s.width} 0`
    };
  }

  function svgElement(tag, attributes = {}) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function create(pin) {
    const g = geometry(pin.lettering);
    const id = `map-lettering-${++sequence}`;
    const svg = svgElement('svg', { viewBox: g.viewBox, width: g.width, height: g.height, role: 'img', 'aria-label': pin.title || 'Schriftzug' });
    svg.classList.add('pin-lettering');
    svg.style.transform = `rotate(${g.style.rotation}deg)`;
    const defs = svgElement('defs');
    defs.append(svgElement('path', { id, d: g.path }));
    const text = svgElement('text', { fill: g.style.color, 'font-size': g.style.fontSize, 'letter-spacing': g.style.spacing, 'text-anchor': 'middle' });
    const textPath = svgElement('textPath', { href: `#${id}`, startOffset: '50%' });
    textPath.textContent = String(pin.title || 'Schriftzug');
    text.append(textPath);
    svg.append(defs, text);
    return svg;
  }

  function editorMarkup(pin) {
    const style = normalize(pin.lettering);
    return `<fieldset class="pin-lettering-editor">
      <legend>Schriftzug gestalten</legend>
      <p class="e-hint">Gleiche Höhen biegen den Schriftzug zum Bogen. Gegenläufige Höhen erzeugen eine S-Kurve. Die horizontalen Kurvenpunkte verändern deren Verlauf.</p>
      <div class="pin-lettering-fields">${fields.map(([key, label, min, max]) => `
        <label class="e-row">${label}<input class="e-inp" type="number" data-lettering-field="${key}" min="${min}" max="${max}" value="${style[key]}"/></label>`).join('')}
        <label class="e-row">Farbe<input type="color" data-lettering-field="color" value="${style.color}"/></label>
      </div>
      <div class="pin-lettering-preview" data-role="lettering-preview" aria-label="Vorschau des Schriftzugs"></div>
      <p class="e-hint">Der Titel oben ist der Schriftzug. Für längere Namen die Breite erhöhen oder die Schrift verkleinern.</p>
    </fieldset>`;
  }

  function readEditor(container, previous) {
    const raw = { ...previous };
    container.querySelectorAll('[data-lettering-field]').forEach(input => { raw[input.dataset.letteringField] = input.value; });
    return normalize(raw);
  }

  function updatePreview(container, pin) {
    const preview = container.querySelector('[data-role="lettering-preview"]');
    if (preview) preview.replaceChildren(create(pin));
  }

  window.KartoPinLettering = Object.freeze({ normalize, geometry, create, editorMarkup, readEditor, updatePreview });
})();
