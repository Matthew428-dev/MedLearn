//PSURF 2025 / MedLearn LMS / src / client / public / js
import { showAlert } from '../lib/alerts.js';
/* ========= EVENTS========= */
const form = document.getElementById('login-form');   // <form id="login-form"> … :contentReference[oaicite:4]{index=4}
const badLoginAlert  = document.getElementById('alert');  // <div id="login-alert" …>

let hideTimer; // timer for hiding the alert

form.addEventListener('submit', async e => {
  e.preventDefault();                            // stop the native POST

  const email = form.email.value.trim();
  const password = form.password.value;

  const result = await checkLogin(email, password);
  if (result.ok) {
    sessionStorage.setItem('successMsg','Success! You have been logged in.')
    window.location.href = '/secure/dashboard.html';
  } else {
    showAlert('error','Invalid email or password');
  }

});

/* <========= EXTRA FUNCTIONS ==========> */

// checks login credentials

async function checkLogin(email, password) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const body = await res.json();
  console.log('Login response:', body);
  return { ok: res.ok, status: res.status, body };
}
