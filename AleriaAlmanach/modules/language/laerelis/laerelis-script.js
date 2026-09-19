// The direct glyphs keep TH, DH, SH and NG stable even without font ligatures.
// Conversion is display-only and must only run for an explicitly selected script.
const Laerelis = (() => {
  const alphabet = LAERELIS_REFERENCE_DATA.alphabet;
  const glyphs = new Map(alphabet.map(letter => [letter.laut, letter.direktzeichen]));
  const ogham = new Map(alphabet.map(letter => [letter.ogham_kompatibilitaet, letter.direktzeichen]));

  function toPrivateUse(text) {
    return String(text ?? '').replace(/th|dh|sh|ng|[\s\S]/gi, token => (
      glyphs.get(token.toLowerCase()) || ogham.get(token) || token
    ));
  }

  return Object.freeze({ toPrivateUse });
})();
