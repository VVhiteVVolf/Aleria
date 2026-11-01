// Authoring sources remain in the source repository. Their public counterparts
// (crests, previews, production images and explicit original downloads) stay live.
const SOURCE_ARCHIVE_ROOTS = [
  'AleriaAlmanach/modules/gawain-duncan/source/',
  'AleriaAlmanach/modules/group-adventures/source/',
  'AleriaAlmanach/backups/scenes/'
];

export function isAuthoringArchive(file) {
  return file.startsWith('diagnostics/')
    || SOURCE_ARCHIVE_ROOTS.some(root => file.startsWith(root))
    || file === 'AleriaAlmanach/assets/currency/image-prompts.json'
    || file.startsWith('output/heraldry/')
    || /^Vorschau\/[^/]+\/assets\/(?:warriors\/)?(?:generated(?:-archive)?|alternates)\//.test(file)
    || /^Klassenordner\/assets\/images\/brevanor\/icons\/generated\//.test(file);
}
