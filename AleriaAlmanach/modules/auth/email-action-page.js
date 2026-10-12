import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, checkActionCode, applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { firebasePublicConfig } from './firebase-public-config.js';
import { createEmailActionController, emailActionErrorMessage } from './email-action-controller.js';

const auth = getAuth(initializeApp(firebasePublicConfig));
const controller = createEmailActionController({ auth, checkActionCode, applyActionCode, verifyPasswordResetCode, confirmPasswordReset });
const find = role => document.querySelector(`[data-role="${role}"]`);
const form = find('mail-form');
const parameters = new URLSearchParams(location.search);
let action = null;
let busy = false;

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !action) return;
  busy = true;
  find('mail-submit').disabled = true;
  find('mail-status').textContent = 'Ein klitzekleiner Bestätigungszauber …';
  try {
    await action.complete(form.elements.password.value);
    form.hidden = true;
    find('mail-title').textContent = 'Siegel sitzt. Zauber hält!';
    find('mail-status').textContent = action.mode === 'verifyEmail' ? 'Deine E-Mail ist bestätigt. Myrddin hat diesmal wirklich nichts in einen Frosch verwandelt. Dein Gildenpass wartet im Almanach auf dich.' : action.mode === 'resetPassword' ? 'Dein neues Passwort ist gespeichert. Melde dich damit im Almanach an.' : 'Die vorherige E-Mail-Adresse ist wiederhergestellt. Wenn du die Änderung nicht veranlasst hast, setze im Almanach zusätzlich dein Passwort zurück.';
    // The action code must not linger in copied URLs or the address bar.
    history.replaceState(null, '', location.pathname);
  } catch (error) { find('mail-status').textContent = emailActionErrorMessage(error); }
  finally { form.elements.password.value = ''; find('mail-submit').disabled = false; busy = false; }
});

try {
  action = await controller.prepare(parameters.get('mode'), parameters.get('oobCode'));
  const reset = action.mode === 'resetPassword';
  find('mail-title').textContent = reset ? 'Passwort vom Drachen gefressen?' : action.mode === 'recoverEmail' ? 'Den Postraben zurückrufen?' : 'Dein Gildenpass ist fast bereit!';
  find('mail-status').textContent = reset ? `Lege ein neues Passwort für ${action.email} fest. Myrddin schaut auch ganz bestimmt weg.` : `Bestätige ${action.email} mit einem Klick auf das Siegel. Dafür musst du hier nicht angemeldet sein.`;
  find('password-field').hidden = !reset;
  form.elements.password.required = reset;
  find('mail-submit').textContent = reset ? 'Neues Passwort versiegeln' : action.mode === 'recoverEmail' ? 'Vorherige E-Mail wiederherstellen' : 'E-Mail mit Myrddins Siegel bestätigen';
  form.hidden = false;
} catch (error) { find('mail-status').textContent = emailActionErrorMessage(error); }
