import { accountErrorMessage } from './firebase-account-actions.js';
import { accountAvatarId } from './account-avatar-catalog.js';
import { accountButtonMarkup, accountDialogMarkup, accountProfileMarkup } from './account-markup.js';
import { renderAccountAccess, renderAccountMode } from './account-render.js';

export function mountAccountUi(root, service = () => window._fbAuth) {
  if (!root) return;
  root.innerHTML = accountButtonMarkup();
  const dialog = document.createElement('dialog');
  dialog.className = 'account-dialog';
  dialog.setAttribute('aria-labelledby', 'account-title');
  dialog.innerHTML = accountDialogMarkup();
  root.append(dialog);
  const find = role => dialog.querySelector(`[data-role="${role}"]`);
  find('registration-profile').innerHTML = accountProfileMarkup('registration');
  find('saved-profile').innerHTML = accountProfileMarkup('profile');
  const form = find('account-form');
  const profileForm = find('account-profile-form');
  let busy = false;
  let previousFocus = null;
  let loadedProfile = '';
  function message(text, error = false) {
    find('account-message').textContent = text;
    find('account-message').classList.toggle('account-error', error);
  }
  function render() {
    if (busy) return;
    const access = service()?.getAccess();
    renderAccountAccess(root, dialog, access);
    const profileKey = JSON.stringify([access?.uid, access?.displayName, access?.photoURL]);
    if (loadedProfile !== profileKey) {
      loadedProfile = profileKey;
      profileForm.elements.displayName.value = access?.displayName || '';
      profileForm.elements.profileAvatar.value = accountAvatarId(access?.photoURL) || 'gawain';
    }
    renderAccountMode(form, dialog);
  }
  async function run(operation, success) {
    if (busy) return;
    busy = true;
    message('Myrddin sortiert seine Zauber …');
    renderAccountAccess(root, dialog, service()?.getAccess(), false);
    try { await operation(); message(success); }
    catch (error) { message(accountErrorMessage(error), true); }
    finally { form.elements.password.value = ''; busy = false; render(); }
  }
  const profile = (target, field) => ({ displayName: target.elements.displayName.value, avatarId: target.elements[field].value });
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action]');
    const action = trigger?.dataset.action;
    if (action === 'open-account') {
      previousFocus = document.activeElement;
      if (trigger.dataset.mode) form.elements.mode.value = trigger.dataset.mode;
      message(''); render(); dialog.showModal();
    }
    if (action === 'close-account') dialog.close();
    if (action === 'logout') run(() => service().logout(), 'Gildenpass verstaut. Du kannst mit einem neuen Browserzugang weiter kommentieren.');
    if (action === 'verify-email') run(() => service().verifyEmail(), 'Myrddin hat den Postzauber gewirkt. Schau in dein E-Mail-Postfach, gegebenenfalls auch in den Spamordner.');
    if (action === 'refresh-account') run(() => service().refreshAccount(), 'Der Bestätigungsstatus ist aktualisiert.');
    if (action === 'reset-password') {
      if (!form.elements.email.reportValidity()) return;
      run(() => service().resetPassword(form.elements.email.value), 'Falls zu dieser E-Mail ein Konto besteht, bekommst du einen Link für ein neues Passwort.');
    }
  });
  form.addEventListener('change', () => renderAccountMode(form, dialog));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const login = form.elements.mode.value === 'login';
    const account = service();
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const selectedProfile = profile(form, 'registrationAvatar');
    const verify = form.elements.sendVerification.checked;
    run(async () => {
      if (login) return account.login(email, password);
      await account.secureBrowserAccess(email, password, selectedProfile);
      if (verify) {
        try { await account.verifyEmail(); }
        catch { throw new Error('Dein Gildenpass wurde angelegt. Die Bestätigungsmail konnte noch nicht gesendet werden; fordere sie hier erneut an.'); }
      }
    }, login ? 'Willkommen zurück! Dein Gildenpass ist wieder da.' : `Dein Gildenpass ist angelegt. Deine bisherige Nutzer-ID bleibt erhalten.${verify ? ' Myrddins Bestätigungsmail ist unterwegs.' : ''}`);
  });
  profileForm.addEventListener('submit', event => { event.preventDefault(); run(() => service().saveAccountProfile(profile(profileForm, 'profileAvatar')), 'Neuer Name, neues Grinsen – dein Gildenpass ist aktualisiert.'); });
  dialog.addEventListener('close', () => { form.elements.password.value = ''; previousFocus?.focus(); });
  window.addEventListener('aleria:auth-state-changed', render);
  window.addEventListener('fb-ready', render);
  render();
}
