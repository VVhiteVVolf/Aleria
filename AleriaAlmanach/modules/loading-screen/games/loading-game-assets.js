export async function loadGameImages(environment, assetUrl, files, signal) {
  return Object.fromEntries(await Promise.all(Object.entries(files).map(async ([name, file]) => {
    const image = new environment.Image();
    const cancel = () => image.removeAttribute('src');
    signal.addEventListener('abort', cancel, { once: true });
    try {
      image.src = assetUrl(file);
      await image.decode();
      return [name, image];
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  })));
}

export function loadGameStylesheet(document, href, signal) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  return new Promise((resolve, reject) => {
    link.addEventListener('load', resolve, { once: true, signal });
    link.addEventListener('error', () => reject(new Error('Das Spiel-Stylesheet fehlt.')), { once: true, signal });
    signal.addEventListener('abort', () => { link.remove(); reject(signal.reason); }, { once: true });
    document.head.append(link);
  });
}
