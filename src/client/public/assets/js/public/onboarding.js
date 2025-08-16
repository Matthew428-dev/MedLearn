import { setSubmitBusy, onSubmit, checkSubmit } from '../lib/form-ui.js';
import { showAlert } from '../lib/alerts.js';
import {bindFirstNameHandlers,bindLastNameHandlers,bindCompanyNameHandlers,bindEmailHandlers, bindPasswordHandler} from '../lib/input-handlers.js';
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

document.addEventListener('DOMContentLoaded', async e => {
    
    const token = new URLSearchParams(location.search).get('token');
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

    let data;
    try {
        const res = await fetch(`/api/public/onboarding.html?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
            let msg = res.statusText;
            try { const body = await res.json(); msg = body.message || msg; } catch {}
            sessionStorage.setItem('errorMsg', msg);
            location.replace('/public/index.html');
            return;
        }

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

        if(res.ok){
            //redirect the user to the dashboard if the onboarding is successful
            window.location.href = "/secure/dashboard.html";
            sessionStorage.setItem("success","Success! You have been logged in");
        }
        else{
            const { errors } = await res.json();
            errors.forEach(err => showAlert('error', err.msg));
        }
    });
}



//<=======EXTRA FUNCTIONS========>
