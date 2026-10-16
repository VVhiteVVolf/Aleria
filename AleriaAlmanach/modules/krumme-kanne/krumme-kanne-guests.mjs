import {expandGuestVacancies} from '../guest-register/guest-register-vacancies.mjs';

/** Add writing space without replacing any named guest or changing their IDs. */
export function expandKanneGuestRegister(page) {
  const register = page.guestRegister;
  register.subtitle = 'Aus Mairs Gästebuch';
  register.location = 'Die Krumme Kanne · Gwynthor';
  register.note = 'Mair verwahrt das Gästebuch neben der Kasse.';
  expandGuestVacancies(register,{prefix:'kanne',sectionCount:4});
}
