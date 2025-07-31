//PSURF 2025 / MedLearn LMS / src / client / secure / js
//<=========EVENTS==========>

document.addEventListener('DOMContentLoaded', () => {
//TODO add code to make it say "welcome back, <firstname>"
  msg = sessionStorage.getItem('goodLoginMsg');
  if(msg){
    window.showAlert('success',sessionStorage.getItem('loginMsg'));
  }
});

//<==========EXTRA FUNCTIONS=========>