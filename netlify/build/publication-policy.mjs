// Authoring sources remain in the source repository. Their public counterparts
// (crests, previews, production images and explicit original downloads) stay live.
export function isAuthoringArchive(file) {
  return file.startsWith('diagnostics/')
    || file.startsWith('output/heraldry/')
    || /^Vorschau\/[^/]+\/assets\/(?:warriors\/)?generated(?:-archive)?\//.test(file);
}
