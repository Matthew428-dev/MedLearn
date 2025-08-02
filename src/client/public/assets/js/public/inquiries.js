// PSURF 2025 / MedLearn LMS / src / client / public / js / inquiries.js
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

/* <========= EVENTS ==========> */
let captchaOK = false; // default false, until the user passes the reCAPTCHA

document.addEventListener('DOMContentLoaded',()=>{
  checkSubmitBtn(); // initial check to enable/disable submit button
});

const form = document.querySelector(".inquiry-card");
form.addEventListener('input', () => {
  checkSubmitBtn();
});

// FIRST NAME FORMATTING
let firstNameAttempted = false;
const firstNameInput = document.getElementById("firstName");

if(firstNameInput){
  firstNameInput.addEventListener("input", () => {
    firstNameAttempted = true;
  });

  firstNameInput.addEventListener("blur", () => {

    if(firstNameInput.value.length > 100 && firstNameAttempted){
      disableSubmitBtn();
      window.showAlert("error","First name cannot be more than 100 characters");
    }
  });
}

// LAST NAME FORMATTING
let lastNameAttempted = false;
const lastNameInput = document.getElementById("lastName");

if(lastNameInput){
  lastNameInput.addEventListener("input", () => {
    lastNameAttempted = true;
  });

  lastNameInput.addEventListener("blur", () => {
    if(lastNameInput.value.length > 100 && lastNameAttempted){
      disableSubmitBtn();
      window.showAlert("error","Last name cannot be more than 100 characters");
    }
  });
}

//COMPANY NAME FORMATTING
let companyNameAttempted = false;
const companyNameInput = document.getElementById("companyName");

if(companyNameInput){
  companyNameInput.addEventListener("input", () => {
    companyNameAttempted = true;
  });

  companyNameInput.addEventListener("blur", () => {
    if(companyNameInput.value.length > 100 && companyNameAttempted){
      disableSubmitBtn();
      window.showAlert("error","Company name cannot be more than 100 characters");
    }
  });
}

// NPI FORMATTING
let npiAttempted = false;
const npiInput = document.getElementById('npi');

if (npiInput) {

  //only allow digits, no longer than 10 digits, as the user types
  npiInput.addEventListener('input', e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    e.target.value = digits;
    if(e.target.value.length > 3){
      npiAttempted = true;
    }
  });

  //only validate npi on blur
  npiInput.addEventListener('blur',e=>{
    //validateNPI does the whole npi check and shows the proper alert
    if(npiAttempted){
      validateNPI(npiInput.value);
    }
  })

}


//NUM OF USERS FORMATTING
let numOfUsersAttempted = false;
const numOfUsersInput = document.getElementById('numOfUsers');

if(numOfUsersInput){
  numOfUsersInput.addEventListener('input',e=>{
    e.target.value = e.target.value.replace(/\D/g,'');
    if(e.target.value.length > 0){
      numOfUsersAttempted = true;
    }
  });

  numOfUsersInput.addEventListener('blur',e=>{
    if(numOfUsersAttempted){
      const num = parseInt(e.target.value, 10);
      if(isNaN(num)){
        window.showAlert('error','Number of users must be a valid number');
        disableSubmitBtn();
      }
      else if(num < 5){
        window.showAlert("warn","Are you sure there is less than 5 users? Be sure to include managers.");
      }
      else if(num > 150){
        window.showAlert("warn","Are you sure there are more than 150 users?");
      }
    }
  });
}

//PHONE FORMATTING
let phoneNumberAttempted = false;
const phoneInput = document.getElementById('phoneNumber');

if(phoneInput){

  phoneInput.addEventListener('input', e => {
    //don't allow the user to type non-digits
    e.target.value = e.target.value.replace(/\D/g, '');
    if(e.target.value.length > 2){
      phoneNumberAttempted = true;
    }
  });

  //phone number formatting and pattern validity
  (async function initInquiryPage() {
    //had to do some weird import stuff to get the library to work with parcel
    const utilsModule = await import('intl-tel-input/build/js/utils.js');
    window.intlTelInputUtils = utilsModule.default ?? utilsModule;

    // Initialize the plugin
    const iti = intlTelInput(phoneInput, {
      initialCountry: 'auto',
      geoIpLookup: cb =>
        fetch('https://ipinfo.io/json')
          .then(r => r.json())
          .then(d => cb(d.country))
          .catch(() => cb('us')),
      separateDialCode: true,
      nationalMode: true,
      placeholderNumberType: 'MOBILE'
    });

    // format on blur using the library
    phoneInput.addEventListener('blur', () => {
      // strip non-digits
      const raw = phoneInput.value.replace(/\D/g, '');
      const country = iti.getSelectedCountryData();

      // full phone number with country code
      const fullNumber = `+${country.dialCode}${raw}`;

      // use the utils methods directly
      const utils = window.intlTelInputUtils;
      if (utils.isValidNumber(fullNumber, country.iso2)) {
        // format it nicely
        const formatted = utils.formatNumber(
          fullNumber,
          country.iso2,
          utils.numberFormat.NATIONAL
        );
        phoneInput.value = formatted;
      } else {
        disableSubmitBtn();
        if(phoneNumberAttempted){
          window.showAlert("error","Invalid " + country.name + " phone number");
        }
      }
    });
  })();
}

// send submission data to the endpoint
//form variable defined at the top of events
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    disableSubmitBtn(); //just prevents double clicks

    // collect & normalize form values
    const email = form.email.value.trim().toLowerCase();
    const firstName = (form.firstName.value.charAt(0).toUpperCase() + form.firstName.value.slice(1).toLowerCase()).trim();
    const lastName = (form.lastName.value.charAt(0).toUpperCase() + form.lastName.value.slice(1).toLowerCase()).trim();
    const companyName = (form.companyName.value.charAt(0).toUpperCase() + form.companyName.value.slice(1).toLowerCase()).trim();
    const npi = form.npi.value.trim();
    const inquiryType = form.inquiryType.value;
    const numOfUsers = parseInt(form.numOfUsers.value.trim(), 10);
    const msg = form.msg.value.trim();
    const rawPhone = phoneInput.value.replace(/\D/g, "");
    const recaptcha = grecaptcha.getResponse();

    // build payload
    const payload = {
      email,
      firstName,
      lastName,
      companyName,
      npi,
      inquiryType,
      numOfUsers,
      msg,
      recaptcha
    };

    if (rawPhone) {
      payload.phoneNumber = rawPhone; //only include the phone number if the user entered one
    }

    // send to API
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      //form.reset();
      showAlert("success", "Success! Inquiry received. Please allow 24-48 hours for a response.",8000);
    } else {
      disableSubmitBtn();
      const { errors } = await res.json();
      const messages = errors.map(e => e.msg);
      for(let i = 0; i < messages.length;i++){
        window.showAlert('error',messages[i]);
      }
    }
  });
}

/*=======EXTRA HELPERS========*/

//validates npi format (as an extra safeguard) and also makes sure that the npi actually exists
async function validateNPI(rawNpi){
  const npi = rawNpi.replace(/\D/g,'').trim(); //extra safeguard to replace all non-digits with ''

  if(npi.length !== 10){ //another extra safeguard
    disableSubmitBtn();
    window.showAlert('error',"NPI must be exactly 10 digits long");
    return false; //later change this to return an error
  }


  //checks the npi database to see if the npi actually exists (see inquiriesRoute.js)
  const result = await fetch("/api/npi-validation/" + npi);
  const data = await result.json();

  if (!result.ok) {                      // network / validation error
    disableSubmitBtn();
    window.showAlert('error', data.msg || 'Error validating NPI');
    return false;
  }

  if (!data.valid) {                  // registry says NPI not found
    disableSubmitBtn();
    window.showAlert('error', "NPI doesn't exist");
    return false;
  }

  return true;
}

function disableSubmitBtn(){
  const submitBtn = document.querySelector(".btn-primary");
  if(!submitBtn){
    return;
  }
  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-50','cursor-not-allowed');
  submitBtn.style.backgroundColor = '#4b5563';
}

function enableSubmitBtn() {
  const submitBtn = document.querySelector(".btn-primary");
  if(!submitBtn){
    return;
  }
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50','cursor-not-allowed');
  submitBtn.style.backgroundColor = '';

}

function captchaVerified () {
  captchaOK = true;
  checkSubmitBtn();
}
function captchaExpired () {
  captchaOK = false;
  checkSubmitBtn();
}

/* ------- export them to the global object ------- */
window.captchaVerified = captchaVerified;
window.captchaExpired  = captchaExpired;

function checkSubmitBtn(){
  const {email,firstName,lastName,companyName,npi,numOfUsers,inquiryType} = form.elements;
  const allFilled = email.value.trim() && firstName.value.trim() && lastName.value.trim() && companyName.value.trim() && npi.value.trim() && numOfUsers.value.trim() && inquiryType.value.trim();
  
  if(allFilled && captchaOK){
    enableSubmitBtn();
  }
  else{
    disableSubmitBtn();
  }

}