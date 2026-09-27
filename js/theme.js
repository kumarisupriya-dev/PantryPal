const THEME_KEY = 'pantrypal_theme';
export function initTheme() {
    const lightBtn = document.getElementById('theme-light-btn');
    const darkBtn = document.getElementById('theme-dark-btn');
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);
    if (lightBtn && darkBtn) {
        lightBtn.addEventListener('click', () => applyTheme('light'));
        darkBtn.addEventListener('click', () => applyTheme('dark'));
    }
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkBtn?.classList.add('active');
            lightBtn?.classList.remove('active');
            localStorage.setItem(THEME_KEY, 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            lightBtn?.classList.add('active');
            darkBtn?.classList.remove('active');
            localStorage.setItem(THEME_KEY, 'light');
        }
    }
}