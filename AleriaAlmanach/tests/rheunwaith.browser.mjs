import { runLanguageScriptBrowser } from './support/language-script-browser.mjs';

await runLanguageScriptBrowser({
  language: 'rheunwaith', entryId: 'rheunwaith', label: 'Rheunwaith', family: 'Rheunwaith', api: 'Rheunwaith',
  imageLabels: ['Alphabet', 'Schriftprobe', 'Erweiterter Zeichensatz'], nameCount: 400,
  tokens: ['Ch', 'Ll', 'Ng', 'Rh', 'Th'],
  text: 'Chwerw Llwyd Ngoll Rhyd Thal — Königin Q grüßt zwölf Jäger & 25 €.',
  legacyText: '𐰛𐰙𐰚𐰜𐰒', currentText: ''
}, {
  origin: process.env.RHEUNWAITH_TEST_ORIGIN, prefix: process.env.RHEUNWAITH_PATH_PREFIX,
  screenshots: process.env.RHEUNWAITH_SCREENSHOTS
});
