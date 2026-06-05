const ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT = 'https://aleria-gpt.sueriyekoek.workers.dev';

(function configureAleriaGptBackendEndpoint() {
  const endpoint = String(ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT || '').trim().replace(/\/+$/g, '');
  if (!endpoint) return;
  if (location.hostname === 'dieweltvonaleria.neocities.org') {
    window.ALERIA_GPT_BACKEND_ENDPOINT = endpoint;
  }
}());
