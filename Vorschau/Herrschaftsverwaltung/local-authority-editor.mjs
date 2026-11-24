import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { GUILD_LEASE, localAuthorityChoices, localAuthorityTitle, localOfficeLabel } from '../../shared/cenyr-administration/local-authority.mjs';
import { MAX_TITLE_LENGTH } from './draft-office-titles.mjs';

export function bindLocalAuthorityEditor(dialog, { onApply, findTrigger }) {
  const form = dialog.querySelector('form');
  const { role, guild, title } = form.elements;
  const site = dialog.querySelector('[data-role="authority-site"]');
  const guildFields = dialog.querySelector('[data-role="authority-guild-fields"]');
  const error = dialog.querySelector('[data-role="authority-error"]');
  guild.maxLength = title.maxLength = MAX_TITLE_LENGTH;
  let key;

  function showGuildFields() {
    guildFields.disabled = guildFields.hidden = role.value !== GUILD_LEASE;
  }

  role.addEventListener('change', showGuildFields);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      onApply(key, role.value ? { role: role.value, guild: guild.value, title: title.value } : null);
      dialog.close();
    } catch (problem) {
      error.textContent = problem.message;
    }
  });
  form.querySelector('[data-action="cancel-authority"]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (key) findTrigger(key)?.focus({ preventScroll: true });
    key = undefined;
  });

  return {
    open({ key: postKey, authority, authorityChoice }) {
      key = postKey;
      site.textContent = `${authority.seat} · ${authority.type || 'Ortstyp offen'}`;
      role.innerHTML = `<option value="">${authority.sourceTitle ? 'Belegtes Amt' : 'Vorgabe'} · ${e(localAuthorityTitle(authority).title)}</option>`
        + localAuthorityChoices(authority).map(value => `<option value="${e(value)}">${e(localOfficeLabel(value))}</option>`).join('');
      role.value = authorityChoice?.role || '';
      guild.value = authorityChoice?.guild || '';
      title.value = authorityChoice?.title || '';
      error.textContent = '';
      showGuildFields();
      dialog.showModal();
      role.focus();
    },
  };
}
