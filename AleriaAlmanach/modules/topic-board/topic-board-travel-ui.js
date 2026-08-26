function topicBoardTravelEscape(value) {
  if (typeof topicBoardEscape === 'function') return topicBoardEscape(value);
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function formatTopicBoardTravelNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('de-DE', { maximumFractionDigits: 1 });
}

function formatTopicBoardTravelDate(value) {
  if (!globalThis.AleriaTopicBoardTravel?.hasDate(value)) return '';
  if (typeof formatAleriaDate === 'function') return formatAleriaDate(value);
  return `${String(value.day).padStart(2, '0')}.${String(value.month).padStart(2, '0')} Jahr ${value.year}`;
}

function getTopicBoardTravelUnitLabel(unit) {
  return unit === 'meilen' ? 'Meilen' : 'km';
}

function getTopicBoardTravelRoute(travel) {
  const route = [
    travel.origin,
    ...travel.stopovers.map(stopover => stopover.place),
    travel.destination
  ].filter(Boolean);
  return route.filter((place, index) => place !== route[index - 1]);
}

function renderTopicBoardTravelCard(input) {
  const travel = globalThis.AleriaTopicBoardTravel.normalize(input);
  if (!travel.enabled) return '';
  const unit = getTopicBoardTravelUnitLabel(travel.distanceUnit);
  const route = getTopicBoardTravelRoute(travel);
  const arrival = formatTopicBoardTravelDate(travel.arrivalDate);
  const stats = [
    travel.distance !== null
      ? { label: 'Entfernung', value: `${formatTopicBoardTravelNumber(travel.distance)} ${unit}` }
      : null,
    travel.travelDays !== null
      ? { label: 'Reine Reisezeit', value: `${travel.travelDays} ${travel.travelDays === 1 ? 'Tag' : 'Tage'}` }
      : null,
    travel.totalDays !== null
      ? { label: 'Gesamtdauer', value: `${travel.totalDays} ${travel.totalDays === 1 ? 'Tag' : 'Tage'}` }
      : null,
    arrival ? { label: 'Ankunft', value: arrival } : null
  ].filter(Boolean);
  const pace = travel.dailyDistance !== null
    ? `${formatTopicBoardTravelNumber(travel.dailyDistance)} ${unit} pro Reisetag`
    : '';
  return `<section class="topic-board-travel-card">
    <header><span aria-hidden="true">⌁</span><div><small>Optionale Reiseplanung</small><strong>${route.length ? topicBoardTravelEscape(route.join(' → ')) : 'Route noch offen'}</strong></div></header>
    ${stats.length ? `<div class="topic-board-travel-stats">${stats.map(stat => `<div><small>${stat.label}</small><strong>${topicBoardTravelEscape(stat.value)}</strong></div>`).join('')}</div>` : '<p class="topic-board-travel-pending">Reisedaten sind noch nicht vollständig geplant.</p>'}
    ${pace ? `<p class="topic-board-travel-pace">Grundlage: ${topicBoardTravelEscape(pace)}${travel.calculationMode === 'manual' ? ' · Reisetage manuell festgelegt' : ''}</p>` : ''}
    ${travel.stopovers.length ? `<ol class="topic-board-travel-stops">${travel.stopovers.map(stopover => {
      const details = [
        stopover.distanceFromStart !== null ? `nach ${formatTopicBoardTravelNumber(stopover.distanceFromStart)} ${unit}` : '',
        stopover.stayDays ? `${stopover.stayDays} ${stopover.stayDays === 1 ? 'Tag' : 'Tage'} Aufenthalt` : '',
        stopover.note
      ].filter(Boolean).join(' · ');
      return `<li><strong>${topicBoardTravelEscape(stopover.place || 'Unbenannter Zwischenstopp')}</strong>${details ? `<span>${topicBoardTravelEscape(details)}</span>` : ''}</li>`;
    }).join('')}</ol>` : ''}
  </section>`;
}

function renderTopicBoardTravelStopover(stopover = {}, index = 0) {
  const normalized = globalThis.AleriaTopicBoardTravel.normalizeStopovers([stopover])[0] || {
    place: '', distanceFromStart: null, stayDays: 0, note: ''
  };
  return `<div class="topic-board-travel-stop" data-topic-board-travel-stop>
    <span class="topic-board-travel-stop-number" data-topic-board-travel-stop-number aria-hidden="true">${index + 1}</span>
    <label class="topic-board-field"><span>Zwischenstopp</span><input name="travelStopPlace" type="text" maxlength="180" value="${topicBoardTravelEscape(normalized.place)}" placeholder="Hafen von Dunvar"></label>
    <label class="topic-board-field"><span>Entfernung ab Start</span><input name="travelStopDistance" type="number" min="0" max="1000000" step="0.1" value="${normalized.distanceFromStart ?? ''}" placeholder="160"></label>
    <label class="topic-board-field"><span>Aufenthalt in Tagen</span><input name="travelStopDays" type="number" min="0" max="3650" step="1" value="${normalized.stayDays || ''}" placeholder="1"></label>
    <label class="topic-board-field topic-board-travel-stop-note"><span>Grund / Notiz</span><input name="travelStopNote" type="text" maxlength="360" value="${topicBoardTravelEscape(normalized.note)}" placeholder="Vorräte aufnehmen"></label>
    <button type="button" data-topic-board-action="remove-travel-stop" aria-label="Zwischenstopp entfernen">×</button>
  </div>`;
}

function renderTopicBoardTravelEditorSummary(input) {
  const travel = globalThis.AleriaTopicBoardTravel.normalize(input);
  if (!travel.enabled) return '';
  if (travel.travelDays === null) {
    return '<span>Für die Berechnung Gesamtentfernung und Tagesleistung oder manuelle Reisetage eintragen.</span>';
  }
  const parts = [`${travel.travelDays} ${travel.travelDays === 1 ? 'Reisetag' : 'Reisetage'}`];
  if (travel.stopoverDays) parts.push(`${travel.stopoverDays} ${travel.stopoverDays === 1 ? 'Tag' : 'Tage'} Zwischenstopps`);
  if (travel.restDays) parts.push(`${travel.restDays} ${travel.restDays === 1 ? 'Rasttag' : 'Rasttage'}`);
  const arrival = formatTopicBoardTravelDate(travel.arrivalDate);
  return `<span>${topicBoardTravelEscape(parts.join(' + '))}</span><strong>= ${travel.totalDays} ${travel.totalDays === 1 ? 'Tag' : 'Tage'} gesamt</strong>${arrival ? `<small>Ankunft: ${topicBoardTravelEscape(arrival)}</small>` : ''}`;
}

function renderTopicBoardTravelEditor(input) {
  const travel = globalThis.AleriaTopicBoardTravel.normalize(input);
  const unit = travel.distanceUnit;
  return `<section class="topic-board-form-section topic-board-field-wide topic-board-travel-editor" data-topic-board-travel-editor>
    <div class="topic-board-travel-toggle-row">
      <label class="topic-board-travel-toggle">
        <input name="travelEnabled" type="checkbox"${travel.enabled ? ' checked' : ''}>
        <span>Reiseplanung hinzufügen</span>
      </label>
      <small>Optional · bleibt bei gewöhnlichen Themen vollständig ausgeblendet</small>
    </div>
    <div class="topic-board-travel-fields" data-topic-board-travel-fields${travel.enabled ? '' : ' hidden'}>
      <div class="topic-board-travel-grid">
        <label class="topic-board-field"><span>Startort</span><input name="travelOrigin" type="text" maxlength="180" value="${topicBoardTravelEscape(travel.origin)}" placeholder="Celtigerns Wacht"></label>
        <label class="topic-board-field"><span>Zielort</span><input name="travelDestination" type="text" maxlength="180" value="${topicBoardTravelEscape(travel.destination)}" placeholder="Abergwint"></label>
        <label class="topic-board-field"><span>Gesamtentfernung</span><input name="travelDistance" type="number" min="0" max="1000000" step="0.1" value="${travel.distance ?? ''}" placeholder="420"></label>
        <label class="topic-board-field"><span>Einheit</span><select name="travelDistanceUnit"><option value="km"${unit === 'km' ? ' selected' : ''}>Kilometer</option><option value="meilen"${unit === 'meilen' ? ' selected' : ''}>Meilen</option></select></label>
        <label class="topic-board-field"><span>Strecke pro Reisetag</span><input name="travelDailyDistance" type="number" min="0" max="1000000" step="0.1" value="${travel.dailyDistance ?? ''}" placeholder="90"></label>
        <label class="topic-board-field"><span>Reisetage manuell</span><input name="travelManualDays" type="number" min="1" max="3650" step="1" value="${travel.manualTravelDays ?? ''}" placeholder="optional"></label>
        <label class="topic-board-field"><span>Rast- / Puffertage</span><input name="travelRestDays" type="number" min="0" max="3650" step="1" value="${travel.restDays || ''}" placeholder="0"></label>
      </div>
      <div class="topic-board-travel-stopovers">
        <div class="topic-board-travel-stopovers-head"><div><strong>Zwischenstopps</strong><small>Ort, Position auf der Route und Aufenthaltsdauer</small></div><button type="button" data-topic-board-action="add-travel-stop">＋ Zwischenstopp</button></div>
        <div data-topic-board-travel-stops>${travel.stopovers.map(renderTopicBoardTravelStopover).join('')}</div>
      </div>
      <div class="topic-board-travel-calculation" data-topic-board-travel-summary>${renderTopicBoardTravelEditorSummary(travel)}</div>
    </div>
  </section>`;
}

function collectTopicBoardTravelForm(form) {
  if (!form) return globalThis.AleriaTopicBoardTravel.normalize({});
  const value = name => form.elements[name]?.value ?? '';
  const stopovers = Array.from(form.querySelectorAll('[data-topic-board-travel-stop]')).map(row => ({
    place: row.querySelector('[name="travelStopPlace"]')?.value || '',
    distanceFromStart: row.querySelector('[name="travelStopDistance"]')?.value || '',
    stayDays: row.querySelector('[name="travelStopDays"]')?.value || '',
    note: row.querySelector('[name="travelStopNote"]')?.value || ''
  }));
  return globalThis.AleriaTopicBoardTravel.normalize({
    enabled: !!form.elements.travelEnabled?.checked,
    origin: value('travelOrigin'),
    destination: value('travelDestination'),
    distance: value('travelDistance'),
    distanceUnit: value('travelDistanceUnit'),
    dailyDistance: value('travelDailyDistance'),
    manualTravelDays: value('travelManualDays'),
    restDays: value('travelRestDays'),
    stopovers
  });
}

function refreshTopicBoardTravelEditor(form) {
  if (!form) return;
  const enabled = !!form.elements.travelEnabled?.checked;
  const fields = form.querySelector('[data-topic-board-travel-fields]');
  if (fields) fields.hidden = !enabled;
  const summary = form.querySelector('[data-topic-board-travel-summary]');
  if (summary) summary.innerHTML = renderTopicBoardTravelEditorSummary(collectTopicBoardTravelForm(form));
}

function addTopicBoardTravelStopover(form) {
  const list = form?.querySelector('[data-topic-board-travel-stops]');
  if (!list) return false;
  const count = list.querySelectorAll('[data-topic-board-travel-stop]').length;
  if (count >= globalThis.AleriaTopicBoardTravel.limits.stopoverCount) return false;
  list.insertAdjacentHTML('beforeend', renderTopicBoardTravelStopover({}, count));
  list.lastElementChild?.querySelector('[name="travelStopPlace"]')?.focus();
  refreshTopicBoardTravelEditor(form);
  return true;
}

function removeTopicBoardTravelStopover(button) {
  const row = button?.closest?.('[data-topic-board-travel-stop]');
  const form = button?.closest?.('[data-topic-board-form]');
  if (!row || !form) return false;
  row.remove();
  form.querySelectorAll('[data-topic-board-travel-stop-number]').forEach((number, index) => {
    number.textContent = String(index + 1);
  });
  refreshTopicBoardTravelEditor(form);
  return true;
}

globalThis.AleriaTopicBoardTravelUI = Object.freeze({
  addStopover: addTopicBoardTravelStopover,
  collect: collectTopicBoardTravelForm,
  refresh: refreshTopicBoardTravelEditor,
  removeStopover: removeTopicBoardTravelStopover,
  renderCard: renderTopicBoardTravelCard,
  renderEditor: renderTopicBoardTravelEditor
});
