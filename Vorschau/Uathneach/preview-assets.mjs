// Only legacy artwork in the flat assets directory has lossless WebP aliases.
// Nested production PNGs retain their actual format and path.
export const previewAsset = path => path.replace(/^(assets\/[^/]+)\.png$/i, '$1.webp');
