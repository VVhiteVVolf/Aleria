import { accountErrorMessage } from './firebase-account-actions.js';

export function mountAccountUi(root, service = () => window._fbAuth) {
  if (!root) return;
  root.innerHTML = '<button type="button" data-action="open-account" class="account-open">Konto / Anmeldung</button>';
  const dialog = document.createElement('dialog');
  dialog.className = 'account-dialog';
  dialog.setAttribute('aria-labelledby', 'account-title');
  dialog.innerHTML = `
    <div class="account-heading"><h2 id="account-title">Dein Aleria-Zugang</h2><button type="button" data-action="close-account" aria-label="Schließen">×</button></div>
    <p data-role="account-status"></p>
    <div data-role="account-identity" hidden><p data-role="account-email"></p><p>Nutzer-ID: <code data-role="account-uid"></code></p><p data-role="account-role"></p></div>
    <form data-role="account-form">
      <fieldset data-role="account-modes"><legend>Zugang wählen</legend><label><input type="radio" name="mode" value="secure" checked> Diesen Browserzugang sichern</label><label><input type="radio" name="mode" value="login"> Mit bestehendem Konto anmelden</label></fieldset>
      <p data-role="account-hint">Mit E-Mail und Passwort bleibt dein jetziger Zugang samt Nutzer-ID und Rechten erhalten. Kommentieren geht weiterhin auch ohne Konto.</p>
      <label>E-Mail<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
      <label>Passwort<input name="password" type="password" autocomplete="new-password" required minlength="6"></label>
      <button type="submit" data-role="account-submit">Browserzugang sichern</button>
      <button type="button" data-action="reset-password">Passwort vergessen</button>
    </form>
    <div data-role="account-signed-in" hidden><button type="button" data-action="verify-email">Bestätigungsmail senden</button><button type="button" data-action="logout">Abmelden</button></div>
    <p data-role="account-message" role="status" aria-live="polite"></p>`;
  root.append(dialog);
  const find = role => dialog.querySelector(`[data-role="${role}"]`);
  const form = find('account-form');
  let busy = false;
  let previousFocus = null;
  function message(text, error = false) {
    find('account-message').textContent = text;
    find('account-message').classList.toggle('account-error', error);
  }
  function render() {
    if (busy) return;
    const access = service()?.getAccess();
    const ready = !!access?.authenticated;
    const registered = ready && !access.anonymous;
    find('account-status').textContent = !ready ? 'Die Online-Anmeldung wird verbunden. Der Almanach bleibt lesbar.' : registered ? 'Du bist mit deinem Konto angemeldet.' : 'Du nutzt einen anonymen Browserzugang.';
    find('account-identity').hidden = !ready;
    find('account-email').textContent = access?.email || '';
    find('account-uid').textContent = access?.uid || '';
    find('account-role').textContent = access?.canEditSharedContent ? 'Berechtigung: Redaktion' : 'Berechtigung: Spieler';
    form.hidden = registered;
    find('account-signed-in').hidden = !registered;
    dialog.querySelector('[data-action="verify-email"]').hidden = !!access?.emailVerified;
    root.querySelector('.account-open').textContent = registered ? 'Mein Konto' : 'Konto / Anmeldung';
    for (const control of form.elements) control.disabled = !ready;
  }
  async function run(operation, success) {
    if (busy) return;
    busy = true;
    message('Bitte warten …');
    for (const control of dialog.querySelectorAll('button, input')) control.disabled = true;
    try { await operation(); form.elements.password.value = ''; message(success); }
    catch (error) { form.elements.password.value = ''; message(accountErrorMessage(error), true); }
    finally {
      busy = false;
      for (const control of dialog.querySelectorAll('button, input')) control.disabled = false;
      render();
    }
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-account') { previousFocus = document.activeElement; message(''); render(); dialog.showModal(); }
    if (action === 'close-account') dialog.close();
    if (action === 'logout') run(() => service().logout(), 'Abgemeldet. Du kannst mit einem neuen Browserzugang weiter kommentieren.');
    if (action === 'verify-email') run(() => service().verifyEmail(), 'Die Bestätigungsmail wurde angefordert.');
    if (action === 'reset-password') {
      if (!form.elements.email.reportValidity()) return;
      run(() => service().resetPassword(form.elements.email.value), 'Falls zu dieser E-Mail ein Konto besteht, erhältst du eine Nachricht zum Zurücksetzen.');
    }
  });
  form.addEventListener('change', () => {
    const login = form.elements.mode.value === 'login';
    form.elements.password.autocomplete = login ? 'current-password' : 'new-password';
    find('account-submit').textContent = login ? 'Anmelden' : 'Browserzugang sichern';
    find('account-hint').textContent = login ? 'Du wechselst zum bestehenden Konto. Rechte des jetzigen Browserzugangs werden nicht automatisch übernommen. Sichere ihn zuerst, wenn du ihn behalten möchtest.' : 'Mit E-Mail und Passwort bleibt dein jetziger Zugang samt Nutzer-ID und Rechten erhalten. Kommentieren geht weiterhin auch ohne Konto.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const login = form.elements.mode.value === 'login';
    const account = service();
    run(() => account[login ? 'login' : 'secureBrowserAccess'](form.elements.email.value, form.elements.password.value), login ? 'Angemeldet.' : 'Dein Browserzugang ist jetzt mit deinem Konto gesichert.');
  });
  dialog.addEventListener('close', () => { form.elements.password.value = ''; previousFocus?.focus(); });
  window.addEventListener('aleria:auth-state-changed', render);
  window.addEventListener('fb-ready', render);
  render();
}
