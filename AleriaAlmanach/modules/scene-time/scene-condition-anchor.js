// A missing clock is not midnight. Day-only labels remain valid calendar
// metadata, but cannot start or rewind a mechanical duration clock.
function explicitNumber(value) {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getSceneConditionAnchor(event = {}) {
  const day = explicitNumber(event.anchorDay), seconds = explicitNumber(event.anchorSeconds);
  if (!Number.isSafeInteger(day) || day < 1 || seconds == null || seconds < 0 || seconds >= 86400) return null;
  const anchorSeconds = Math.floor(seconds);
  const cursor = (day - 1) * 86400 + anchorSeconds;
  return Number.isSafeInteger(cursor) ? { day, seconds: anchorSeconds, cursor } : null;
}
