// Convert direct rune codes only within an explicitly selected script.
// Karnrith's legacy range overlaps Rheunwaith's current range; never infer the language.
function getLanguageScriptDisplayText(text, style) {
  const value = String(text ?? '');
  if (style === 'rheunwaith') return Rheunwaith.toPrivateUse(value);
  if (style === 'karnrith') return Karnrith.fromLegacy(value);
  if (style === 'laerelis') return Laerelis.toPrivateUse(value);
  return value;
}
