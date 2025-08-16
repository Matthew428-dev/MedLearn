// PSURF 2025 / MedLearn LMS / src / client / public / js / inquiries.js
import intlTelInput from 'intl-tel-input';
import { setSubmitBusy, onSubmit, checkSubmit } from '../lib/form-ui.js';
import {bindFirstNameHandlers,bindLastNameHandlers,bindCompanyNameHandlers,bindEmailHandlers} from '../lib/input-handlers.js';
import { showAlert } from '../lib/alerts.js';


/* <========= EVENTS ==========> */
let captchaOK = false; // default false, until the user passes the reCAPTCHA

const form = document.querySelector('.inquiry-card');
const submitBtn = form.querySelector('.btn-primary');
const refresh = checkSubmit(submitBtn, () => form.checkValidity() && captchaOK);

// FIRST NAME FORMATTING
const firstNameInput = document.getElementById("firstName");
bindFirstNameHandlers(firstNameInput, refresh);

// LAST NAME FORMATTING
const lastNameInput = document.getElementById("lastName");
bindLastNameHandlers(lastNameInput, refresh);

//COMPANY NAME FORMATTING
const companyNameInput = document.getElementById("companyName");
bindCompanyNameHandlers(companyNameInput, refresh);

//EMAIL FORMATTING
const emailInput = document.getElementById("email");
bindEmailHandlers(emailInput, refresh);

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
    npiInput.setCustomValidity('');
  });

  //only validate npi on blur
  npiInput.addEventListener('blur',e=>{
    //validateNPI does the whole npi check and shows the proper alert
    if(npiAttempted){
      //this might be a little confusing, but validateNPI shows the proper alerts, but also returns true/false, see main.js
      if(!validateNPI(npiInput.value)){
          npiInput.setCustomValidity('Invalid NPI');
      } 
      else {
        npiInput.setCustomValidity('');
      }
      refresh();
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
    numOfUsersInput.setCustomValidity('');
  });

  numOfUsersInput.addEventListener('blur',e=>{
    if(numOfUsersAttempted){
      const num = parseInt(e.target.value, 10);
      if(isNaN(num)){
        numOfUsersInput.setCustomValidity('Number of users must be a valid number');
        showAlert('error','Number of users must be a valid number');
      }
      else{
        numOfUsersInput.setCustomValidity('');
        if(num < 5){
          showAlert("warn","Are you sure there is less than 5 users? Be sure to include managers.");
        }
        else if(num > 150){
          showAlert("warn","Are you sure there are more than 150 users?");
        }
      }
      refresh();
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
    phoneInput.setCustomValidity('');
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
        phoneInput.setCustomValidity('');
      } else {
        phoneInput.setCustomValidity('Invalid ' + country.name + ' phone number');
        if(phoneNumberAttempted){
          showAlert("error","Invalid " + country.name + " phone number");
        }
      }
      refresh();
    });
  })();
}

// send submission data to the endpoint
//form variable defined at the top of events
if (form) {
  onSubmit(form, async fd => {
    //disables the submit btn
    setSubmitBusy(submitBtn, true);

    const recaptcha = grecaptcha.getResponse();
    if (!recaptcha) {
      setSubmitBusy(submitBtn, false);
      showAlert('error', 'Please complete the reCAPTCHA');
      return;
    }

    // collect & normalize form values
    const email = fd.get('email').trim().toLowerCase();
    const firstName = (fd.get('firstName').charAt(0).toUpperCase() + fd.get('firstName').slice(1).toLowerCase()).trim();
    const lastName = (fd.get('lastName').charAt(0).toUpperCase() + fd.get('lastName').slice(1).toLowerCase()).trim();
    const companyName = fd.get('companyName').trim().toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
    //const companyName = (fd.get('companyName').charAt(0).toUpperCase() + fd.get('companyName').slice(1).toLowerCase()).trim();
    const npi = fd.get('npi').trim();
    const inquiryType = fd.get('inquiryType');
    const numOfUsers = parseInt(fd.get('numOfUsers').trim(), 10);
    const msg = fd.get('msg').trim();
    const rawPhone = (fd.get('phoneNumber') || '').replace(/\D/g, "");

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

    //enables submit btn
    setSubmitBusy(submitBtn, false);

    if (res.ok) {
      grecaptcha.reset();
      captchaOK = false;
      refresh();
      showAlert("success", "Success! Inquiry received. Please allow 24-48 hours for a response.",6000);
    } else {
      const { errors } = await res.json();
      errors.forEach(err => showAlert('error', err.msg));
    }
  });
}

/*=======EXTRA HELPERS========*/

function captchaVerified () {
  captchaOK = true;
  refresh();
}
function captchaExpired () {
  captchaOK = false;
  refresh();
}

//validates npi format (as an extra safeguard) and also makes sure that the npi actually exists
async function validateNPI(rawNpi){
  const npi = rawNpi.replace(/\D/g,'').trim(); //extra safeguard to replace all non-digits with ''

  if(npi.length !== 10){ //another extra safeguard
    window.showAlert('error',"NPI must be exactly 10 digits long");
    return false; //later change this to return an error
  }


  //checks the npi database to see if the npi actually exists (see inquiriesRoute.js)
  const result = await fetch("/api/npi-validation/" + npi);
  const data = await result.json();

  if (!result.ok) {                      // network / validation error
    window.showAlert('error', data.msg || 'Error validating NPI');
    return false;
  }

  if (!data.valid) {                  // registry says NPI not found
    window.showAlert('error', "NPI doesn't exist");
    return false;
  }

  return true;
}

/* ------- export them to the global object ------- */
window.captchaVerified = captchaVerified;