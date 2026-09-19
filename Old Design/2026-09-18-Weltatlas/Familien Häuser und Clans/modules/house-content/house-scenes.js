// Source vignettes belong to the house article; the short biography stays concise.
export function renderHouseScenes(root, scenes) {
  if (!Array.isArray(scenes)) return;
  const overview = root.querySelector('[data-section="overview"]');
  if (!overview) return;
  root.querySelector('[data-house-scenes]')?.remove();
  const container = root.ownerDocument.createElement('div');
  container.dataset.houseScenes = '';
  for (const scene of scenes) {
    const details = root.ownerDocument.createElement('details');
    details.className = 'house-scene';
    const summary = root.ownerDocument.createElement('summary');
    summary.textContent = scene.title;
    details.append(summary);
    for (const text of scene.paragraphs) {
      const paragraph = root.ownerDocument.createElement('p');
      paragraph.textContent = text;
      details.append(paragraph);
    }
    container.append(details);
  }
  overview.after(container);
}
