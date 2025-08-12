export function setSubmitBusy(btn, busy) {
  if (!btn){
    return;
  } 
  btn.disabled = !!busy;
  btn.classList.toggle('opacity-50', busy);
  btn.classList.toggle('cursor-not-allowed', busy);
  btn.setAttribute('aria-busy', busy ? 'true' : 'false');
}

export function onSubmit(form, handler) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    await handler(fd);
  });
}

export function checkSubmit(btn, predicateFn) {
  const form = btn.form || btn.closest('form');
  const update = () => {
    const disabled = !predicateFn();
    btn.disabled = disabled;
    btn.classList.toggle('opacity-50', disabled);
    btn.classList.toggle('cursor-not-allowed', disabled);
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
  return update;
}