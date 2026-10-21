const fonts = new Map();
const scripts = new Map();

function loadScript(url) {
  if (!scripts.has(url)) scripts.set(url, new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => { scripts.delete(url); script.remove(); reject(Error('Schriftzeichen konnten nicht geladen werden.')); }, { once: true });
    document.head.append(script);
  }));
  return scripts.get(url);
}

export async function ensureNoticeFont(font) {
  if (!font) return;
  for (const url of font.dependencies || []) await loadScript(url);
  const key = `${font.family}:${font.url}`;
  if (!fonts.has(key)) {
    const face = new FontFace(font.family, `url("${font.url}")`, { display: 'swap', weight: '400', style: 'normal' });
    fonts.set(key, face.load().then(loaded => { document.fonts.add(loaded); })
      .catch(error => { fonts.delete(key); throw error; }));
  }
  await fonts.get(key);
}
