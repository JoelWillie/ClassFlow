document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!Auth.isAuthenticated()) {
            window.location.href = 'intro.html';
            return;
        }

        const currentUser = await Auth.getCurrentUser();
        document.getElementById('user-display-name').textContent = currentUser.displayName;

        if (currentUser.isGuest) {
            const banner = document.createElement('div');
            banner.className = 'guest-banner';
            banner.style.cssText = 'position:fixed;top:70px;left:0;right:0;z-index:90;text-align:center;padding:0.75rem;';
            banner.innerHTML = '⚠️ Guest Mode - Your data is temporary. <a href="#" id="convert-link" style="color:#667eea;font-weight:600;">Convert to Account</a>';
            document.body.appendChild(banner);

            document.getElementById('convert-link').addEventListener('click', (e) => {
                e.preventDefault();
                UI.openModal('convert-guest-modal');
            });
        }

        await Theme.loadTheme();
        
        Theme.initThemeSelector();
        
        Animations.init();
        
        await Timetable.init();
        
        UI.init();
        
        await Notifications.init();
        
        UI.renderDashboard();
        
        console.log('ClassFlow initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize ClassFlow:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});
