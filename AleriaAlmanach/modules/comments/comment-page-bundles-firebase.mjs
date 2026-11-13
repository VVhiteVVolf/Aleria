// Owns only the presentation field on the existing per-thread metadata document.
import { normalizeBundleMetadata } from './comment-page-bundles-model.mjs';

export function createCommentPageBundleRepository({ db, sdk, commit, requireUser }) {
  const ref = threadId => sdk.doc(db, 'comment_turns', threadId);
  return {
    async loadCommentPageBundles(threadId) {
      const snapshot = await sdk.getDoc(ref(threadId));
      return normalizeBundleMetadata(snapshot.exists() ? snapshot.data().commentPageBundles : null);
    },
    subscribeCommentPageBundles(threadId, onNext, onError) {
      return sdk.onSnapshot(ref(threadId), snapshot => {
        try { onNext(normalizeBundleMetadata(snapshot.exists() ? snapshot.data().commentPageBundles : null)); }
        catch (error) { onError?.(error); }
      }, onError);
    },
    async commitCommentPageBundle(payload) {
      await requireUser();
      const result = await commit(payload);
      return normalizeBundleMetadata(result.data.metadata);
    }
  };
}
