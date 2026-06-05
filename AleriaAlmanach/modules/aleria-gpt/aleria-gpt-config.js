const ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT = 'https://aleria-gpt.sueriyekoek.workers.dev';
const ALERIA_GPT_PRODUCTION_ORIGINS = new Set([
  'https://dieweltvonaleria.netlify.app'
]);

(function configureAleriaGptBackendEndpoint() {
  const endpoint = String(ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT || '').trim().replace(/\/+$/g, '');
  if (!endpoint) return;
  if (ALERIA_GPT_PRODUCTION_ORIGINS.has(location.origin)) {
    window.ALERIA_GPT_BACKEND_ENDPOINT = endpoint;
  }
}());
