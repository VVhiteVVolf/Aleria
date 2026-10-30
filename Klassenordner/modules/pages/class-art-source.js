/** Class documents may use the established remote library or scoped local art. */
export function isClassArtSource(source) {
 return typeof source==='string' && (
  /^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(png|jpg|jpeg|webp)$/i.test(source)
  || /^\.\.\/\.\.\/assets\/images\/[a-z0-9][a-z0-9/-]*\.(png|jpg|jpeg|webp)$/.test(source)
 );
}
