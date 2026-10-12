import { ACCOUNT_ART, ACCOUNT_AVATARS } from './account-avatar-catalog.js';

export function accountButtonMarkup() {
  return `<button type="button" data-action="open-account" class="account-open"><img data-role="account-button-avatar" src="${ACCOUNT_ART.key}" alt="" width="48" height="48"><span><strong data-role="account-button-title">Abenteurer-Konto</strong><small data-role="account-button-subtitle">Anmelden · Registrieren</small></span></button>`;
}

export function accountDialogMarkup() {
  return `
    <button type="button" data-action="close-account" class="account-close" aria-label="Schließen">×</button>
    <div class="account-hero">
      <div><p class="account-eyebrow">Die etwas chaotische Abenteurergilde</p><h2 id="account-title">Ein Platz<br>am Lagerfeuer.</h2><p>Dein Name. Dein Grinsen. Dein Zugang zu Aleria.</p><span class="account-seal">Kein Charismawurf nötig</span></div>
      <img class="account-myrddin" src="${ACCOUNT_ART.myrddin}" alt="Ein grinsender Myrddin Draig präsentiert einen magischen Brief" width="240" height="240" loading="lazy">
    </div>
    <div class="account-content">
      <p data-role="account-status" class="account-status"></p>
      <div data-role="account-identity" class="account-identity" hidden><p data-role="account-email"></p><p data-role="account-role"></p><details><summary>Mein Zugang</summary><p>Nutzer-ID: <code data-role="account-uid"></code></p><p>Deine Rechte gehören zur Nutzer-ID, nicht zum gewählten Namen oder Avatar.</p></details></div>
      <form data-role="account-form">
        <fieldset data-role="account-modes" class="account-modes"><legend class="account-sr-only">Zugang wählen</legend><label><input type="radio" name="mode" value="secure" checked><span>Neu in der Gilde?<small>Registrieren</small></span></label><label><input type="radio" name="mode" value="login"><span>Schon einen Gildenpass?<small>Anmelden</small></span></label></fieldset>
        <p data-role="account-hint" class="account-hint"></p>
        <label class="account-field">E-Mail<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="dein.name@postrabe.de"></label>
        <label class="account-field">Passwort<input name="password" type="password" autocomplete="new-password" required minlength="6" placeholder="Mindestens 6 Zeichen"></label>
        <div data-role="registration-profile"></div>
        <p class="account-remember">Dein Gildenpass bleibt auf diesem Gerät angemeldet – bis du dich abmeldest oder Browserdaten löschst.</p>
        <label data-role="verification-choice" class="account-check"><input name="sendVerification" type="checkbox" checked> Myrddin darf mir eine Bestätigungsmail schicken.</label>
        <button type="submit" data-role="account-submit" class="account-primary">Gildenpass anlegen</button>
        <button type="button" data-action="reset-password" class="account-link">Passwort vom Drachen gefressen?</button>
      </form>
      <form data-role="account-profile-form" hidden><div data-role="saved-profile"></div><button type="submit" class="account-primary">Gildenpass aktualisieren</button></form>
      <div data-role="account-signed-in" class="account-signed-in" hidden><p data-role="verification-status"></p><div class="account-secondary-actions"><button type="button" data-action="verify-email">Myrddins Bestätigungsmail anfordern</button><button type="button" data-action="refresh-account">Bestätigung prüfen</button><button type="button" data-action="logout">Abmelden</button></div></div>
      <p data-role="account-message" class="account-message" role="status" aria-live="polite"></p>
      <p class="account-footnote">Auch ohne Gildenpass kannst du weiter kommentieren und spielen. Dein Kontoavatar ist keine Spielfigur.</p>
    </div>`;
}

export function accountProfileMarkup(prefix) {
  return `<label class="account-field">Dein Abenteurername <small>(frei wählbar, optional)</small><input name="displayName" type="text" autocomplete="nickname" maxlength="40" placeholder="Wie sollen wir dich nennen?"></label>
    <fieldset class="account-avatar-picker"><legend>Wähle dein Gildengesicht <small>Nur der Avatar. Keine Charakterübernahme.</small></legend><div class="account-avatar-grid">${ACCOUNT_AVATARS.map((avatar, index) => `<label class="account-avatar-option" title="${avatar.caption}"><input type="radio" name="${prefix}Avatar" value="${avatar.id}" ${index === 0 ? 'checked' : ''}><span><img src="${avatar.src}" alt="" width="104" height="104" loading="lazy"><strong>${avatar.name}</strong><small>${avatar.caption}</small></span></label>`).join('')}</div></fieldset>`;
}
