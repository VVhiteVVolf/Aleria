import { firebasePublicConfig } from '../../../../AleriaAlmanach/modules/auth/firebase-public-config.js';
import { createWorldDateReadRepository } from '../../../../AleriaAlmanach/modules/world-date/world-date-read-repository.mjs';
import { isNoticeDate, noticeDate, NOTICE_START_DATE } from './notice-dates.mjs';

const localKey = 'aleria.current-world-date.v1';
export function cachedWorldDate(storage = globalThis.localStorage) {
  try { const value = JSON.parse(storage?.getItem(localKey) || 'null'); return isNoticeDate(value) ? noticeDate(value) : { ...NOTICE_START_DATE }; }
  catch { return { ...NOTICE_START_DATE }; }
}

export function subscribeBoardWorldDate(onNext, onStatus = () => {}) {
  let active = true, unsubscribe = () => {};
  const storageChanged = event => {
    if (event.key !== localKey) return;
    try { const value = JSON.parse(event.newValue || 'null'); if (isNoticeDate(value)) onNext(noticeDate(value)); } catch {}
  };
  window.addEventListener('storage', storageChanged);
  onNext(cachedWorldDate());
  onStatus('connecting');
  Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
  ]).then(([appSdk, sdk]) => {
    if (!active) return;
    const name = 'aleria-notice-world-date';
    const app = appSdk.getApps().find(app => app.name === name) || appSdk.initializeApp(firebasePublicConfig, name);
    const repository = createWorldDateReadRepository({ db: sdk.getFirestore(app), sdk });
    unsubscribe = repository.subscribe(value => {
      if (!active || !isNoticeDate(value)) return;
      onNext(noticeDate(value)); onStatus('online');
    }, () => { if (active) onStatus('offline'); });
  }).catch(() => { if (active) onStatus('offline'); });
  return () => { active = false; unsubscribe(); window.removeEventListener('storage', storageChanged); };
}
