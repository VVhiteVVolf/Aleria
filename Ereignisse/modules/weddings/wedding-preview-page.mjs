import { createWeddingPreview } from './wedding-preview.mjs';
const root = document.querySelector('[data-wedding-register-preview]');
if (root) createWeddingPreview({root,eventsBase:new URL('./',location.href),calendar:globalThis.AleriaCalendar});
