export const CADOGAN_CHARACTER_ID = 'person--haus-sgrechiwr--cadogan-sgrechiwr';
export const RHIANNON_CHARACTER_ID = 'person--haus-draenmelyn--rhiannon-draenmelyn';
export const GWEN_CHARACTER_ID = 'person--family-tree--unknown-cadogan-spouse';

export function patrickBiographyCharacterIds(gwenCharacterId = '') {
  if (gwenCharacterId && gwenCharacterId !== GWEN_CHARACTER_ID) {
    throw new Error('Gwens bestätigte Personen-ID darf nicht durch eine andere Identität ersetzt werden.');
  }
  return [CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID];
}
