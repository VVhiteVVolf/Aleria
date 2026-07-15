// Data boundary for the standalone family-tree application embedded by the Almanach.

const FAMILY_TREE_EMBED_DEFAULT_SOURCE = '../Stammb%C3%A4ume/Stammbaum.html?mode=view';

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

function sanitizeFamilyTreeEmbedSource(value = '') {
  const source = String(value || '').trim().replace(/\\/g, '/');
  if (!source) return FAMILY_TREE_EMBED_DEFAULT_SOURCE;
  const isSameOriginPath = /^(?:\.\.?\/|\/(?!\/))[^\u0000-\u001f<>"'`]+$/u.test(source);
  return isSameOriginPath
    ? forceFamilyTreeViewMode(migrateLegacyFamilyTreeEmbedSource(source))
    : FAMILY_TREE_EMBED_DEFAULT_SOURCE;
}

function sanitizeFamilyTreeEmbedData(value = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const rawHeight = Number(source.height);
  return {
    source: sanitizeFamilyTreeEmbedSource(source.source),
    title: String(source.title || 'Interaktiver Stammbaum').trim().slice(0, 160) || 'Interaktiver Stammbaum',
    intro: String(source.intro || 'Der Stammbaum wird aus der eigenständigen Aleria-Stammbäume-Anwendung geladen.').trim().slice(0, 600),
    height: Number.isFinite(rawHeight) ? Math.max(520, Math.min(1200, Math.round(rawHeight))) : 760
  };
}
