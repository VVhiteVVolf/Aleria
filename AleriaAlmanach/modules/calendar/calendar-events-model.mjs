export const CALENDAR_TEMPLATES = Object.freeze([
  { id: 'audience', name: 'Audienz', title: 'Audienz am Hof', icon: 'ReiterIcons/Orden.png', prompt: 'Wer empfängt wen? Welches Anliegen wird vorgetragen?', recurrence: 'none' },
  { id: 'court', name: 'Gerichtstag', title: 'Offenes Gericht', icon: 'ReiterIcons/Organisationen.png', prompt: 'Ort der Verhandlung, Zuständigkeit und Anliegen …', recurrence: 'week' },
  { id: 'holiday', name: 'Feiertag', title: '', icon: 'ReiterIcons/Religion.png', prompt: 'Bedeutung, Bräuche und beteiligte Gemeinschaften …', recurrence: 'year' },
  { id: 'council', name: 'Ratssitzung', title: 'Zusammenkunft des Rates', icon: 'ReiterIcons/Gilden.png', prompt: 'Einberufung, Tagesordnung und eingeladene Ratsmitglieder …', recurrence: 'none' },
  { id: 'tournament', name: 'Turnier', title: '', icon: 'ReiterIcons/Ereignisse.png', prompt: 'Disziplinen, Gastgeber und Teilnahmebedingungen …', recurrence: 'none' },
  { id: 'ceremony', name: 'Zeremonie', title: '', icon: 'ReiterIcons/Orden.png', prompt: 'Belehnung, Eid, Trauung oder offizieller Empfang …', recurrence: 'none' },
  { id: 'market', name: 'Markttag', title: '', icon: 'ReiterIcons/Markt.png', prompt: 'Handelsplatz, Waren und geltende Marktprivilegien …', recurrence: 'week' },
  { id: 'journey', name: 'Reise', title: '', icon: 'ReiterIcons/Kontinente.png', prompt: 'Aufbruch, Ziel, Weg und Reisegesellschaft …', recurrence: 'none' },
  { id: 'memorial', name: 'Gedenktag', title: '', icon: 'ReiterIcons/Zeitstrahl.png', prompt: 'Wem oder welchem Ereignis wird gedacht?', recurrence: 'year' },
  { id: 'other', name: 'Eigener Termin', title: '', icon: 'ReiterIcons/Kalender.png', prompt: 'Kurzer Überblick …', recurrence: 'none' }
]);

export function createCalendarEventModel(calendar) {
  const text = (value, max) => String(value ?? '').trim().slice(0, max);
  const validDate = date => Number.isInteger(Number(date?.year)) && Number(date.year) > 0 && Number(date.year) <= 100000
    && Number.isInteger(Number(date?.month)) && Number(date.month) >= 1 && Number(date.month) <= calendar.monthsPerYear
    && Number.isInteger(Number(date?.day)) && Number(date.day) >= 1 && Number(date.day) <= calendar.daysPerMonth;
  function normalize(input) {
    const start = input.start;
    const end = input.end || start;
    if (!validDate(start) || !validDate(end)) throw new Error('Bitte ein vollständiges Aleria-Datum wählen.');
    if (!text(input.title, 150)) throw new Error('Bitte einen Titel eingeben.');
    const time = value => !value ? '' : /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
    const startTime = time(input.startTime), endTime = time(input.endTime);
    if (startTime === null || endTime === null) throw new Error('Bitte gültige Uhrzeiten angeben.');
    if (!!startTime !== !!endTime) throw new Error('Bitte Beginn und Ende angeben oder beide Uhrzeiten leer lassen.');
    const type = CALENDAR_TEMPLATES.find(template => template.id === input.type)?.id || 'other';
    const result = {
      id: text(input.id, 100), schemaVersion: 1, title: text(input.title, 150), type,
      start: calendar.normalize(start), end: calendar.normalize(end), startTime, endTime,
      location: text(input.location, 200), summary: text(input.summary, 2400),
      icon: text(input.icon, 2000), articleHref: text(input.articleHref, 2000),
      recurrence: ['week', 'year'].includes(input.recurrence) ? input.recurrence : 'none',
      participants: (Array.isArray(input.participants) ? input.participants : []).slice(0, 40).map(person => ({ id: text(person.id, 160), name: text(person.name, 160), portrait: text(person.portrait, 2000) })).filter(person => person.id && person.name),
      revision: Math.max(0, Math.trunc(Number(input.revision) || 0)), deleted: input.deleted === true
    };
    const [a, b] = interval(result);
    if (b < a) throw new Error('Das Ende muss nach dem Beginn liegen.');
    if (b - a > calendar.daysPerYear * 1440) throw new Error('Ein Termin darf höchstens ein Aleria-Jahr dauern.');
    return result;
  }
  function minutes(time, fallback) {
    if (!time) return fallback;
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  }
  function interval(event, shiftDays = 0) {
    return [(calendar.ordinal(event.start) + shiftDays) * 1440 + minutes(event.startTime, 0),
      (calendar.ordinal(event.end) + shiftDays) * 1440 + minutes(event.endTime, 1439)];
  }
  function occurrences(events, from, to = from) {
    const fromDay = calendar.ordinal(from), toDay = calendar.ordinal(to);
    if (fromDay === null || toDay === null || toDay < fromDay) return [];
    const result = [];
    for (const raw of events) {
      let event;
      try { event = normalize(raw); } catch { continue; }
      if (event.deleted) continue;
      const start = calendar.ordinal(event.start), end = calendar.ordinal(event.end);
      const period = event.recurrence === 'week' ? calendar.daysPerWeek : event.recurrence === 'year' ? calendar.daysPerYear : 0;
      const first = period ? Math.max(0, Math.ceil((fromDay - end) / period)) : 0;
      const last = period ? Math.floor((toDay - start) / period) : 0;
      for (let index = first; index <= last; index++) {
        const shift = index * period;
        if (end + shift < fromDay || start + shift > toDay) continue;
        result.push({ ...event, start: calendar.shift(event.start, shift), end: calendar.shift(event.end, shift), occurrenceKey: `${event.id}:${start + shift}`, source: raw });
      }
    }
    return result.sort((a, b) => interval(a)[0] - interval(b)[0] || a.title.localeCompare(b.title, 'de'));
  }
  const overlaps = (a, b) => { const [a1, a2] = interval(a), [b1, b2] = interval(b); return a1 <= b2 && b1 <= a2; };
  return Object.freeze({ normalize, occurrences, overlaps, interval });
}
