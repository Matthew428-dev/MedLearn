import { setSubmitBusy, onSubmit, checkSubmit } from '../lib/form-ui.js';
import {bindFirstNameHandlers,bindLastNameHandlers,bindCompanyNameHandlers,bindEmailHandlers, bindPasswordHandler} from '../lib/input-handlers.js';
//<========EVENTS========>

//LOCKED INPUTS -> PULL INFO FROM DB
const companyNameInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const emailInput = document.getElementById("email");

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
        if (res.status === 410) { 
            window.showAlert('errorMsg','This invite link has expired');
            location.replace('/public/index.html');
            return;
        }
        if (!res.ok) { 
            window.showAlert('errorMsg','Invalid invite link');
            location.replace('/public/index.html');
            return; 
        }

        data = await res.json();
        
    } catch {
        window.showAlert("errorMsg","Network error. Try again. If this problem persists contact support");
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

    //unlocked inputs (but pre-filled)
    if(data.firstName && firstNameInput){
        firstNameInput.value = data.firstName;
    }
    if(data.lastName && lastNameInput){
        lastNameInput.value = data.lastName;
    }

});

//TODO: implement UI validation and show alerts
//bind the corresponding event listeners
bindCompanyNameHandlers(companyNameInput, refresh);
bindEmailHandlers(emailInput, refresh);
bindFirstNameHandlers(firstNameInput, refresh);
bindLastNameHandlers(lastNameInput, refresh);
bindPasswordHandler(createPasswordInput,confirmPasswordInput,refresh);

//submit btn defined near top of file
submitBtn.addEventListener('click', async => {
    if(form){
        //TODO: send the data to the endpoint
        //Note: This needs to create the user AND the company





    }
});


//<=======EXTRA FUNCTIONS========>
