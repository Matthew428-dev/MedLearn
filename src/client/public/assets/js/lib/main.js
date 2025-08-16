//PSURF 2025 / MedLearn LMS / src / client / public / js
import {showAlert} from "./alerts.js";
//<=========EVENTS==========>
const adminNav = document.getElementById('admin-nav');
const dashboardNav = document.getElementById('dashboard-nav');

document.addEventListener('DOMContentLoaded', async () => {
  
  //checks if the user is logged in
  const user = await authFetch();
  if(user){
    document.getElementById('signin-nav').textContent = 'Sign Out';
    //later incorporate a profile picture and icon instead of just "sign out"

    if (user.role === 'Admin') {
      adminNav.style.display = 'block';
    } else {
      adminNav.style.display = 'none';
    }
  }
  else{
    document.getElementById('signin-nav').textContent = 'Sign In';
  }
  

  //show messages, if any are sent
  const successMsg = sessionStorage.getItem('successMsg');
  if(successMsg){
    showAlert('success',successMsg);
    sessionStorage.setItem('successMsg',''); //resets the message
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

  //this has to be modified if more nav-links are added
  if (currentPath.startsWith('/secure/admin')) {
    adminNav?.classList.add('active');
  } 
  else if (currentPath.startsWith('/secure/')) {
    dashboardNav?.classList.add('active');
  }
});

//defined near the top of the file
dashboardNav.addEventListener('click', async (e) => {
  e.preventDefault();
  if (await authFetch()) {
    window.location.href = '/secure/dashboard.html';
  } else {
    sessionStorage.setItem('errorMsg', 'You must be logged in to access the dashboard');
    window.location.href = '/public/signin.html';
  }
});

//adminNav defined near the top of this file
adminNav.addEventListener('click', async (e) => {
  e.preventDefault();
  const user = await authFetch();
  if(user.role === 'Admin'){
    window.location.href = "/secure/admin/admin.html";
  }
  else{
    sessionStorage.setItem('errorMsg',"You must be an admin to access this page");
    window.location.reload();
  }
})

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
  if (!response.ok){ 
    return null; //user is not logged in
  }
  return await response.json(); // returns { userId, email, companyId, role, ... } (all the information sent by the endpoint)
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