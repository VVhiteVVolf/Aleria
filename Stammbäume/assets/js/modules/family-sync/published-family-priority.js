/**
 * Loads the public Firebase release without delaying the local application
 * bootstrap. The release is applied only while the page still shows the same
 * family context that was active when the request started.
 */
function sourceRevision(family) {
  const revision = Number(family?.extensions?.sourceRevision);
  return Number.isInteger(revision) && revision >= 0 ? revision : 0;
}

export function isStalePublishedPlaceholder(publishedFamily, currentFamily) {
  return publishedFamily?.extensions?.blankFamily === true
    && currentFamily?.extensions?.blankFamily !== true
    && sourceRevision(currentFamily) > sourceRevision(publishedFamily);
}

export async function applyPublishedFamilyPriority({
  requestedFamilyId,
  initialFamilyId,
  store,
  cloudRepository,
  onUnavailable = () => {}
}) {
  const familyId = String(requestedFamilyId || '');
  if (!familyId || !store || typeof cloudRepository?.loadPublished !== 'function') return false;

  try {
    const published = await cloudRepository.loadPublished(familyId);
    if (!published?.family || published.family.document?.id !== familyId) return false;
    if (store.getState().family.document.id !== initialFamilyId) return false;
    if (isStalePublishedPlaceholder(published.family, store.getState().family)) return false;
    store.synchronizeFamily(published.family, { source: 'firebase-published-priority' });
    return true;
  } catch (error) {
    onUnavailable(error);
    return false;
  }
}
