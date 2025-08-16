// Tailwind-based alert helper. Exports showAlert and also attaches it to the window for convenience.
export function showAlert(type = 'info', message = '', duration = 4000) {
  const alertVariants = {
    success: {
      bg: 'bg-green-100',
      fg: 'text-green-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8.25 10.922l-3.543-3.543a1 1 0 10-1.414 1.414l4.25 4.25a1 1 0 001.414 0l7.75-7.75z" clip-rule="evenodd"/>
        </svg>`
    },
    info: {
      bg: 'bg-blue-100',
      fg: 'text-blue-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9.75a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zM10 6.5a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
        </svg>`
    },
    warn: {
      bg: 'bg-yellow-100',
      fg: 'text-yellow-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099a1 1 0 013.486 0l6.514 11.591a1 1 0 01-.873 1.485H2.616a1 1 0 01-.873-1.485L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-5.75a.75.75 0 00-1.5 0v3.25a.75.75 0 001.5 0V7.25z" clip-rule="evenodd"/>
        </svg>`
    },
    error: {
      bg: 'bg-red-100',
      fg: 'text-red-800',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 7.53 6.47a.75.75 0 10-1.06 1.06L8.94 10l-2.47 2.47a.75.75 0 001.06 1.06L10 11.06l2.47 2.47a.75.75 0 001.06-1.06L11.06 10l2.47-2.47z" clip-rule="evenodd"/>
        </svg>`
    }
  };

  const box  = document.getElementById('app-alert');
  const icon = document.getElementById('alert-icon');
  const text = document.getElementById('alert-msg');

  box.classList.remove(
    'bg-green-100','bg-blue-100','bg-yellow-100','bg-red-100',
    'text-green-800','text-blue-800','text-yellow-800','text-red-800'
  );

  const v = alertVariants[type] || alertVariants.info;
  box.classList.add(v.bg, v.fg);

  icon.innerHTML = v.icon;
  text.textContent = message;

  box.classList.remove('hidden');
  clearTimeout(box._hideTimer);
  box._hideTimer = setTimeout(() => box.classList.add('hidden'), duration);
}

if (typeof window !== 'undefined') {
  window.showAlert = showAlert;
}

export default showAlert;