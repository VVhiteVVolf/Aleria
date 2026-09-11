const root = new URL('../../../../Fonts/', import.meta.url);
export const PROJECT_FONTS = [
  ['Aleria Arcana', 'Arkane Ritualrunen', 'Arkanes-Alphabet/fonts/AleriaArcana-Regular.woff2'],
  ['Karnrith Hochschnitt', 'Karnrith · Morgorn', 'Karnrith-Font-2.000/Web/KarnrithHochschnitt-Regular.woff2'],
  ['Rheunwaith', 'Rheunwaith', 'Rheunwaith-Font-1.000/Web/Rheunwaith-Regular.woff2'],
  ['Nharazim', 'Nharazim · Infernal', 'Infernal-Font-1.000/fonts/Nharazim-Regular.woff2?v=2-abgrund'],
  ['Kanaanith Monumental', 'Kanaanith', 'Kanaanith-Gesamtpaket-1.000/Web/KanaanithMonumental-Regular.woff2'],
  ['Lingua Argenti Monumental', 'Lingua Argenti', 'Lingua-Argenti-Gesamtpaket-1.000/Fonts/LinguaArgentiMonumental-Regular.woff2'],
  ['Stoicheia Polis', 'Stoicheia', 'Stoicheia-Gesamtpaket-1.000/Fonts/StoicheiaPolis-Regular.woff2'],
  ['Faehrtenlaut', 'Fährtenlaut', 'Faehrtenlaut-Font-1.000/Web/Faehrtenlaut-Regular.woff2']
].map(([family, label, path]) => ({ family, label, url: new URL(path, root).href }));
