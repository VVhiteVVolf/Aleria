// Data boundary for the standalone family-tree application embedded by the Almanach.

const FAMILY_TREE_EMBED_ROUTE = '../Stammb%C3%A4ume/Stammbaum.html';
const FAMILY_TREE_EMBED_DEFAULT_SOURCE = `${FAMILY_TREE_EMBED_ROUTE}?mode=view`;

function sanitizeFamilyTreeEmbedFamilyId(value = '') {
  const familyId = String(value || '').trim().toLocaleLowerCase('de');
  return /^[a-z0-9-]{2,120}$/u.test(familyId) ? familyId : '';
}

function getFamilyTreeEmbedFamilyIdFromSource(value = '') {
  const source = String(value || '').trim().replace(/\\/g, '/');
  const match = source.match(/[?&]family=([^&#]*)/iu);
  if (!match) return '';
  try {
    return sanitizeFamilyTreeEmbedFamilyId(decodeURIComponent(match[1]));
  } catch {
    return '';
  }
}

function createFamilyTreeEmbedSource(familyId = '') {
  const normalizedId = sanitizeFamilyTreeEmbedFamilyId(familyId);
  const query = normalizedId
    ? `family=${encodeURIComponent(normalizedId)}&mode=view`
    : 'mode=view';
  return `${FAMILY_TREE_EMBED_ROUTE}?${query}`;
}

function migrateLegacyFamilyTreeEmbedSource(source) {
  return source.replace(
    /((?:Stammbäume|Stammb%C3%A4ume)\/)index\.html(?=[?#]|$)/giu,
    '$1Stammbaum.html'
  );
}

function forceFamilyTreeViewMode(source) {
  const hashIndex = source.indexOf('#');
  const pathAndQuery = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
  const hash = hashIndex >= 0 ? source.slice(hashIndex) : '';
  const modePattern = /([?&])mode=[^&#]*/iu;
  const viewSource = modePattern.test(pathAndQuery)
    ? pathAndQuery.replace(modePattern, '$1mode=view')
    : `${pathAndQuery}${pathAndQuery.includes('?') ? '&' : '?'}mode=view`;
  return `${viewSource}${hash}`;
}

function sanitizeFamilyTreeEmbedSource(value = '', familyId = '') {
  const source = String(value || '').trim().replace(/\\/g, '/');
  const normalizedId = sanitizeFamilyTreeEmbedFamilyId(familyId)
    || getFamilyTreeEmbedFamilyIdFromSource(source);
  if (normalizedId) return createFamilyTreeEmbedSource(normalizedId);
  if (!source) return FAMILY_TREE_EMBED_DEFAULT_SOURCE;
  const isSameOriginPath = /^(?:\.\.?\/|\/(?!\/))[^\u0000-\u001f<>"'`]+$/u.test(source);
  return isSameOriginPath
    ? forceFamilyTreeViewMode(migrateLegacyFamilyTreeEmbedSource(source))
    : FAMILY_TREE_EMBED_DEFAULT_SOURCE;
}

function sanitizeFamilyTreeEmbedData(value = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const rawHeight = Number(source.height);
  const familyId = sanitizeFamilyTreeEmbedFamilyId(source.familyId)
    || getFamilyTreeEmbedFamilyIdFromSource(source.source);
  return {
    familyId,
    source: sanitizeFamilyTreeEmbedSource(source.source, familyId),
    title: String(source.title || 'Interaktiver Stammbaum').trim().slice(0, 160) || 'Interaktiver Stammbaum',
    intro: String(source.intro || 'Der Stammbaum wird aus der eigenständigen Aleria-Stammbäume-Anwendung geladen.').trim().slice(0, 600),
    height: Number.isFinite(rawHeight) ? Math.max(520, Math.min(1200, Math.round(rawHeight))) : 760
  };
}
