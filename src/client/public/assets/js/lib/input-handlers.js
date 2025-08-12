export function bindFirstNameHandlers(input, refresh) {
  if (!input) return;
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\d/g, '');
    attempted = true;
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      window.disableSubmitBtn?.();
      window.showAlert('error', 'First name cannot be more than 100 characters');
    }
    refresh();
  });
}

export function bindLastNameHandlers(input, refresh) {
  if (!input) return;
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\d/g, '');
    attempted = true;
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      window.disableSubmitBtn?.();
      window.showAlert('error', 'Last name cannot be more than 100 characters');
    }
    refresh();
  });
}

export function bindCompanyNameHandlers(input, refresh) {
  if (!input) return;
  let attempted = false;
  input.addEventListener('input', () => {
    attempted = true;
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 100 && attempted) {
      window.disableSubmitBtn?.();
      window.showAlert('error', 'Company name cannot be more than 100 characters');
    }
    refresh();
  });
}

export function bindEmailHandlers(input, refresh) {
  if (!input) return;
  let attempted = false;
  input.addEventListener('input', e => {
    e.target.value = e.target.value.trim().toLowerCase();
    attempted = true;
    refresh();
  });
  input.addEventListener('blur', () => {
    if (input.value.length > 255 && attempted) {
      window.disableSubmitBtn?.();
      window.showAlert('error', 'Email cannot be more than 255 characters');
    }
    refresh();
  });
}