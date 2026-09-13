// Resolve complete assets so Vite can rewrite each URL without treating a directory as a file.
export const PROJECT_FONTS = [
  ['Aleria Arcana', 'Arkane Ritualrunen', new URL('../../../../Fonts/Arkanes-Alphabet/fonts/AleriaArcana-Regular.woff2', import.meta.url).href],
  // Keep the saved document family as an alias; always load the new, versioned font file.
  ['Karnrith Hochschnitt', 'Karnrith Tiefenrunen · Morgorn', new URL('../../../../Fonts/Karnrith-Font-2.000/fonts/KarnrithTiefenrunen-Regular.woff2?v=3', import.meta.url).href],
  ['Rheunwaith', 'Rheunwaith', new URL('../../../../Fonts/Rheunwaith-Font-1.000/fonts/Rheunwaith-Regular.woff2?v=2-gezeiten', import.meta.url).href],
  ['Nharazim', 'Nharazim · Infernal', new URL('../../../../Fonts/Infernal-Font-1.000/fonts/Nharazim-Regular.woff2?v=2-abgrund', import.meta.url).href],
  ['Kanaanith Monumental', 'Kanaanith', new URL('../../../../Fonts/Kanaanith-Gesamtpaket-1.000/Web/KanaanithMonumental-Regular.woff2', import.meta.url).href],
  ['Lingua Argenti Monumental', 'Lingua Argenti', new URL('../../../../Fonts/Lingua-Argenti-Gesamtpaket-1.000/Fonts/LinguaArgentiMonumental-Regular.woff2', import.meta.url).href],
  ['Stoicheia Polis', 'Stoicheia', new URL('../../../../Fonts/Stoicheia-Gesamtpaket-1.000/Fonts/StoicheiaPolis-Regular.woff2', import.meta.url).href],
  ['Faehrtenlaut', 'Fährtenlaut', new URL('../../../../Fonts/Faehrtenlaut-Font-1.000/Web/Faehrtenlaut-Regular.woff2', import.meta.url).href]
].map(([family, label, url]) => ({ family, label, url }));
