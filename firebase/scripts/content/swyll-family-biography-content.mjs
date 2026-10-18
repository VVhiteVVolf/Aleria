// Only established family data and existing Almanach occupations. No invented
// education, personality, personal equipment or events fill the remaining gaps.
export const SWYLL_FAMILY_PROFILES = Object.freeze([
  {
    slug: 'iestyn-swyll', name: 'Iestyn Swyll', familyId: 'haus-swyll', birth: '1699',
    portrait: 'https://i.imgur.com/VpjeTe7.png', avatarCharacter: 'Iestyn Swyll',
    summary: 'Iestyn Swyll gehört zu einem bürgerlichen Geschlecht aus Gwynthor. Er wurde 1699 geboren und ist mit Rhiannon Draenmelyn verheiratet. Ihre drei Kinder sind Gareth, Meredith und Rhydwen Swyll.',
    paragraphs: [
      'Iestyn Swyll ist ein Angehöriger des bürgerlichen Hauses Swyll aus Gwynthor. Er wurde 1699 als Sohn von Emyr Swyll und Tegwen geboren und ist im Jahr 1740 einundvierzig Jahre alt. Die Familie Swyll stellt traditionell Knechte, Diener, Mägde und Burschen für den Haushalt des Hauses Draig.',
      'Seine Ehe mit Rhiannon Draenmelyn verbindet die Bürgerhäuser Swyll und Draenmelyn. Rhiannon stammt ebenfalls aus einer Familie, deren Angehörige seit Generationen im Draig-Haushalt dienen. Das genaue Jahr ihrer Eheschließung ist nicht überliefert.',
      'Das Paar hat drei gemeinsame Kinder: Gareth, geboren 1720, Meredith, geboren 1722, und Rhydwen, geboren 1725. Meredith arbeitet als persönliche Zofe von Prinzessin Rhiannon. Gareth ist unverheiratet und nicht verlobt.',
      'Iestyn hat acht Geschwister: Eirwen, Bronwen, Carys, Owain, Cadfan, Rhodri, Llio und Nerys. Sein Bruder Cadfan fiel 1719 im Krieg. Eirwens Ehe mit Meilyr Pendrwn und Bronwens Ehe mit Iorwerth Maerllys verbinden weitere Bürgerhäuser mit der Swyll-Linie.'
    ],
    role: 'Angehöriger des bürgerlichen Hauses Swyll',
    open: 'Iestyns eigene Tätigkeit, Ausbildung und persönliche Lebensereignisse sind über die familiären Angaben hinaus noch nicht ausgearbeitet.'
  },
  {
    slug: 'rhiannon-draenmelyn', name: 'Rhiannon Draenmelyn', familyId: 'haus-draenmelyn', birth: '1702',
    portrait: 'https://i.imgur.com/cyJqlDG.png', avatarCharacter: 'Rhiannon Draenmelyn',
    summary: 'Rhiannon Draenmelyn ist eine Bedienstete des Hauses Draig aus Gwynthor. Die 1702 geborene Tochter von Ifor Draenmelyn und Nest ist mit Iestyn Swyll verheiratet und Mutter von Gareth, Meredith und Rhydwen Swyll.',
    paragraphs: [
      'Rhiannon Draenmelyn wurde 1702 als Tochter von Ifor Draenmelyn und Nest geboren. Im Jahr 1740 ist sie achtunddreißig Jahre alt. Sie entstammt einem bürgerlichen Geschlecht aus Gwynthor, das seit Generationen als Diener- und Bedienstetenfamilie im Haushalt des Hauses Draig steht. Auch Rhiannon dient dem Haus Draig als Bedienstete.',
      'Durch ihre Ehe mit Iestyn Swyll ist sie mit dem Bürgerhaus Swyll verbunden. Die gemeinsame Linie des Paares wird im Haus Swyll fortgeführt.',
      'Ihre Kinder sind Gareth Swyll, geboren 1720, Meredith Swyll, geboren 1722, und Rhydwen Swyll, geboren 1725. Meredith ist die persönliche Zofe von Prinzessin Rhiannon; diese Namensvetterin ist von ihrer Mutter Rhiannon Draenmelyn zu unterscheiden.',
      'Afan, Meurig und Caradog Draenmelyn sind ihre Brüder. Über Afan ist sie die Tante von Sioned, Taliesin und Gethin; über Meurig ist sie die Tante von Owain, Myfanwy und Eleri Draenmelyn.'
    ],
    role: 'Bedienstete des Hauses Draig',
    open: 'Rhiannons genaues Aufgabenfeld im Haushalt, ihre Ausbildung und weitere persönliche Lebensereignisse sind bisher nicht festgelegt.'
  },
  {
    slug: 'gareth-swyll', name: 'Gareth Swyll', familyId: 'haus-swyll', birth: '1720',
    portrait: 'https://i.imgur.com/DpqoWhn.png', avatarCharacter: 'Gareth Swyll',
    summary: 'Gareth Swyll wurde 1720 als ältestes Kind von Iestyn Swyll und Rhiannon Draenmelyn geboren. Der zwanzigjährige Angehörige des Bürgerhauses Swyll ist der ältere Bruder von Meredith und Rhydwen. Er ist unverheiratet und nicht verlobt.',
    paragraphs: [
      'Gareth Swyll ist das älteste der drei gemeinsamen Kinder von Iestyn Swyll und Rhiannon Draenmelyn. Er wurde 1720 geboren und ist im Jahr 1740 zwanzig Jahre alt. Er gehört zum bürgerlichen Haus Swyll aus Gwynthor.',
      'Seine jüngeren Schwestern sind Meredith, geboren 1722, und Rhydwen, geboren 1725. Meredith dient als persönliche Zofe von Prinzessin Rhiannon. Über ihre Mutter sind die drei Geschwister zugleich mit der Bedienstetenfamilie Draenmelyn verbunden.',
      'Gareth ist unverheiratet und ohne Verlobung. Seine weitere Lebenslinie bleibt offen.'
    ],
    role: 'Ältestes Kind von Iestyn und Rhiannon',
    open: 'Ein eigener Beruf, eine Ausbildung und persönliche Charakterzüge sind für Gareth noch nicht belegt.'
  },
  {
    slug: 'meredith-swyll', name: 'Meredith Swyll', familyId: 'haus-swyll', birth: '1722',
    portrait: 'https://i.imgur.com/8lLkOwQ.png',
    summary: 'Meredith Swyll ist die persönliche Zofe von Prinzessin Rhiannon. Sie wurde 1722 als Tochter von Iestyn Swyll und Rhiannon Draenmelyn geboren und ist das mittlere Kind zwischen Gareth und Rhydwen.',
    paragraphs: [
      'Meredith Swyll wurde 1722 als Tochter von Iestyn Swyll und Rhiannon Draenmelyn geboren. Im Jahr 1740 ist sie achtzehn Jahre alt. Zwischen ihrem älteren Bruder Gareth und ihrer jüngeren Schwester Rhydwen ist sie das mittlere der drei Kinder.',
      'Sie arbeitet als persönliche Zofe von Prinzessin Rhiannon. Ihre Tätigkeit entspricht der überlieferten Diensttradition des Bürgerhauses Swyll, das dem Haus Draig Knechte, Diener, Mägde und Burschen stellt. Auch die mütterliche Familie Draenmelyn gehört zu den Bedienstetengeschlechtern des Draig-Haushalts.',
      'Ihre Mutter Rhiannon Draenmelyn stammt aus einer weiteren Bedienstetenfamilie Gwynthors. Merediths familiäre Bindungen verbinden damit die Bürgerhäuser Swyll und Draenmelyn.'
    ],
    role: 'Persönliche Zofe von Prinzessin Rhiannon',
    open: 'Weitere Ausbildungsstationen und persönliche Lebensereignisse sind bisher nicht ausgearbeitet.'
  },
  {
    slug: 'rhydwen-swyll', name: 'Rhydwen Swyll', familyId: 'haus-swyll', birth: '1725',
    portrait: 'https://i.imgur.com/NR8HKxj.png',
    summary: 'Rhydwen Swyll wurde 1725 als jüngstes Kind von Iestyn Swyll und Rhiannon Draenmelyn geboren. Sie ist fünfzehn Jahre alt und die jüngere Schwester von Gareth und Meredith Swyll.',
    paragraphs: [
      'Rhydwen Swyll ist die jüngste Tochter von Iestyn Swyll und Rhiannon Draenmelyn. Sie wurde 1725 geboren und ist im Jahr 1740 fünfzehn Jahre alt. Ihr älterer Bruder Gareth ist zwanzig, ihre Schwester Meredith achtzehn Jahre alt.',
      'Sie gehört zum Bürgerhaus Swyll aus Gwynthor. Über ihre Mutter ist sie mit dem Haus Draenmelyn verbunden. Beide Familien stehen in der überlieferten Diensttradition des Hauses Draig; daraus ergibt sich jedoch noch keine persönliche Anstellung für Rhydwen.',
      'Meredith ist die persönliche Zofe von Prinzessin Rhiannon. Rhydwens eigener weiterer Lebensweg ist bisher nicht näher beschrieben.'
    ],
    role: 'Jüngstes Kind von Iestyn und Rhiannon',
    open: 'Beruf, Ausbildung und weitere persönliche Lebensdaten sind bislang nicht festgelegt.'
  }
]);
