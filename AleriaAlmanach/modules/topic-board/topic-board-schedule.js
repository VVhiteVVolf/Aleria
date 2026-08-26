const TOPIC_BOARD_SCHEDULE_SCHEMA_VERSION = 1;
const TOPIC_BOARD_SCHEDULE_MAX_DAYS = 3650;

function normalizeTopicBoardScheduleDate(value = {}) {
  const model = globalThis.AleriaWorldDateModel;
  if (!model?.normalize || !model?.isValid) return { year: null, month: null, day: null };
  const date = model.normalize(value);
  return model.isValid(date) ? date : { year: null, month: null, day: null };
}

function hasTopicBoardScheduleDate(value) {
  return globalThis.AleriaWorldDateModel?.isValid?.(normalizeTopicBoardScheduleDate(value)) === true;
}

function normalizeTopicBoardScheduleDays(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const number = Math.round(Number(value));
  return Number.isFinite(number) && number >= 1
    ? Math.min(number, TOPIC_BOARD_SCHEDULE_MAX_DAYS)
    : null;
}

function normalizeTopicBoardSchedule(input = {}, options = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const travel = options.travel && typeof options.travel === 'object' ? options.travel : {};
  const directStartDate = source.startDate || source.dueDate || source.date;
  const startDate = normalizeTopicBoardScheduleDate(
    hasTopicBoardScheduleDate(directStartDate) ? directStartDate : options.fallbackDate
  );
  const durationDays = normalizeTopicBoardScheduleDays(source.durationDays);
  const travelDurationDays = travel.enabled === true
    ? normalizeTopicBoardScheduleDays(travel.totalDays)
    : null;
  const effectiveDurationDays = travelDurationDays ?? durationDays;
  const durationSource = travelDurationDays !== null
    ? 'travel'
    : (durationDays !== null ? 'manual' : 'none');
  let endDate = null;
  if (hasTopicBoardScheduleDate(startDate) && effectiveDurationDays !== null) {
    if (durationSource === 'travel' && hasTopicBoardScheduleDate(travel.arrivalDate)) {
      endDate = normalizeTopicBoardScheduleDate(travel.arrivalDate);
    } else {
      const dayOffset = durationSource === 'travel'
        ? effectiveDurationDays
        : Math.max(0, effectiveDurationDays - 1);
      endDate = globalThis.AleriaWorldDateModel.shift(startDate, dayOffset);
    }
  }
  return {
    startDate,
    durationDays,
    effectiveDurationDays,
    durationSource,
    endDate,
    schemaVersion: TOPIC_BOARD_SCHEDULE_SCHEMA_VERSION
  };
}

function getTopicBoardScheduleTiming(input = {}, currentDate) {
  const model = globalThis.AleriaWorldDateModel;
  const source = input && typeof input === 'object' ? input : {};
  const startDate = normalizeTopicBoardScheduleDate(source.startDate);
  const endDate = normalizeTopicBoardScheduleDate(source.endDate);
  if (!hasTopicBoardScheduleDate(startDate) || !model?.isValid?.(currentDate)) {
    return { state: 'unscheduled', daysUntilStart: null, daysUntilEnd: null };
  }
  const daysUntilStart = model.differenceInDays(currentDate, startDate);
  const daysUntilEnd = hasTopicBoardScheduleDate(endDate)
    ? model.differenceInDays(currentDate, endDate)
    : null;
  if (daysUntilStart > 0) return { state: 'upcoming', daysUntilStart, daysUntilEnd };
  if (daysUntilStart === 0) return { state: 'today', daysUntilStart, daysUntilEnd };
  if (daysUntilEnd !== null && daysUntilEnd >= 0) {
    return { state: 'active', daysUntilStart, daysUntilEnd };
  }
  return { state: 'overdue', daysUntilStart, daysUntilEnd };
}

globalThis.AleriaTopicBoardSchedule = Object.freeze({
  maxDays: TOPIC_BOARD_SCHEDULE_MAX_DAYS,
  schemaVersion: TOPIC_BOARD_SCHEDULE_SCHEMA_VERSION,
  getTiming: getTopicBoardScheduleTiming,
  hasDate: hasTopicBoardScheduleDate,
  normalize: normalizeTopicBoardSchedule
});
