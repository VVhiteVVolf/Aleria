// Contributions receive normalized dates from the composer. Validate this
// boundary without inventing a fallback date or retaining arbitrary metadata.
export function normalizeCommentSceneStartDate(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { year, month, day } = value;
  if (!Number.isSafeInteger(year) || year < 1
    || !Number.isInteger(month) || month < 1 || month > 13
    || !Number.isInteger(day) || day < 1 || day > 36) return null;
  return { year, month, day };
}
