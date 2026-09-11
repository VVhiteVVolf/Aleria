import { createCalendarEventModel } from './calendar-events-model.mjs';

// Firebase wird ausschließlich hier angesprochen; dieselbe Anmeldung wie im Almanach.
export function createCalendarRepository({ db, sdk, requireUser, getCalendar }) {
  const name = 'calendar_events';
  return Object.freeze({
    subscribe(onNext, onError) {
      return sdk.onSnapshot(sdk.collection(db, name), snapshot => {
        onNext(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
      }, onError);
    },
    async save(input) {
      const user = await requireUser();
      const event = createCalendarEventModel(getCalendar()).normalize(input);
      if (!/^[a-zA-Z0-9_-]{1,100}$/.test(event.id)) throw new Error('Ungültige Termin-ID.');
      const reference = sdk.doc(db, name, event.id);
      return sdk.runTransaction(db, async transaction => {
        const snapshot = await transaction.get(reference);
        const previous = snapshot.exists() ? snapshot.data() : null;
        if (Number(previous?.revision || 0) !== event.revision) {
          throw new Error('Dieser Termin wurde inzwischen geändert. Bitte die Online-Fassung neu öffnen; dein lokaler Entwurf bleibt erhalten.');
        }
        const record = { ...event, revision: event.revision + 1, updatedBy: user.uid, updatedAt: sdk.serverTimestamp() };
        transaction.set(reference, record);
        return { ...record, updatedAt: null };
      });
    }
  });
}
