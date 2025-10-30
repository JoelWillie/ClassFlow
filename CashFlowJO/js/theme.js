const Theme = (function() {
    const THEME_KEY = 'selectedTheme';
    
    async function loadTheme() {
        const savedTheme = await DB.getSetting(THEME_KEY) || 'light';
        applyTheme(savedTheme);
    }

    function applyTheme(themeName) {
        const body = document.body;
        const oldTheme = body.getAttribute('data-theme');
        
        if (oldTheme !== themeName) {
            body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
            body.setAttribute('data-theme', themeName);
            
            if (typeof Animations !== 'undefined') {
                Animations.createToast(`Theme changed to ${themeName}!`, 'success');
            }
            
            setTimeout(() => {
                body.style.transition = '';
            }, 500);
        }
        
        DB.setSetting(THEME_KEY, themeName);
    }

    function initThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                
                option.style.animation = 'pulse 0.3s ease';
                setTimeout(() => {
                    option.style.animation = '';
                }, 300);
                
                applyTheme(theme);
                
                setTimeout(() => {
                    UI.closeModal('theme-modal');
                }, 400);
            });
        });
    }

    return {
        loadTheme,
        applyTheme,
        initThemeSelector
    };
})();
