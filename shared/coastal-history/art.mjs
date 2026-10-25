export function coastalArt(id) {
  const version = ['schwarzbucht-marodeure', 'flutbeisser'].includes(id) ? 2 : 1;
  return `Ereignisse/assets/coastal-history/${id}-v${version}.webp`;
}
