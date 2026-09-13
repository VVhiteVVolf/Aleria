// Upgrade only the identifiable, superseded reference pages of the Morgar entry.
// Keep this pure: loading an old local/remote record must not itself write to Firebase.
function migrateMorgarLanguageEntry(entry) {
  return migrateMorgarTerminologyEntry(migrateMorgarLegacyReferenceEntry(entry));
}

function migrateMorgarLegacyReferenceEntry(entry) {
  if (entry?.id !== 'morgar-karnrith' || !Array.isArray(entry.pages)) return entry;
  const pages = entry.pages;
  const names = pages[2]?.nameList;
  const oldNamePage = /(?:200|400) Namen aus dem Morgar/.test(pages[2]?.pageTitle || '')
    && names?.ornamentStyle === 'karnrith';
  const oldReference = pages[1]?.languagePage && pages[2]?.nameListPage && pages[3]?.scriptTablePage && oldNamePage;
  const isFontArchiveImage = image => /(?:^|\/)Fonts\/Karnrith-Font-2\.000\//i.test(image || '');
  const oldCover = isFontArchiveImage(pages[0]?.image);
  if (!oldReference && !oldCover) return entry;

  const current = createMorgarLanguageEntry();
  if (!oldReference) {
    return {
      ...entry,
      image: isFontArchiveImage(entry.image) ? current.image : entry.image,
      pages: pages.map((page, index) => index === 0 ? {
        ...page, image: current.pages[0].image, imageFit: 'contain', imagePosition: 'center'
      } : page)
    };
  }
  const isOldReferenceRegister = page => page?.scriptTablePage
    && /Morgar 1\.1/.test(page.scriptTable?.archiveLabel || '')
    && /(?:100 Grundwörter|Namen mit Aussprache)/.test(page.pageTitle || '');
  const additionalPages = pages.slice(4).filter(page => !isOldReferenceRegister(page));
  return {
    ...entry,
    subtitle: current.subtitle,
    image: !entry.image || isFontArchiveImage(entry.image) ? current.image : entry.image,
    multipage: true,
    pages: [
      ...current.pages.map((page, index) => index < 4 ? { ...pages[index], ...page } : page),
      ...additionalPages
    ]
  };
}
