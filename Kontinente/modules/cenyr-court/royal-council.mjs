// Shared by the kingdom and the royal county. Legacy rows remain export sources.
export const royalCouncil = Object.freeze({
  "id": "cenyr-royal",
  "title": "Königlicher Rat",
  "members": [
    {
      "office": "Marschall des Königs",
      "name": "Galahad Draig",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-draig/galahad-draig.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-draig&mode=view"
    },
    {
      "office": "Kämmerer des Königs",
      "name": "Mordred Grawn",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-grawn/mordred-grawn.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-grawn&mode=view"
    },
    {
      "office": "Justiziar des Königs",
      "name": "Gareth Aderyn",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-aderyn/gareth-aderyn.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-aderyn&mode=view"
    },
    {
      "office": "Schatten des Königs",
      "name": "Bedivere Wylan",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-pysgod/bedivere-wylan.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-wylan&mode=view"
    },
    {
      "office": "Herold des Königs",
      "name": "Owain Draig",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-draig/owain-draig.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-draig&mode=view"
    },
    {
      "office": "Ratsmagier des Königs",
      "name": "Myrddin (Draig)",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-draig/myrddin-draig.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-draig&mode=view"
    },
    {
      "office": "Patriarch des Königs",
      "name": "Yvain Neidr",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-neidr/yvain-neidr.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-neidr&mode=view"
    },
    {
      "office": "Barde des Königs",
      "name": "Merwin Illewod",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-illewod/merwin-illewod.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-illewod&mode=view"
    },
    {
      "office": "Ratskanzler des Königs",
      "name": "Griflet Pysgod",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-pysgod/griflet-1672-pysgod.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-pysgod&mode=view"
    },
    {
      "office": "Regent des Königs",
      "name": "Pelleas Pendrag",
      "imageSrc": "/Stammbäume/assets/images/portraits/haus-pendrag/pelleas-pendrag.jpg",
      "href": "/Stammbäume/Stammbaum.html?family=haus-pendrag&mode=view"
    }
  ]
});

export function resolveRoyalCouncil(table, groups) {
  if (table.dataset.councilSource !== royalCouncil.id) return groups;
  return groups.map(group => group.title === royalCouncil.title ? royalCouncil : group);
}
