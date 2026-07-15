function numericYear(value) {
  const match = String(value || '').match(/\d{1,4}/);
  return match ? Number(match[0]) : null;
}

export function latestKnownPersonYear(personIds, personById) {
  const years = personIds
    .map(personId => personById.get(personId))
    .map(person => numericYear(person?.death) ?? numericYear(person?.birth))
    .filter(year => year !== null);
  return years.length ? String(Math.max(...years)) : '';
}

export function earliestKnownBirthYear(personIds, personById) {
  const years = personIds
    .map(personId => numericYear(personById.get(personId)?.birth))
    .filter(year => year !== null);
  return years.length ? String(Math.min(...years)) : '';
}
