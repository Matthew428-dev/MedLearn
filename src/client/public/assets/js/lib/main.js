//PSURF 2025 / MedLearn LMS / src / client / public / js


// ON PAGE LOAD
fetch('/api/session').then(response => {
  if(response.ok){
    document.getElementById('signin-nav').textContent = 'Sign Out';
  }
  else{
    document.getElementById('signin-nav').textContent = 'Sign In';
  }
})

//<=========EVENTS==========>
document.addEventListener('DOMContentLoaded', () => {

  //show messages
  const successMsg = sessionStorage.getItem('successMsg');
  if(successMsg){
    showAlert('success',successMsg);
    sessionStorage.setItem('successMsg','');
  }

  const infoMsg = sessionStorage.getItem('infoMsg');
  if(infoMsg){
    showAlert('info',infoMsg);
    sessionStorage.setItem('infoMsg','');
  }

  const warnMsg = sessionStorage.getItem('warnMsg');
  if(warnMsg){
    showAlert('warn',warnMsg);
    sessionStorage.setItem('warnMsg','');
  }

  const errorMsg = sessionStorage.getItem('errorMsg');
  if(errorMsg){
    showAlert('error',errorMsg);
    sessionStorage.setItem('errorMsg','');
  }

  // highlight active navigation link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') !== '#' && link.pathname === currentPath) {
      link.classList.add('active');
    }
  });
  if (currentPath.startsWith('/secure/')) {
    const dash = document.getElementById('dashboard-nav');
    if (dash) dash.classList.add('active');
  }
  
});

const dashboardNav = document.getElementById('dashboard-nav');
dashboardNav.addEventListener('click', async (e) => {
  e.preventDefault();
  if (await authFetch()) {
    window.location.href = '/secure/dashboard.html';
  } else {
    sessionStorage.setItem('errorMsg', 'You must be logged in to access the dashboard');
    window.location.href = '/public/signin.html';
  }
});

const signInNav = document.getElementById('signin-nav');
signInNav.addEventListener('click', async (e) => {
  e.preventDefault();
  if (signInNav.textContent === 'Sign Out') {
    await signOut();
    window.location.href = '/public/index.html';
  } else {
    window.location.href = '/public/signin.html';
  }
});

const courseCards = document.querySelectorAll('.course-card-lg');
courseCards.forEach(card => {
  card.addEventListener('click', async (e) => {
    e.preventDefault();
    for(let i = 0; i < courseCards.length; i++){
    if (e.currentTarget !== courseCards[i]){
      continue;
    }
    if (await authFetch()) {
      //const courseId = e.currentTarget.dataset.courseId;
      //window.location.href = `/courses/${courseId}.html`; //have it take the user to the specific course later
      window.location.href = '/public/courses.html'; //for now, just take them to the courses page
    } else {
      sessionStorage.setItem('errorMsg', 'You must be logged in to access course content');
      window.location.href = '/public/signin.html';
    }
  }
  });
});

const allFeaturedCourseCards = document.querySelectorAll('.course-card');
allFeaturedCourseCards.forEach(card => {
  card.addEventListener('click', async (e) => {
    e.preventDefault();
    for(let i = 0; i < allFeaturedCourseCards.length; i++){
    if (e.currentTarget !== allFeaturedCourseCards[i]){
      continue;
    }
    if (await authFetch()) {
      //const courseId = e.currentTarget.dataset.courseId;
      //window.location.href = `/courses/${courseId}.html`; //have it take the user to the specific course later
      window.location.href = '/public/courses.html'; //for now, just take them to the courses page
    } 
    else {
      sessionStorage.setItem('errorMsg', 'You must be logged in to access course content');
      window.location.href = '/public/signin.html';
    }
  }
  });
});

//<==========EXTRA FUNCTIONS=========>
async function authFetch() {
    const response = await fetch('/api/session');
    if (response.ok) {
        return true; // User is authenticated
    } else {
        return false; // User is not authenticated
    }
}

async function signOut(){
    const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
    });
    if (response.ok) {
        sessionStorage.setItem('successMsg',"Success! You have been logged out.")
        window.location.href = '/public/index.html';
    } else {
        console.error('Logout failed');
    }
}



//just displays the alert
function showAlert(type = 'info', message = '', duration = 4000) {

  //Tailwind alert variants
  const alertVariants = {
    success: {
      bg: 'bg-green-100',
      fg: 'text-green-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8.25 10.922l-3.543-3.543a1 1 0 10-1.414 1.414l4.25 4.25a1 1 0 001.414 0l7.75-7.75z" clip-rule="evenodd"/>
        </svg>`
    },
    info: {
      bg: 'bg-blue-100',
      fg: 'text-blue-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9.75a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zM10 6.5a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
        </svg>`
    },
    warn: {
      bg: 'bg-yellow-100',
      fg: 'text-yellow-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099a1 1 0 013.486 0l6.514 11.591a1 1 0 01-.873 1.485H2.616a1 1 0 01-.873-1.485L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-5.75a.75.75 0 00-1.5 0v3.25a.75.75 0 001.5 0V7.25z" clip-rule="evenodd"/>
        </svg>`
    },
    error: {
      bg: 'bg-red-100',
      fg: 'text-red-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 7.53 6.47a.75.75 0 10-1.06 1.06L8.94 10l-2.47 2.47a.75.75 0 001.06 1.06L10 11.06l2.47 2.47a.75.75 0 001.06-1.06L11.06 10l2.47-2.47z" clip-rule="evenodd"/>
        </svg>`
    }
  };

  const box  = document.getElementById('app-alert');
  const icon = document.getElementById('alert-icon');
  const text = document.getElementById('alert-msg');

  // clear previous colour classes
  box.classList.remove(
    'bg-green-100','bg-blue-100','bg-yellow-100','bg-red-100',
    'text-green-800','text-blue-800','text-yellow-800','text-red-800'
  );

  // pick variant (fallback to info)
  const v = alertVariants[type] || alertVariants.info;
  box.classList.add(v.bg, v.fg);

  icon.innerHTML = v.icon;
  text.textContent = message;

  box.classList.remove('hidden');              // show box
  clearTimeout(box._hideTimer);
  box._hideTimer = setTimeout(() => box.classList.add('hidden'), duration);
}

window.showAlert = showAlert;  // make global
