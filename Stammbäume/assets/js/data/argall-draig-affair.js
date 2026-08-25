export const ARGALL_DRAIG_AFFAIR = Object.freeze({
  id: 'affair-owain-shylene',
  participantIds: Object.freeze(['owain-draig', 'shylene-argall']),
  owain: Object.freeze({
    id: 'owain-draig',
    worldPersonId: 'person--haus-draig--owain-draig',
    name: 'Owain Draig',
    sex: 'male',
    birth: '1694',
    houseId: 'house-draig'
  }),
  shylene: Object.freeze({
    id: 'shylene-argall',
    worldPersonId: 'person--haus-argall--shylene-argall',
    name: 'Shylene Argall',
    sex: 'female',
    birth: '1710',
    houseId: 'house-argall'
  }),
  child: Object.freeze({
    // Die bestehende Weltidentität bleibt trotz des sichtbaren Familiennamens Argall
    // migrationsstabil; beide Gegenakten verwenden deshalb weiterhin dieselbe interne ID.
    id: 'iolo-draig',
    worldPersonId: 'person--haus-draig--iolo-draig',
    name: 'Iolo Argall',
    sex: 'male',
    birth: '1735',
    houseId: 'house-argall'
  })
});
