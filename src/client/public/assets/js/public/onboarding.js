import { setSubmitBusy, onSubmit, checkSubmit } from '../lib/form-ui.js';
import { showAlert } from '../lib/alerts.js';
import {bindFirstNameHandlers,bindLastNameHandlers, bindPasswordHandler, bindProfilePictureHandler} from '../lib/input-handlers.js';
//<========EVENTS========>

//LOCKED INPUTS -> PULL INFO FROM DB
const companyNameInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const emailInput = document.getElementById("email");
const npiInput = document.getElementById("npi");

//PRE-FILLED BUT NOT LOCKED -> PULL FROM DB THEN REVERIFY
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");

//NOT PRE-FILLED, NOT LOCKED -> JUST VALIDATE AND SEND TO DB
const profilePictureInput = document.getElementById("profile-picture");
const createPasswordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

//the whole submission form
const form = document.querySelector('.welcome-card');

//the yellow submit btn at the bottom of the form
const submitBtn = document.querySelector('.btn-primary');

//checks if the submit button can now be enabled
const refresh = checkSubmit(submitBtn, () => form.checkValidity());

//defined at the top of the file so that both the domcontentloaded listener can use it
//as well as the form submit function call
let token = null;
let data = null;

document.addEventListener('DOMContentLoaded', async e => {
    
    token = new URLSearchParams(location.search).get('token');
    if (!token) {
        //if the token doesn't exist, send the user back to the home page
        sessionStorage.setItem("errorMsg","This page is for first-time users only");
        location.replace('/public/index.html');
        return; 
    }

    //create a new url object, then delete everything after the ?
    //also deletes the ? since token is the only query parameter
    const clean = new URL(location.href); 
    clean.searchParams.delete('token');

    //use history.replaceState instead of location.replace so that the page doesn't reload
    history.replaceState({}, '', clean);

    try {
        const res = await fetch(`/api/public/onboarding.html?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
            let msg = res.statusText;
            try { const body = await res.json(); msg = body.message || msg; } catch {}
            sessionStorage.setItem('errorMsg', msg);
            location.replace('/public/index.html');
            return;
        }

        //turn the result into json so it can be used by the rest of the program
        data = await res.json();
        
    } catch {
        showAlert("errorMsg","Network error. Try again. If this problem persists contact support");
    }

    //prefil the input boxes with the data from the db
    //if statement safeguards to make sure everything exists
    //locked inputs
    if(data.companyName && companyNameInput){
        companyNameInput.value = data.companyName;
    }
    if(data.role && roleInput){
        roleInput.value = data.role;
    }
    if(data.email && emailInput){
        emailInput.value = data.email;
    }
    if(data.npi && npiInput){
        npiInput.value = data.npi;
    }

    //unlocked inputs (but pre-filled)
    if(data.firstName && firstNameInput){
        firstNameInput.value = data.firstName;
    }
    if(data.lastName && lastNameInput){
        lastNameInput.value = data.lastName;
    }

});

//bind the corresponding event listeners, no need to bind 
//companyName and email because these input boxes are read-only
bindFirstNameHandlers(firstNameInput, refresh);
bindLastNameHandlers(lastNameInput, refresh);
bindPasswordHandler(createPasswordInput,confirmPasswordInput,refresh);
bindProfilePictureHandler(profilePictureInput, refresh);

//submit btn defined near top of file
if(form){
    onSubmit(form, async fd => {

        if (!data || !token) {
            showAlert('errorMsg', 'Still loading invite info. Please try again.');
            return;
        }

        //disable submitbtn temporarily
        setSubmitBusy(submitBtn, true);

        //get unlocked form values and normalize
        const firstName = (fd.get('firstName').charAt(0).toUpperCase() + fd.get('firstName').slice(1).toLowerCase()).trim();
        const lastName = (fd.get('lastName').charAt(0).toUpperCase() + fd.get('lastName').slice(1).toLowerCase()).trim();
        const password = (fd.get('password'));

        //build the payload to send to the endpoint
        const payload = {
            //locked values -> pull from the db 
            email: data.email,
            companyName: data.companyName,
            npi: data.npi,

            //hidden value
            token: token,

            //unlocked values -> pull from user input
            firstName: firstName,
            lastName: lastName,
            password: password
        }

        //actually send it to the endpoint
        const res = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        //enable submit btn again
        setSubmitBusy(submitBtn, false);

        if (res.ok) {
            // get the selected file
            const file = profilePictureInput?.files?.[0];

            if (file) {
                const fd = new FormData();
                // field name MUST match multer: upload.single('profile-picture')
                fd.append('profile-picture', file);

                const up = await fetch('/api/users/me/profile-picture', {
                    method: 'POST',
                    body: fd // do NOT set Content-Type; browser sets it with boundary
                });

                if (!up.ok) {
                    const msg = (await up.json().catch(()=>null))?.message || 'Avatar upload failed';
                    showAlert('error', msg);
                    return; // optionally stop redirect on failure
                }
            }

            sessionStorage.setItem('success', 'Success! You have been logged in');
            window.location.href = '/secure/dashboard.html';
        }
        else {
        // Request failed: show a friendly message without crashing
        let response;
        try { 
            response = await res.json(); 
        } 
        catch (e) {} //i believe all errors are processed properly in the if else statement below

            if (response && Array.isArray(response.errors)) {
                response.errors.forEach(e => showAlert('error', e?.msg || 'Invalid input'));
            } else if (response && response.message) {
                showAlert('error', response.message);
                return;
            } else {
                showAlert('error', `Request failed (${res.status}). Please try again.`);
                return;
            }
        }

    });
}



//<=======EXTRA FUNCTIONS========>
