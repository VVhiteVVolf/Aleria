// Attach source defaults at the registry boundary without mutating a family graph.
// Saved biographies still use the existing upgrade policy, including explicit null.
export function withHouseBiographyDefault(family, defaults) {
  const entry = defaults[family.document.id];
  if (!entry || Object.hasOwn(family.extensions || {}, 'houseBiographyModule')) return family;
  return Object.freeze({
    ...family,
    extensions: {
      ...family.extensions,
      sourceRevision: Math.max(family.extensions?.sourceRevision || 0, entry.sourceRevision),
      houseBiographyModule: entry.biography,
    },
  });
}
