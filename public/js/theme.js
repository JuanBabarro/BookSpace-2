// Theme Manager
(function () {
    // Apply theme immediately to prevent screen flash
    const savedTheme = localStorage.getItem('theme');
    const themeToApply = savedTheme || 'dark';
    
    if (themeToApply === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    // When DOM is fully loaded, attach toggle button listeners
    document.addEventListener('DOMContentLoaded', () => {
        setupThemeToggles();
    });

    function setupThemeToggles() {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        updateButtonsIcon(document.documentElement.classList.contains('light-mode'));

        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isLight = document.documentElement.classList.toggle('light-mode');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateButtonsIcon(isLight);
            });
        });
    }

    function updateButtonsIcon(isLight) {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        toggleButtons.forEach(btn => {
            const iconSpan = btn.querySelector('.iconify');
            if (iconSpan) {
                // In light mode, show a moon to toggle to dark. In dark mode, show a sunny icon.
                iconSpan.setAttribute('data-icon', isLight ? 'mdi:weather-night' : 'mdi:weather-sunny');
            }
        });
    }
})();
