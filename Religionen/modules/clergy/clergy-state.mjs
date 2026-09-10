export function readClergyCaste(url, casteIds) {
  let hash = '';
  try { hash = decodeURIComponent(new URL(url).hash.slice(1)); } catch { /* Unknown fragments use the first caste. */ }
  return casteIds.includes(hash) ? hash : casteIds[0];
}

export function writeClergyCaste(url, casteId, casteIds) {
  if (!casteIds.includes(casteId)) throw new Error(`Unbekannte Kaste: ${casteId}`);
  const target = new URL(url);
  target.hash = casteId;
  return target;
}
