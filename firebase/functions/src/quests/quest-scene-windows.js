// Freeze the relevant slice of each scene. An archived quest must not absorb
// the next group's later adventure in that same room or on that same road.
export async function readQuestSceneWindows(database, transaction, sceneIds, previous = {}, { finish = false } = {}) {
  const windows = { ...previous };
  await Promise.all(sceneIds.map(async entryId => {
    if (windows[entryId] && !finish) return;
    const latest = await transaction.get(database.collection('comments').where('entryId', '==', entryId).orderBy('orderKey', 'desc').limit(1));
    const cursor = Number(latest.docs[0]?.data().orderKey || 0);
    windows[entryId] = finish ? { after: previous[entryId]?.after || 0, through: cursor } : { after: cursor, through: null };
  }));
  return Object.fromEntries(sceneIds.map(id => [id, windows[id]]));
}
