const TOPIC_BOARD_TRAVEL_SCHEMA_VERSION = 1;

const TOPIC_BOARD_TRAVEL_LIMITS = Object.freeze({
  line: 180,
  note: 360,
  stopoverCount: 10,
  distance: 1000000,
  days: 3650
});

function normalizeTopicBoardTravelLine(value, maximum = TOPIC_BOARD_TRAVEL_LIMITS.line) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum);
}

function normalizeTopicBoardTravelNumber(value, maximum, options = {}) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const number = Number(String(value).replace(',', '.'));
  const minimum = options.allowZero ? 0 : Number.EPSILON;
  if (!Number.isFinite(number) || number < minimum) return null;
  return Math.min(number, maximum);
}

function normalizeTopicBoardTravelDays(value, options = {}) {
  const number = normalizeTopicBoardTravelNumber(value, TOPIC_BOARD_TRAVEL_LIMITS.days, options);
  if (number === null) return null;
  const rounded = Math.round(number);
  return !options.allowZero && rounded < 1 ? null : rounded;
}

function normalizeTopicBoardTravelDate(value = {}) {
  const model = globalThis.AleriaWorldDateModel;
  if (model?.normalize && model?.isValid) {
    const normalized = model.normalize(value);
    return model.isValid(normalized) ? normalized : { year: null, month: null, day: null };
  }
  const year = Math.round(Number(value?.year));
  const month = Math.round(Number(value?.month));
  const day = Math.round(Number(value?.day));
  return year > 0 && month >= 1 && month <= 13 && day >= 1 && day <= 36
    ? { year, month, day }
    : { year: null, month: null, day: null };
}

function hasTopicBoardTravelDate(value) {
  const date = normalizeTopicBoardTravelDate(value);
  return !!(date.year && date.month && date.day);
}

function normalizeTopicBoardStopovers(input) {
  const stopovers = Array.isArray(input) ? input : [];
  return stopovers.map(stopover => {
    const place = normalizeTopicBoardTravelLine(stopover?.place);
    const note = normalizeTopicBoardTravelLine(stopover?.note, TOPIC_BOARD_TRAVEL_LIMITS.note);
    const distanceFromStart = normalizeTopicBoardTravelNumber(
      stopover?.distanceFromStart,
      TOPIC_BOARD_TRAVEL_LIMITS.distance
    );
    const stayDays = normalizeTopicBoardTravelDays(stopover?.stayDays, { allowZero: true });
    if (!place && !note && distanceFromStart === null && stayDays === null) return null;
    return {
      place,
      distanceFromStart,
      stayDays: stayDays ?? 0,
      note
    };
  }).filter(Boolean).slice(0, TOPIC_BOARD_TRAVEL_LIMITS.stopoverCount);
}

function shiftTopicBoardTravelDate(value, days) {
  if (!hasTopicBoardTravelDate(value)) return null;
  const model = globalThis.AleriaWorldDateModel;
  if (model?.shift) return model.shift(value, days);
  const ordinal = (value.year - 1) * 468 + (value.month - 1) * 36 + value.day + days;
  const safeOrdinal = Math.max(1, ordinal);
  const year = Math.floor((safeOrdinal - 1) / 468) + 1;
  const dayOfYear = safeOrdinal - (year - 1) * 468;
  const month = Math.floor((dayOfYear - 1) / 36) + 1;
  const day = dayOfYear - (month - 1) * 36;
  return { year, month, day };
}

function calculateTopicBoardTravel(input = {}) {
  const distance = normalizeTopicBoardTravelNumber(input.distance, TOPIC_BOARD_TRAVEL_LIMITS.distance);
  const dailyDistance = normalizeTopicBoardTravelNumber(input.dailyDistance, TOPIC_BOARD_TRAVEL_LIMITS.distance);
  const manualTravelDays = normalizeTopicBoardTravelDays(input.manualTravelDays);
  const restDays = normalizeTopicBoardTravelDays(input.restDays, { allowZero: true }) ?? 0;
  const stopovers = normalizeTopicBoardStopovers(input.stopovers);
  const stopoverDays = stopovers.reduce((total, stopover) => total + stopover.stayDays, 0);
  const travelDays = manualTravelDays ?? (
    distance !== null && dailyDistance !== null
      ? Math.ceil(distance / dailyDistance)
      : null
  );
  const totalDays = travelDays === null ? null : travelDays + stopoverDays + restDays;
  const departureDate = normalizeTopicBoardTravelDate(input.departureDate);
  const arrivalDate = totalDays !== null
    ? shiftTopicBoardTravelDate(departureDate, totalDays)
    : null;
  return {
    distance,
    dailyDistance,
    manualTravelDays,
    restDays,
    stopovers,
    stopoverDays,
    travelDays,
    totalDays,
    departureDate,
    arrivalDate,
    calculationMode: manualTravelDays !== null
      ? 'manual'
      : (travelDays !== null ? 'distance' : 'pending')
  };
}

function normalizeTopicBoardTravel(input = {}) {
  const enabled = input?.enabled === true;
  if (!enabled) {
    return {
      enabled: false,
      origin: '',
      destination: '',
      distance: null,
      distanceUnit: 'km',
      dailyDistance: null,
      manualTravelDays: null,
      restDays: 0,
      departureDate: { year: null, month: null, day: null },
      stopovers: [],
      stopoverDays: 0,
      travelDays: null,
      totalDays: null,
      arrivalDate: null,
      calculationMode: 'pending',
      schemaVersion: TOPIC_BOARD_TRAVEL_SCHEMA_VERSION
    };
  }
  const calculation = calculateTopicBoardTravel(input);
  return {
    enabled: true,
    origin: normalizeTopicBoardTravelLine(input.origin),
    destination: normalizeTopicBoardTravelLine(input.destination),
    distance: calculation.distance,
    distanceUnit: input.distanceUnit === 'meilen' ? 'meilen' : 'km',
    dailyDistance: calculation.dailyDistance,
    manualTravelDays: calculation.manualTravelDays,
    restDays: calculation.restDays,
    departureDate: calculation.departureDate,
    stopovers: calculation.stopovers,
    stopoverDays: calculation.stopoverDays,
    travelDays: calculation.travelDays,
    totalDays: calculation.totalDays,
    arrivalDate: calculation.arrivalDate,
    calculationMode: calculation.calculationMode,
    schemaVersion: TOPIC_BOARD_TRAVEL_SCHEMA_VERSION
  };
}

globalThis.AleriaTopicBoardTravel = Object.freeze({
  limits: TOPIC_BOARD_TRAVEL_LIMITS,
  calculate: calculateTopicBoardTravel,
  hasDate: hasTopicBoardTravelDate,
  normalize: normalizeTopicBoardTravel,
  normalizeStopovers: normalizeTopicBoardStopovers
});
