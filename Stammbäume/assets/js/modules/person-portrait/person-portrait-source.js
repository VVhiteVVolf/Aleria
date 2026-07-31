const BLOCKED_SCHEMES = /^(?:data|blob|javascript|file):/i;
const EXPLICIT_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const STAGED_IMAGE = /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i;

export function normalizePortraitSource(value) {
  return String(value || '').trim();
}

export function assertUsablePortraitSource(value) {
  const source = normalizePortraitSource(value);
  if (!source) return '';
  if (STAGED_IMAGE.test(source)) return source;
  if (BLOCKED_SCHEMES.test(source)) {
    throw new Error('Bitte eine HTTPS-Adresse oder einen lokalen Projektpfad für das Portrait verwenden.');
  }
  if (EXPLICIT_SCHEME.test(source) && !source.startsWith('https://')) {
    throw new Error('Externe Portraits müssen über HTTPS geladen werden.');
  }
  if (source.startsWith('//')) {
    throw new Error('Bitte die vollständige HTTPS-Adresse des Portraits eintragen.');
  }
  return source;
}
