function topicBoardScheduleEscape(value) {
  if (typeof topicBoardEscape === 'function') return topicBoardEscape(value);
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function getCurrentTopicBoardWorldDate() {
  const model = globalThis.AleriaWorldDateModel;
  const current = globalThis.AleriaWorldDateStore?.getState?.().date || model?.getDefault?.();
  return model?.isValid?.(current) ? model.normalize(current) : { year: null, month: null, day: null };
}

function formatTopicBoardScheduleDate(value, options = {}) {
  if (!globalThis.AleriaTopicBoardSchedule?.hasDate(value)) return '';
  if (typeof formatAleriaDate === 'function') return formatAleriaDate(value, options);
  return `${String(value.day).padStart(2, '0')}.${String(value.month).padStart(2, '0')} Jahr ${value.year}`;
}

function getTopicBoardScheduleTimingCopy(input = {}, currentDate = getCurrentTopicBoardWorldDate()) {
  const timing = globalThis.AleriaTopicBoardSchedule.getTiming(input, currentDate);
  if (timing.state === 'upcoming') {
    return {
      ...timing,
      label: timing.daysUntilStart === 1 ? 'Morgen fällig' : `In ${timing.daysUntilStart} Tagen`
    };
  }
  if (timing.state === 'today') return { ...timing, label: 'Heute fällig' };
  if (timing.state === 'active') {
    return {
      ...timing,
      label: timing.daysUntilEnd === 0
        ? 'Läuft · endet heute'
        : `Läuft · noch ${timing.daysUntilEnd} ${timing.daysUntilEnd === 1 ? 'Tag' : 'Tage'}`
    };
  }
  if (timing.state === 'overdue') {
    const elapsed = Math.abs(timing.daysUntilEnd ?? timing.daysUntilStart);
    return {
      ...timing,
      label: elapsed === 1 ? 'Seit gestern fällig' : `Seit ${elapsed} Tagen fällig`
    };
  }
  return { ...timing, label: 'Termin noch offen' };
}

function renderTopicBoardScheduleBadge(input = {}) {
  const schedule = globalThis.AleriaTopicBoardSchedule.normalize(input);
  const timing = getTopicBoardScheduleTimingCopy(input);
  const date = formatTopicBoardScheduleDate(schedule.startDate, { withWeekday: false });
  if (!date) {
    return `<span class="topic-board-schedule-badge is-unscheduled" data-topic-board-schedule-state="unscheduled">
      <span class="topic-board-schedule-calendar" aria-hidden="true"><small>Termin</small><strong>?</strong></span>
      <span><strong>Termin offen</strong><small>Kalenderdatum festlegen</small></span>
    </span>`;
  }
  return `<span class="topic-board-schedule-badge is-${timing.state}" data-topic-board-schedule-state="${timing.state}">
    <span class="topic-board-schedule-calendar" aria-hidden="true"><small>M${schedule.startDate.month}</small><strong>${schedule.startDate.day}</strong><em>${schedule.startDate.year}</em></span>
    <span><strong>${topicBoardScheduleEscape(timing.label)}</strong><small>${topicBoardScheduleEscape(date)}</small></span>
  </span>`;
}

function renderTopicBoardScheduleCard(input = {}) {
  const schedule = globalThis.AleriaTopicBoardSchedule.normalize(input);
  const start = formatTopicBoardScheduleDate(schedule.startDate);
  if (!start) {
    return `<section class="topic-board-schedule-card is-unscheduled">
      <div aria-hidden="true">▣</div><div><small>Kalendereintrag</small><strong>Termin noch nicht festgelegt</strong><span>Beim Bearbeiten kann ein fester Aleria-Tag gesetzt werden.</span></div>
    </section>`;
  }
  const timing = getTopicBoardScheduleTimingCopy(input);
  const end = formatTopicBoardScheduleDate(input.endDate);
  const duration = Number(input.effectiveDurationDays);
  const durationCopy = Number.isFinite(duration) && duration > 0
    ? `${duration} ${duration === 1 ? 'Tag' : 'Tage'}${input.durationSource === 'travel' ? ' laut Reiseplanung' : ''}`
    : 'Dauer noch offen';
  return `<section class="topic-board-schedule-card is-${timing.state}" data-topic-board-schedule-state="${timing.state}">
    <div class="topic-board-schedule-card-icon" aria-hidden="true">▣</div>
    <div><small>Beginnt / wird fällig</small><strong>${topicBoardScheduleEscape(start)}</strong><span>${topicBoardScheduleEscape(timing.label)}</span></div>
    <div><small>${input.durationSource === 'travel' ? 'Ankunft' : 'Geplantes Ende'}</small><strong>${topicBoardScheduleEscape(end || 'Noch offen')}</strong><span>${topicBoardScheduleEscape(durationCopy)}</span></div>
  </section>`;
}

function renderTopicBoardScheduleEditorSummary(input = {}, travel = {}) {
  const schedule = globalThis.AleriaTopicBoardSchedule.normalize(input, { travel });
  const start = formatTopicBoardScheduleDate(schedule.startDate);
  if (!start) return '<span>Bitte einen vollständigen Aleria-Termin eintragen.</span>';
  const timing = getTopicBoardScheduleTimingCopy(schedule);
  const end = formatTopicBoardScheduleDate(schedule.endDate);
  const endLabel = schedule.durationSource === 'travel' ? 'Ankunft' : 'Ende';
  return `<span><strong>${topicBoardScheduleEscape(timing.label)}</strong> · ${topicBoardScheduleEscape(start)}</span>${end ? `<small>${endLabel}: ${topicBoardScheduleEscape(end)}</small>` : '<small>Dauer oder Reisezeit noch offen</small>'}`;
}

function getTopicBoardScheduleEditorValue(input = {}, travel = {}) {
  const currentDate = getCurrentTopicBoardWorldDate();
  const fallbackDate = globalThis.AleriaTopicBoardSchedule.hasDate(input?.startDate)
    ? input.startDate
    : (globalThis.AleriaTopicBoardSchedule.hasDate(travel?.departureDate) ? travel.departureDate : currentDate);
  return globalThis.AleriaTopicBoardSchedule.normalize(input, { travel, fallbackDate });
}

function renderTopicBoardScheduleEditor(input = {}, travel = {}) {
  const schedule = getTopicBoardScheduleEditorValue(input, travel);
  const current = getCurrentTopicBoardWorldDate();
  const currentLabel = formatTopicBoardScheduleDate(current) || 'Seitendatum nicht gesetzt';
  return `<section class="topic-board-form-section topic-board-field-wide topic-board-schedule-editor" data-topic-board-schedule-editor>
    <header>
      <span class="topic-board-schedule-editor-icon" aria-hidden="true">▣</span>
      <div><small>Verbindlicher Kalendereintrag</small><strong>Wann beginnt oder wird das Thema relevant?</strong></div>
      <span class="topic-board-schedule-current" data-topic-board-schedule-current>Seitendatum: ${topicBoardScheduleEscape(currentLabel)}</span>
    </header>
    <div class="topic-board-schedule-fields">
      <fieldset class="topic-board-schedule-date">
        <legend>Start- / Fälligkeitsdatum</legend>
        <label><span>Tag</span><input name="scheduleStartDay" type="number" min="1" max="36" value="${schedule.startDate.day ?? ''}" required></label>
        <label><span>Monat</span><input name="scheduleStartMonth" type="number" min="1" max="13" value="${schedule.startDate.month ?? ''}" required></label>
        <label><span>Jahr</span><input name="scheduleStartYear" type="number" min="1" value="${schedule.startDate.year ?? ''}" required></label>
      </fieldset>
      <label class="topic-board-field topic-board-schedule-duration"><span>Dauer in Tagen</span><input name="scheduleDurationDays" type="number" min="1" max="${globalThis.AleriaTopicBoardSchedule.maxDays}" step="1" value="${schedule.durationDays ?? ''}" placeholder="optional"><small>Bei Reisen wird automatisch die berechnete Gesamtreisezeit verwendet.</small></label>
    </div>
    <div class="topic-board-schedule-quick" aria-label="Termin relativ zum Seitendatum setzen">
      <span>Schnell setzen:</span>
      ${[
        { days: 0, label: 'Heute' },
        { days: 1, label: 'Morgen' },
        { days: 2, label: '+2 Tage' },
        { days: 3, label: '+3 Tage' },
        { days: 4, label: '+4 Tage' },
        { days: 7, label: '+7 Tage' }
      ].map(option => `<button type="button" data-topic-board-action="set-schedule-offset" data-topic-board-schedule-offset="${option.days}">${option.label}</button>`).join('')}
    </div>
    <div class="topic-board-schedule-editor-summary" data-topic-board-schedule-summary>${renderTopicBoardScheduleEditorSummary(schedule, travel)}</div>
  </section>`;
}

function collectTopicBoardScheduleForm(form, travel = {}) {
  if (!form) return globalThis.AleriaTopicBoardSchedule.normalize({}, { travel });
  const value = name => form.elements[name]?.value ?? '';
  return globalThis.AleriaTopicBoardSchedule.normalize({
    startDate: {
      day: value('scheduleStartDay'),
      month: value('scheduleStartMonth'),
      year: value('scheduleStartYear')
    },
    durationDays: value('scheduleDurationDays')
  }, { travel });
}

function refreshTopicBoardScheduleEditor(form, travel = {}) {
  const current = form?.querySelector?.('[data-topic-board-schedule-current]');
  if (current) {
    const currentLabel = formatTopicBoardScheduleDate(getCurrentTopicBoardWorldDate()) || 'Seitendatum nicht gesetzt';
    current.textContent = `Seitendatum: ${currentLabel}`;
  }
  const summary = form?.querySelector?.('[data-topic-board-schedule-summary]');
  if (!summary) return;
  const schedule = collectTopicBoardScheduleForm(form, travel);
  const timing = getTopicBoardScheduleTimingCopy(schedule);
  summary.dataset.state = timing.state;
  summary.innerHTML = renderTopicBoardScheduleEditorSummary(schedule, travel);
}

function setTopicBoardScheduleOffset(form, days, travel = {}) {
  const current = getCurrentTopicBoardWorldDate();
  if (!form || !globalThis.AleriaWorldDateModel?.isValid?.(current)) return false;
  const target = globalThis.AleriaWorldDateModel.shift(current, Math.round(Number(days) || 0));
  form.elements.scheduleStartDay.value = target.day;
  form.elements.scheduleStartMonth.value = target.month;
  form.elements.scheduleStartYear.value = target.year;
  refreshTopicBoardScheduleEditor(form, travel);
  return true;
}

globalThis.AleriaTopicBoardScheduleUI = Object.freeze({
  collect: collectTopicBoardScheduleForm,
  formatDate: formatTopicBoardScheduleDate,
  refresh: refreshTopicBoardScheduleEditor,
  renderBadge: renderTopicBoardScheduleBadge,
  renderCard: renderTopicBoardScheduleCard,
  renderEditor: renderTopicBoardScheduleEditor,
  setOffset: setTopicBoardScheduleOffset
});
