// PSURF 2025 / MedLearn LMS / src / client / public / js / inquiries.js
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

/* <========= EVENTS ==========> */
document.addEventListener('DOMContentLoaded',()=>{
  disableSubmitBtn();
});

const form = document.querySelector(".inquiry-card");
form.addEventListener('input', () => {
  //TODO finish this, not quite working. Just trying to disable the btn by default
  const {email,firstName,lastName,companyName,npi,numOfUsers,inquiryType} = form.elements;
  const allFilled = email.value.trim() && firstName.value.trim() && lastName.value.trim() && companyName.value.trim() && npi.value.trim() && numOfUsers.value.trim() && inquiryType.value.trim();
  if(!allFilled){
    disableSubmitBtn();
  }
  else{
    enableSubmitBtn();
  }
});

const firstNameInput = document.getElementById("firstName");
firstNameInput.addEventListener("blur", e => {
  if(firstNameInput.value.length > 100){
    disableSubmitBtn();
    window.showAlert("error","First name cannot be more than 100 characters");
  }
});

const lastNameInput = document.getElementById("lastName");
lastNameInput.addEventListener("blur", e=>{
  if(lastNameInput.value.length > 100){
    disableSubmitBtn();
    window.showAlert("error","Last name cannot be more than 100 characters");
  }
});

/*const companyNameInput = document.getElementById("companyName");
companyNameInput.addEventListener("blur",e => {
  if(companyNameInput.value.length > 100){
    disableSubmitBtn();
    window.showAlert("error","Company name cannot be more than 100 characters");
  }
})*/


// NPI formatting
const npiInput = document.getElementById('npi');
if (npiInput) {

  //only allow digits, no longer than 10 digits, as the user types
  npiInput.addEventListener('input', e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    e.target.value = digits;
  });

  //only validate npi on blur
  npiInput.addEventListener('blur',e=>{
    //validateNPI does the whole npi check and shows the proper alert
    validateNPI(npiInput.value);
  })

}


//num of users formatting
const numOfUsersInput = document.getElementById('numOfUsers');
if(numOfUsersInput){
  numOfUsersInput.addEventListener('input',e=>{
    e.target.value = e.target.value.replace(/\D/g,'');
  });
}

//phone formatting
const phoneInput = document.getElementById('phoneNumber');
if(phoneInput){

  phoneInput.addEventListener('input', e => {
    //don't allow the user to type non-digits
    e.target.value = e.target.value.replace(/\D/g, '');
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
        window.showAlert("error","Invalid " + country.name + " phone number");
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

function enableSubmitBtn(){
  const submitBtn = document.querySelector(".btn-primary");
  if(!submitBtn){
    return;
  }
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50','cursor-not-allowed');
  submitBtn.style.backgroundColor = '';

}