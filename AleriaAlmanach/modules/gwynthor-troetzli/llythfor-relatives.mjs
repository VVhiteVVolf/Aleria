// The small household around Cynddelw. Unknown birth families stay unspecified.
const relative = (id, name, sex, birth, role, bio, spouse = false) => Object.freeze({
  id, worldPersonId: `person--haus-llythfor--${id}`, name, sex, birth,
  age: 1740 - Number(birth), role, bio, spouse,
});

export const LLYTHFOR_RELATIVES = Object.freeze({
  gwyddno: relative('gwyddno-llythfor', 'Gwyddno Llythfor', 'male', '1670',
    'Schuhflicker im Ruhestand · Cynddelws Vater',
    'Siebzigjähriger Gwynthorer Schuhflicker. Verdiente den Lebensunterhalt mit dem Flicken von Sohlen und dem Ausbessern abgetragener Schuhe. Überlässt die schwere Arbeit inzwischen seinem ältesten Sohn Edern und hilft gelegentlich noch an der Werkbank. Vater Ederns, Cynddelws und Lliwens. Seine kleine Werkstatt ernährt die Familie seit vielen Jahren bescheiden.'),
  gwenddydd: relative('gwenddydd-spouse-llythfor', 'Gwenddydd', 'female', '1672',
    'Cynddelws Mutter · früher Wäscherin',
    'Achtundsechzig Jahre. Gwyddnos Frau und Mutter Ederns, Cynddelws und Lliwens. Trug lange mit Wasch- und Flickarbeiten zum Haushalt bei und hat die schweren Waschtage inzwischen aufgegeben. Hält den kleinen Familienhaushalt zusammen, kennt die Nachbarschaft und freut sich über Besuche der Enkel.', true),
  edern: relative('edern-llythfor', 'Edern Llythfor', 'male', '1695',
    'Schuhflicker · Cynddelws älterer Bruder',
    'Fünfundvierzig Jahre. Ältester Sohn Gwyddnos und Gwenddydds. Führt die kleine Schuhflickerwerkstatt seines Vaters weiter. Lebt mit Efrddyl und ihrem Sohn Gwrhyr in Gwynthor. Ein ruhiger Handwerker mit einer überschaubaren, überwiegend langjährigen Kundschaft.'),
  efrddyl: relative('efrddyl-spouse-llythfor', 'Efrddyl', 'female', '1697',
    'Wäscherin · Ederns Frau',
    'Dreiundvierzig Jahre. Ederns Frau und Gwrhyrs Mutter. Arbeitet als Wäscherin für einige benachbarte Haushalte. Ihr Verdienst trägt ebenso zum Familienunterhalt bei wie Ederns Werkstatt. Hat einen eigenen kleinen Kreis von Auftraggebern und achtet auf eine faire Bezahlung ihrer Arbeit.', true),
  lliwen: relative('lliwen-llythfor', 'Lliwen Llythfor', 'female', '1703',
    'Näherin · Cynddelws jüngere Schwester',
    'Siebenunddreißig Jahre. Jüngste Tochter Gwyddnos und Gwenddydds, unverheiratet und kinderlos. Verdient mit dem Ändern und Flicken einfacher Kleidung ihren eigenen Lebensunterhalt. Lebt im Haushalt ihrer Eltern und hilft ihnen im Alltag.'),
  gwrhyr: relative('gwrhyr-llythfor', 'Gwrhyr Llythfor', 'male', '1722',
    'Lernt das Schuhflicken · Cynddelws Neffe',
    'Achtzehnjähriger Sohn Ederns und Efrddyls. Lernt das Handwerk bei seinem Vater, schneidet Leder zu und übernimmt kleinere Reparaturen. Unverheiratet und kinderlos. Seine jüngere Cousine Eirlys schaut ihm bei Besuchen gerne an der Werkbank über die Schulter.'),
});

export const LLYTHFOR_PARENTS_MARRIAGE_ID = 'marriage-gwyddno-gwenddydd-llythfor';
export const LLYTHFOR_BROTHER_MARRIAGE_ID = 'marriage-edern-efrddyl-llythfor';
