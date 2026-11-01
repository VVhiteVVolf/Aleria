# Historical family checks, 1 November 2026

No family, person, map or gameplay source was changed in this audit.

The first failure was the Penrudd approval hash: the historical projection already removes location fields and general source metadata, but retained the new field-specific location revision metadata. Removing only `registryManagedHouseProfileFieldRevisions: {seat:7,folderPath:7}` from a clone makes the complete normalized Penrudd record match the existing approved hash `1beec2ef9fcc835f4e410a3c74ff1ea9ac7a0777a657e5db8301b22d6a9f2b2d` exactly. The review now validates this exact metadata object before projecting it back. The approved hash and the older full-family snapshot are unchanged.

The remaining aggregate mismatch was separately audited against Git HEAD `fc325cbc21cdff4b5eaf526d04c233e184cb3c7d`. The diagnostic loader reads committed versions of modified modules and their dependencies in memory; it does not perform a checkout or write source files. The committed historical projection contains 538 records and hashes to the original `9b8b850e3068dcfb54ea6f2e90e9aa96bc9c3ae3dadc79139256d6f590bfd98a`.

The only remaining record difference was Gawain in Haus Draig: title, public summary, public biography module and its field-specific source revision metadata. No identity, portrait, date, relative or other record differed. His former normalized metadata was `title:''`, `notes:''`, `extensions:{registryManagedSourceRevision:11,registryManagedFieldRevisions:{}}`. The exact approved new metadata hash is `6994f9355dacd689fbedf1a28e6524f11b08c8f4e23197f43899f58ee95e35ae`. A feature-specific person review uses the existing biography review mechanism to validate this metadata before restoring only those three fields for the historical comparison.

After both narrow reviews, all 538 projected records compare structurally unchanged to the committed historical projection. The original aggregate checksum remains unchanged. `historical-family-current-diff.json` records equal hashes and `changed:[]`; `historical-family-head.json` retains the comparison input.

Validation:

- Targeted original suites and new regression suite: 35/35, `territory-family-review-tests.log`.
- Entire `Kontinente/tests/*.test.mjs`: 218/218, `territory-all-tests.log`.
- New negative cases reject changed location revisions, unrelated managed profile fields, person notes, portraits, parentage and partnerships; Gawain metadata edits still require their exact review.

The preexisting emblem follow-up review and all its hashes remain unchanged. No blanket checksum replacement, family publisher or database synchronization was used.
