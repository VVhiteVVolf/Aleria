import { ACCOUNT_ART, accountAvatar, accountAvatarId } from './account-avatar-catalog.js';

export function renderAccountAccess(root, dialog, access, readyToEdit = true) {
  const find = role => dialog.querySelector(`[data-role="${role}"]`);
  const ready = !!access?.authenticated;
  const registered = ready && !access.anonymous;
  find('account-status').textContent = !ready ? 'Myrddin sucht noch die Verbindung. Der Almanach bleibt lesbar.' : registered ? `Willkommen am Lagerfeuer${access.displayName ? `, ${access.displayName}` : ''}!` : 'Du bist schon mit einem Browserzugang unterwegs. Sichere ihn mit deinem eigenen Gildenpass.';
  find('account-identity').hidden = !registered;
  find('account-email').textContent = access?.email || '';
  find('account-uid').textContent = access?.uid || '';
  find('account-role').textContent = access?.canEditSharedContent ? 'Deine Berechtigung: Redaktion' : 'Deine Berechtigung: Spieler';
  find('account-form').hidden = registered;
  find('account-profile-form').hidden = !registered;
  find('account-signed-in').hidden = !registered;
  find('verification-status').textContent = access?.emailVerified ? 'Deine E-Mail ist bestätigt. Myrddins Siegel hält!' : 'Deine E-Mail ist noch nicht bestätigt. Spielen und Kommentieren bleiben möglich.';
  dialog.querySelector('[data-action="verify-email"]').hidden = !!access?.emailVerified;
  dialog.querySelector('[data-action="refresh-account"]').hidden = !!access?.emailVerified;
  root.querySelector('[data-role="account-button-title"]').textContent = registered ? (access.displayName || 'Mein Gildenpass') : 'Abenteurer-Konto';
  root.querySelector('[data-role="account-button-subtitle"]').textContent = registered ? 'Dein Platz am Lagerfeuer' : 'Anmelden · Registrieren';
  const avatar = registered && accountAvatar(accountAvatarId(access.photoURL));
  const buttonImage = root.querySelector('[data-role="account-button-avatar"]');
  buttonImage.src = avatar?.src || ACCOUNT_ART.key;
  buttonImage.classList.toggle('account-mini-avatar', !!avatar);
  for (const control of dialog.querySelectorAll('input, button')) control.disabled = !readyToEdit || (!ready && !control.matches('[data-action="close-account"]'));
}

export function renderAccountMode(form, dialog) {
  const login = form.elements.mode.value === 'login';
  form.elements.password.autocomplete = login ? 'current-password' : 'new-password';
  dialog.querySelector('[data-role="registration-profile"]').hidden = login;
  dialog.querySelector('[data-role="verification-choice"]').hidden = login;
  for (const input of dialog.querySelectorAll('[data-role="registration-profile"] input')) input.disabled = login;
  dialog.querySelector('[data-role="account-submit"]').textContent = login ? 'Zurück ans Lagerfeuer' : 'Gildenpass anlegen';
  dialog.querySelector('[data-role="account-hint"]').textContent = login ? 'Du wechselst zu einem bestehenden Konto. Sichere deinen bisherigen Browserzugang zuerst, wenn du seine Nutzer-ID und Rechte behalten möchtest. Konten werden nicht automatisch zusammengeführt.' : 'E-Mail und Passwort sichern deinen bisherigen Browserzugang. Deine Nutzer-ID und vorhandenen Rechte bleiben erhalten.';
}
