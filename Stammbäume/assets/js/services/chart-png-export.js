function safeFileName(value) {
  return String(value || 'stammbaum')
    .toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '') || 'stammbaum';
}

function wait(milliseconds) {
  return new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
}

export async function exportChartAsPng({
  element,
  title,
  fitChart,
  runtime = globalThis,
  documentRef = document
}) {
  if (typeof runtime.html2canvas !== 'function') {
    throw new Error('Der PNG-Renderer ist nicht verfügbar.');
  }
  fitChart?.();
  await documentRef.fonts?.ready;
  await wait(420);
  const bounds = element.getBoundingClientRect();
  const longestSide = Math.max(bounds.width, bounds.height, 1);
  const scale = Math.max(2, Math.min(4, 12000 / longestSide));
  element.classList.add('is-exporting-png');
  try {
    const canvas = await runtime.html2canvas(element, {
      backgroundColor: '#ead9b9',
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 20000,
      removeContainer: true
    });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1));
    if (!blob) throw new Error('Das PNG konnte nicht erzeugt werden.');
    const url = URL.createObjectURL(blob);
    const anchor = documentRef.createElement('a');
    anchor.href = url;
    anchor.download = `${safeFileName(title)}-${Math.round(canvas.width)}x${Math.round(canvas.height)}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    return Object.freeze({ width: canvas.width, height: canvas.height, scale });
  } finally {
    element.classList.remove('is-exporting-png');
  }
}

