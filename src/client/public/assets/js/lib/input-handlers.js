//this file adds the event listeners for various input boxes
import { showAlert } from './alerts.js';
export function bindFirstNameHandlers(input, refresh) {
  if (!input){ 
    return;
  }
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\d/g, '');
    attempted = true;

    //have to check the length here so the form button doesn't get enabled
    if(input.value.length > 100){
      input.setCustomValidity("First name cannot be more than 100 characters");
    }
    else{
      input.setCustomValidity('');
    }
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      input.setCustomValidity('First name cannot be more than 100 characters');
      showAlert('error', 'First name cannot be more than 100 characters');
    }
    else {
      input.setCustomValidity('');
    }
    refresh();
  });
}

export function bindLastNameHandlers(input, refresh) {
  if (!input){ 
    return;
  }
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\d/g, '');
    attempted = true;

    if(input.value.length > 100){
      input.setCustomValidity("Last name cannot be more than 100 characters");
    }
    else{
      input.setCustomValidity("");
    }
    refresh();
  });

  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      input.setCustomValidity("Last name cannot be more than 100 characters");
      showAlert('error', 'Last name cannot be more than 100 characters');
    }else {
      input.setCustomValidity('');
    }
    refresh();
  });
}

export function bindCompanyNameHandlers(input, refresh) {
  if (!input){ 
    return;
  }
  let attempted = false;
  input.addEventListener('input', () => {
    attempted = true;
    if(input.value.length > 100){
      input.setCustomValidity("Company name cannot be more than 100 characters");
    }
    else{
      input.setCustomValidity('');
    }
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      input.setCustomValidity('Company name cannot be more than 100 characters');
      showAlert('error', 'Company name cannot be more than 100 characters');
    }
    else {
      input.setCustomValidity('');
    }
    refresh();
  });
}

export function bindEmailHandlers(input, refresh) {
  if (!input){
    return;
  } 
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.trim().toLowerCase();
    if(e.target.value.length > 255){
      input.setCustomValidity("Email cannot be more than 255 characters");
    }
    attempted = true;
    refresh();
  });
  input.addEventListener('blur', async () => {
    if (input.value.length > 255 && attempted) {
      input.setCustomValidity('Email cannot be more than 255 characters');
      showAlert('error', 'Email cannot be more than 255 characters');
    }
    else if (attempted && input.value) {
      try {
        const res = await fetch(`/api/mx-check/${encodeURIComponent(input.value)}`);
        const data = await res.json();
        console.log(data);
        if (!data.valid) {
          input.setCustomValidity("Email address doesn't exist");
          showAlert('error', "Email address doesn't exist");
        } else {
          input.setCustomValidity('');
        }
      } catch {
        input.setCustomValidity('');
      }
    }
    else {
      input.setCustomValidity('');
    }
    refresh();
  });
}

export function bindPasswordHandler(createPasswordInput, confirmPasswordInput, refresh){
  //safeguard in case html doc changes
  if(!createPasswordInput || !confirmPasswordInput){
    return;
  }

  //only show error if the user has attempted to enter a password (typed in 5 digits)
  let attempted = false;
  createPasswordInput.addEventListener('input', e=> {
    //don't allow spaces
    e.target.value = e.target.value.replace(/\s/g, '');
    if(e.target.value.length > 2 && confirmPasswordInput.value.length > 2){
      attempted = true;
    }
    if(e.target.value.length < 7){
      createPasswordInput.setCustomValidity("Password cannot be less than 7 characters");
    }
    else if(e.target.value.length > 128){
      createPasswordInput.setCustomValidity("Password cannot be more than 128 characters");
    }
    else{
      createPasswordInput.setCustomValidity('');
    }
    refresh();
    
  });

  confirmPasswordInput.addEventListener('input', e=> {
    //don't allow spaces
    e.target.value = e.target.value.replace(/\s/g, '');

    if(e.target.value.length > 2 && createPasswordInput.value.length > 2){
      attempted = true;
    }

    //have to check the length when the user inputs so the form isn't activated
    //otherwise it would activate on blur if one of the boxs contain a valid password
    if(e.target.value.length < 7){
      confirmPasswordInput.setCustomValidity("Password cannot be less than 7 characters");
    }
    else if(e.target.value.length > 128){
      confirmPasswordInput.setCustomValidity("Password cannot be more than 128 characters");
    }
    else{
      confirmPasswordInput.setCustomValidity('');
    }
    refresh();
  })

  //now show the error if the user unfocuses (blurs) the input box
  createPasswordInput.addEventListener('blur', e => {
    //if the user as attempted to create a password, check its length when the user blurs
    if(attempted){
      if(e.target.value.length < 7){ //length cannot be less than 7
        createPasswordInput.setCustomValidity("Password cannot be less than 7 characters");
        showAlert("error", "Password cannot be less than 7 characters");
      }
      else if(e.target.value.length > 128){ //length cannot be more than 128
        createPasswordInput.setCustomValidity("Password cannot be more than 128 characters");
        showAlert("error", "Password cannot be more than 128 characters");
      }
      else if(e.target.value !== confirmPasswordInput.value){ //passwords have to match
        createPasswordInput.setCustomValidity("Passwords must match");
        confirmPasswordInput.setCustomValidity("Passwords must match");
        showAlert("error","Passwords must match");
      }
      else{
        createPasswordInput.setCustomValidity('');
      }
      refresh();
    }
  });

  //have to do the same checks when the user blurs the confirm password input because
  //the user might input the password confirmation before the password creation (like a weirdo)
  confirmPasswordInput.addEventListener('blur', e => {
    //same rules as create password
    if(attempted){
      if(e.target.value.length < 7){
        confirmPasswordInput.setCustomValidity("Password cannot be less than 7 characters");
        showAlert("error","Password cannot be less than 7 characters");
      }
      else if(e.target.value.length > 128){
        confirmPasswordInput.setCustomValidity("Password cannot be more than 128 characters");
        showAlert("error", "Password cannot be more than 128 characters");
      }
      else if(e.target.value !== createPasswordInput.value){
        createPasswordInput.setCustomValidity("Passwords must match");
        confirmPasswordInput.setCustomValidity("Passwords must match");
        showAlert("error","Passwords must match");
      }
      else{
        confirmPasswordInput.setCustomValidity('');
      }
      refresh();
    }
  })


}

export function bindProfilePictureHandler(profilePictureInput, refresh){
  //TODO implement a profile picture preview and crop tool 
  //also you might need to process image here? Not sure

  const allowed = new Set(['image/jpeg','image/png','image/webp']);
  const maxBytes = 2 * 1024 * 1024; // 2 MB

  profilePictureInput?.addEventListener('change', () => {
    
    const file = profilePictureInput.files?.[0];

    if (!file) {
      //don't show any errors if no file was uploaded, as the pic is optional
      profilePictureInput.setCustomValidity(''); 
      refresh();
      return;
    }

    // type check
    if (!allowed.has(file.type)) {
      //no custom validity added because user doesn't have to upload a file
      profilePictureInput.value = ''; // clears the file
      showAlert('error','Only JPG/PNG/WebP file types are supported');
      refresh();
      return;
    }

    // size check
    if (file.size > maxBytes) {
      //no custom validity added because user doesn't have to upload a file
      profilePictureInput.value = ''; //clears the file
      showAlert('error','Max file size is 2 MB');
      refresh();
      return;
    }

    // valid
    profilePictureInput.setCustomValidity('');
    refresh();
  });
}
