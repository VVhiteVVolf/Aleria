import { runLanguageScriptBrowser } from './support/language-script-browser.mjs';

await runLanguageScriptBrowser({
  language: 'karnrith', entryId: 'morgar-karnrith', label: 'Karnrith Tiefenrunen', family: 'Karnrith Tiefenrunen', api: 'Karnrith',
  imageLabels: ['Zeichentafel', 'Schriftprobe', 'Tastaturzeichen'], nameCount: 1100, nameGroupCounts: [500, 500, 100], registerPages: [{ index: 4, count: 371 }],
  tokens: ['Ng', 'Th', 'Kh', 'Gh', 'Sh', 'Ch', 'Dh'],
  text: 'Darak Brana. Ir garan, thalen tora! — C J X ÄÖÜ ßẞ & 25 €.',
  legacyText: '', currentText: ''
}, {
  origin: process.env.KARNRITH_TEST_ORIGIN, prefix: process.env.KARNRITH_PATH_PREFIX,
  screenshots: process.env.KARNRITH_SCREENSHOTS
});
