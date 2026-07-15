export function createToast(element) {
  let timer = 0;
  return function showToast(message, options = {}) {
    globalThis.clearTimeout(timer);
    element.textContent = message;
    element.classList.toggle('is-error', options.error === true);
    element.classList.add('is-visible');
    timer = globalThis.setTimeout(() => element.classList.remove('is-visible'), options.duration || 2800);
  };
}
