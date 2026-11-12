// Fixed presentation contract for an incidental speaker inside another actor's post.
// No character register, identity lookup or arbitrary image URLs belong to this type.
(function registerCommentForeignVoice(root) {
  const kind = 'foreignvoice';
  const nameMaxLength = 80;
  const avatars = Object.freeze([
    { id: 'boy', label: 'Junge' },
    { id: 'boy-2', label: 'Junge 2' },
    { id: 'boy-3', label: 'Junge 3' },
    { id: 'girl', label: 'Mädchen' },
    { id: 'girl-2', label: 'Mädchen 2' },
    { id: 'girl-3', label: 'Mädchen 3' },
    { id: 'woman', label: 'Frau' },
    { id: 'woman-2', label: 'Frau 2' },
    { id: 'woman-3', label: 'Frau 3' },
    { id: 'man', label: 'Mann' },
    { id: 'man-2', label: 'Mann 2' },
    { id: 'man-3', label: 'Mann 3' },
    { id: 'elderly-woman', label: 'Alte Frau' },
    { id: 'elderly-citizen', label: 'Alter Bürger' },
    { id: 'courtesan', label: 'Dirne' },
    { id: 'servant', label: 'Diener' },
    { id: 'city-guard', label: 'Stadtwache' },
    { id: 'knight', label: 'Ritter' },
    { id: 'mercenary', label: 'Söldner' },
    { id: 'robber', label: 'Räuber' },
    { id: 'knight-2', label: 'Ritter Variante' },
    { id: 'mercenary-2', label: 'Söldner Variante' },
    { id: 'person', label: 'Person' }
  ].map(avatar => Object.freeze({
    ...avatar, portrait: `./public/assets/comment-foreign-voice/${avatar.id}.png`
  })));

  function normalize(value = {}) {
    if (!value || typeof value !== 'object') value = {};
    return {
      foreignVoiceName: typeof value.foreignVoiceName === 'string'
        ? value.foreignVoiceName.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, nameMaxLength)
        : '',
      foreignVoiceAvatarId: avatars.some(avatar => avatar.id === value.foreignVoiceAvatarId)
        ? value.foreignVoiceAvatarId : 'person'
    };
  }

  function getPresentation(value = {}) {
    const normalized = normalize(value);
    return {
      ...normalized,
      charName: normalized.foreignVoiceName || 'Fremde/r',
      charTitle: '',
      portrait: avatars.find(avatar => avatar.id === normalized.foreignVoiceAvatarId).portrait,
      characterId: '',
      avatarKind: kind,
      emoteIndex: null,
      imageSetId: ''
    };
  }

  const api = Object.freeze({ kind, nameMaxLength, avatars, normalize, getPresentation });
  root.AleriaCommentForeignVoice = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
