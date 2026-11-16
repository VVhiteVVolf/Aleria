// Editorial saves can be the first online write for a published local figure.
// Read and create atomically so another tab's record and ownership survive.
export async function saveCharacterContent({ db, reference, getDoc, setDoc, runTransaction, data, source = {}, userId }) {
  const existing = await getDoc(reference);
  if (existing.exists()) {
    await setDoc(reference, data, { merge: true });
    return data;
  }
  return runTransaction(db, async transaction => {
    const current = await transaction.get(reference);
    const payload = current.exists() ? data : {
      name: source.name || '',
      ...(source.identity ? { identity: source.identity } : {}),
      ...(source.genealogy ? { genealogy: source.genealogy } : {}),
      ...data,
      ownerUid: userId,
      createdBy: userId
    };
    transaction.set(reference, payload, { merge: true });
    return payload;
  });
}
