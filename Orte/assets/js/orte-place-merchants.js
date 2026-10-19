import { renderMerchantDirectory } from '../../modules/merchants/merchant-directory.mjs?v=merchant-directory-20261019';

const page = document.querySelector('[data-orte-static-template]');
const root = page?.querySelector('[data-orte-merchants]');
if (root) {
  const render = data => renderMerchantDirectory(root, Array.isArray(data?.merchants) ? data.merchants : []);
  document.addEventListener('aleria:orte:data-ready', event => render(event.detail?.data || window.ORT_DATA));
  if (window.ORT_DATA) render(window.ORT_DATA);
}
