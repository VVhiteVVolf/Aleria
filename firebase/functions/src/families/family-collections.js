export const FAMILY_COLLECTIONS = Object.freeze([
  'persons',
  'partnerships',
  'parentages',
  'houses',
  'cadetBranches',
  'timeJumps'
]);

export async function loadFamilyWorkspace(workspaceReference) {
  const [workspace, ...snapshots] = await Promise.all([
    workspaceReference.get(),
    ...FAMILY_COLLECTIONS.map(name => workspaceReference.collection(name).get())
  ]);
  if (!workspace.exists) return null;
  return {
    root: workspace.data(),
    collections: Object.fromEntries(FAMILY_COLLECTIONS.map((name, index) => [
      name,
      snapshots[index].docs.map(item => item.data())
    ]))
  };
}
