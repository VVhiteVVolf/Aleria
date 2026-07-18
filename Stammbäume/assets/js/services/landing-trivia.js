import { formatHouseProfile, isHouseProfileEmpty } from '../domain/house-profile.js';

// Wählt eine zufällige, aber wiederholungsfreie Auswahl bestehender Familien für die
// Landingpage-Trivia. Leerakten (noch keine einzige Person) werden ausgeschlossen,
// da sie nichts zu erzählen haben. randomFn ist injizierbar, damit sich die Auswahl
// deterministisch testen lässt.
export function pickTriviaSample(records, { count = 4, randomFn = Math.random } = {}) {
  const candidates = (Array.isArray(records) ? records : [])
    .filter(record => Number(record.personCount ?? record.family?.persons.length ?? 0) > 0);
  const pool = [...candidates];
  const sample = [];
  while (pool.length && sample.length < count) {
    const index = Math.floor(randomFn() * pool.length);
    sample.push(pool.splice(Math.max(0, Math.min(index, pool.length - 1)), 1)[0]);
  }
  return sample;
}

// Kurzfassung des Hausprofils (nur Rang + Stammsitz/Herrschaftsgebiet), da die volle
// formatHouseProfile()-Ausgabe für eine Trivia-Kachel zu lang ist.
export function buildShortHouseProfile(houseProfile) {
  if (!houseProfile || isHouseProfileEmpty(houseProfile)) return '';
  return formatHouseProfile(houseProfile, ' · ');
}

// Lokal erzeugter Trivia-Text (kein KI-Aufruf nötig) — degradiert bei fehlenden
// Segmenten graziös, statt Lücken oder "undefined" anzuzeigen.
export function buildLocalTriviaBlurb(record, { generationCount = 0 } = {}) {
  const title = String(record?.title || record?.family?.document.title || 'Diese Familie').trim();
  const profile = buildShortHouseProfile(record?.houseProfile || record?.family?.document.houseProfile);
  const personCount = Number(record?.personCount ?? record?.family?.persons.length ?? 0);
  const segments = [];
  segments.push(profile ? `${title} — ${profile}.` : `${title}.`);
  if (personCount > 0) {
    segments.push(`${personCount} ${personCount === 1 ? 'verzeichnete Person' : 'verzeichnete Personen'}${generationCount > 0 ? ` über ${generationCount} ${generationCount === 1 ? 'Generation' : 'Generationen'}` : ''}.`);
  }
  return segments.join(' ');
}

// Prompt für die optionale AleriaGPT-Anreicherung — liefert nur Fakten, die bereits
// aus den Daten bekannt sind, damit die KI nichts Ungefragtes erfindet.
export function buildLandingTriviaPrompt({ title, profileSummary, personCount, generationCount }) {
  const fakten = [
    profileSummary ? `Einordnung: ${profileSummary}.` : '',
    Number(personCount) > 0 ? `Verzeichnete Personen: ${personCount}.` : '',
    Number(generationCount) > 0 ? `Generationen: ${generationCount}.` : ''
  ].filter(Boolean).join(' ');
  return `Schreibe einen kurzen, stimmungsvollen Ein-Satz-Trivia-Text (max. 25 Wörter) über das Adelshaus/die Familie "${title}" in der Fantasy-Welt Aleria. Bekannte Fakten (erfinde nichts darüber hinaus, nutze nur diese oder allgemeine stimmungsvolle Formulierungen): ${fakten || 'keine weiteren Angaben.'} Antworte nur mit dem Satz, ohne Anführungszeichen oder Erklärung.`;
}
